using MediatR;
using OpiSupport.Application.DTOs;
using OpiSupport.Application.Interfaces;
using OpiSupport.Application.Interfaces.Repositories;
using OpiSupport.Application.Services;
using OpiSupport.Application.Shared;
using OpiSupport.Domain.Entities;

namespace OpiSupport.Application.Commands.UpdateTicketClassification
{
    /// <summary>
    /// Permite al perfil Sistema (SYS) corregir la categoría y/o la prioridad
    /// de un ticket, en cualquier estado.
    ///
    /// Reglas que aplica:
    ///  1. Solo el rol "Sistema" puede ejecutarlo (se valida aquí, no solo en el controlador).
    ///  2. El motivo es obligatorio (10 a 300 caracteres) y queda en el historial.
    ///  3. Si cambia la categoría, el técnico actual se conserva solo si tiene la nueva
    ///     especialidad. Si no la tiene, se reasigna con la misma regla que usa la
    ///     creación de tickets. Los tickets Resuelto/Cerrado conservan su técnico
    ///     para no alterar los reportes de SLA por técnico.
    ///  4. Si cambia la prioridad, el SLA se recalcula desde CreatedAt y el historial
    ///     guarda el plazo anterior y el nuevo (auditoría).
    /// </summary>
    public class UpdateTicketClassificationCommandHandler
        : IRequestHandler<UpdateTicketClassificationCommand, Result<TicketDetailDto>>
    {
        private const int MinReasonLength = 10;
        private const int MaxReasonLength = 300;

        private static readonly string[] ValidPriorities = { "Baja", "Media", "Alta", "Crítica" };
        private static readonly string[] FinalizedStatuses = { "Resuelto", "Cerrado" };

        private readonly ITicketRepository _ticketRepository;
        private readonly ICategoryRepository _categoryRepository;
        private readonly ITechnicianSpecialtyRepository _specialtyRepository;
        private readonly IStatusHistoryRepository _statusHistoryRepository;
        private readonly IUnitOfWork _unitOfWork;
        private readonly TicketAssignmentService _assignmentService;

        public UpdateTicketClassificationCommandHandler(
            ITicketRepository ticketRepository,
            ICategoryRepository categoryRepository,
            ITechnicianSpecialtyRepository specialtyRepository,
            IStatusHistoryRepository statusHistoryRepository,
            IUnitOfWork unitOfWork,
            TicketAssignmentService assignmentService)
        {
            _ticketRepository = ticketRepository;
            _categoryRepository = categoryRepository;
            _specialtyRepository = specialtyRepository;
            _statusHistoryRepository = statusHistoryRepository;
            _unitOfWork = unitOfWork;
            _assignmentService = assignmentService;
        }

        public async Task<Result<TicketDetailDto>> Handle(
            UpdateTicketClassificationCommand request,
            CancellationToken cancellationToken)
        {
            // 1. Permiso: únicamente el perfil Sistema (SYS)
            if (request.Role != "Sistema")
                return Result<TicketDetailDto>.Failure(
                    "Solo el perfil Sistema puede cambiar la clasificación de un ticket.");

            // 2. Validar el motivo (obligatorio y con longitud razonable)
            var reason = (request.Reason ?? string.Empty).Trim();
            if (reason.Length < MinReasonLength)
                return Result<TicketDetailDto>.Failure(
                    $"El motivo es obligatorio y debe tener al menos {MinReasonLength} caracteres.");
            if (reason.Length > MaxReasonLength)
                return Result<TicketDetailDto>.Failure(
                    $"El motivo no puede superar los {MaxReasonLength} caracteres.");

            // 3. Validar la prioridad recibida
            var priority = (request.Priority ?? string.Empty).Trim();
            if (!ValidPriorities.Contains(priority))
                return Result<TicketDetailDto>.Failure(
                    "La prioridad debe ser Baja, Media, Alta o Crítica.");

            // 4. El ticket debe existir
            var ticket = await _ticketRepository.GetByIdAsync(request.TicketId, cancellationToken);
            if (ticket == null)
                return Result<TicketDetailDto>.Failure("Ticket no encontrado.");

            // 5. La categoría destino debe existir
            var newCategory = await _categoryRepository.GetByIdAsync(request.CategoryId, cancellationToken);
            if (newCategory == null)
                return Result<TicketDetailDto>.Failure("La categoría seleccionada no existe.");

            // 6. Si no cambió nada, no se escribe en la base de datos
            var categoryChanged = ticket.CategoryId != newCategory.Id;
            var priorityChanged = !string.Equals(ticket.Priority, priority, StringComparison.Ordinal);
            if (!categoryChanged && !priorityChanged)
                return Result<TicketDetailDto>.Failure(
                    "No se detectaron cambios: la categoría y la prioridad son las mismas.");

            // Datos previos para el historial
            var statusBeforeChange = ticket.Status;
            var previousCategoryName = ticket.Category?.Name ?? "Sin categoría";
            var previousPriority = ticket.Priority;
            var previousDeadline = ticket.SLA_Deadline;
            var previousTechnicianName = ticket.AssignedToUser?.FullName ?? "Sin asignar";

            var changes = new List<string>();
            var assignmentNote = string.Empty;

            // 7. Cambio de categoría
            if (categoryChanged)
            {
                ticket.CategoryId = newCategory.Id;
                // Se actualiza también la navegación para que el DTO y el historial
                // usen el nombre nuevo sin depender de una recarga de EF Core.
                ticket.Category = newCategory;
                changes.Add($"Categoría: {previousCategoryName} → {newCategory.Name}");

                // Los tickets finalizados conservan su técnico: reasignarlos alteraría
                // los reportes de SLA y la trazabilidad del cierre.
                if (!FinalizedStatuses.Contains(ticket.Status))
                {
                    assignmentNote = await ReassignIfNeededAsync(
                        ticket, newCategory, previousTechnicianName, cancellationToken);
                }
            }

            // 8. Cambio de prioridad: recalcular el SLA desde la creación del ticket
            if (priorityChanged)
            {
                ticket.Priority = priority;
                ticket.SLA_Deadline = SlaCalculator.CalculateDeadline(ticket.CreatedAt, priority);
                changes.Add($"Prioridad: {previousPriority} → {priority}");
                changes.Add($"SLA: {FormatDeadline(previousDeadline)} → {FormatDeadline(ticket.SLA_Deadline)}");
            }

            // 9. El vencimiento solo se evalúa en tickets activos. En Resuelto/Cerrado
            //    se conserva el valor histórico que ya tenía el ticket.
            if (!FinalizedStatuses.Contains(ticket.Status))
                ticket.IsOverdue = DateTime.UtcNow > ticket.SLA_Deadline;

            // 10. Registrar el cambio en el historial, con el motivo obligatorio.
            //     El frontend resalta las entradas cuya nota empieza por "Clasificación actualizada".
            var noteParts = new List<string> { "Clasificación actualizada — " + string.Join(" · ", changes) };
            if (!string.IsNullOrEmpty(assignmentNote))
                noteParts.Add(assignmentNote);
            noteParts.Add($"Motivo: {reason}");

            var history = new StatusHistory
            {
                TicketId = ticket.Id,
                ChangedByUserId = request.UserId,
                PreviousStatus = statusBeforeChange,
                NewStatus = ticket.Status,
                Note = string.Join(". ", noteParts),
                ChangedAt = DateTime.UtcNow
            };
            await _statusHistoryRepository.AddAsync(history, cancellationToken);

            // 11. Guardar cambios
            _ticketRepository.Update(ticket);
            await _unitOfWork.SaveChangesAsync(cancellationToken);

            // 12. Devolver el detalle actualizado
            var updatedTicket = await _ticketRepository.GetByIdAsync(ticket.Id, cancellationToken);

            return Result<TicketDetailDto>.Success(new TicketDetailDto
            {
                Id = updatedTicket!.Id,
                Title = updatedTicket.Title,
                Description = updatedTicket.Description,
                Status = updatedTicket.Status,
                Priority = updatedTicket.Priority,
                CategoryId = updatedTicket.CategoryId,
                Category = updatedTicket.Category?.Name ?? "Sin categoría",
                Area = updatedTicket.Area?.Name ?? "Sin área",
                CreatedAt = updatedTicket.CreatedAt,
                SLA_Deadline = updatedTicket.SLA_Deadline,
                ResolvedAt = updatedTicket.ResolvedAt,
                AssignedToId = updatedTicket.AssignedToId,
                AssignedToFullName = updatedTicket.AssignedToUser?.FullName,
                CreatedByFullName = updatedTicket.CreatedByUser?.FullName ?? "Usuario desconocido",
                IsOverdue = updatedTicket.IsOverdue,
                ReopenCount = updatedTicket.ReopenCount ?? 0
            });
        }

        /// <summary>
        /// Ajusta el técnico después de un cambio de categoría.
        /// Devuelve una frase para el historial (vacía si no hubo que reasignar).
        /// </summary>
        private async Task<string> ReassignIfNeededAsync(
            Ticket ticket,
            Category newCategory,
            string previousTechnicianName,
            CancellationToken cancellationToken)
        {
            // Sin técnico asignado: se intenta la asignación automática.
            if (!ticket.AssignedToId.HasValue)
            {
                var technician = await _assignmentService.FindAvailableTechnicianAsync(
                    newCategory.Id, cancellationToken);

                if (technician == null)
                    return "Sin técnicos disponibles con la nueva especialidad: el ticket queda sin asignar";

                AssignTechnician(ticket, technician);
                return $"Reasignado de {previousTechnicianName} a {technician.FullName}";
            }

            // Con técnico: se conserva si ya tiene la nueva especialidad.
            var specialties = await _specialtyRepository.GetByTechnicianIdAsync(
                ticket.AssignedToId.Value, cancellationToken);

            if (specialties.Any(s => s.CategoryId == newCategory.Id))
                return $"El técnico {previousTechnicianName} conserva la asignación (ya tiene la nueva especialidad)";

            // No tiene la especialidad: se libera y se busca uno que sí la tenga.
            var replacement = await _assignmentService.FindAvailableTechnicianAsync(
                newCategory.Id, cancellationToken);

            if (replacement == null)
            {
                ticket.AssignedToId = null;
                ticket.AssignedToUser = null!;
                if (ticket.Status == "Asignado")
                    ticket.Status = "Abierto";

                return $"Sin técnicos disponibles con la nueva especialidad: {previousTechnicianName} quedó liberado y el ticket sin asignar";
            }

            AssignTechnician(ticket, replacement);
            return $"Reasignado de {previousTechnicianName} a {replacement.FullName}";
        }

        /// <summary>
        /// Asigna el técnico y, si el ticket estaba Abierto, lo pasa a Asignado.
        /// Es la misma regla que usa la reasignación manual.
        /// </summary>
        private static void AssignTechnician(Ticket ticket, User technician)
        {
            ticket.AssignedToId = technician.Id;
            ticket.AssignedToUser = technician;
            if (ticket.Status == "Abierto")
                ticket.Status = "Asignado";
        }

        /// <summary>
        /// Formatea una fecha de SLA para el historial (hora local, legible).
        /// </summary>
        private static string FormatDeadline(DateTime? deadline)
        {
            if (!deadline.HasValue)
                return "sin plazo";

            return deadline.Value.ToLocalTime().ToString("dd/MM/yyyy HH:mm");
        }
    }
}
