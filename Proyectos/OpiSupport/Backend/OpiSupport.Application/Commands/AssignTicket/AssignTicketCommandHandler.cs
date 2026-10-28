using MediatR;
using OpiSupport.Application.DTOs;
using OpiSupport.Application.Interfaces;
using OpiSupport.Application.Interfaces.Repositories;
using OpiSupport.Application.Shared;
using OpiSupport.Domain.Entities;

namespace OpiSupport.Application.Commands.AssignTicket
{
    public class AssignTicketCommandHandler : IRequestHandler<AssignTicketCommand, Result<TicketDetailDto>>
    {
        private readonly ITicketRepository _ticketRepository;
        private readonly IUserRepository _userRepository;
        private readonly IStatusHistoryRepository _statusHistoryRepository;
        private readonly IUnitOfWork _unitOfWork;

        public AssignTicketCommandHandler(
            ITicketRepository ticketRepository,
            IUserRepository userRepository,
            IStatusHistoryRepository statusHistoryRepository,
            IUnitOfWork unitOfWork)
        {
            _ticketRepository = ticketRepository;
            _userRepository = userRepository;
            _statusHistoryRepository = statusHistoryRepository;
            _unitOfWork = unitOfWork;
        }

        public async Task<Result<TicketDetailDto>> Handle(AssignTicketCommand request, CancellationToken cancellationToken)
        {
            // 1. Solo Supervisor o Sistema pueden reasignar
            if (request.Role != "Supervisor" && request.Role != "Sistema")
                return Result<TicketDetailDto>.Failure("Solo los supervisores pueden reasignar tickets");

            // 2. El ticket debe existir
            var ticket = await _ticketRepository.GetByIdAsync(request.TicketId, cancellationToken);
            if (ticket == null)
                return Result<TicketDetailDto>.Failure("Ticket no encontrado");

            // 3. El técnico debe existir, estar activo y tener rol Tecnico
            var technician = await _userRepository.GetByIdAsync(request.TechnicianId, cancellationToken);
            if (technician == null || !technician.IsActive || technician.Role != "Tecnico")
                return Result<TicketDetailDto>.Failure("El técnico especificado no es válido o no está activo");

            // 4. Guardar el estado y el técnico anteriores (para el historial)
            var previousStatus = ticket.Status;
            var previousTechnicianName = ticket.AssignedToUser?.FullName ?? "Sin asignar";

            // 5. Asignar el nuevo técnico
            ticket.AssignedToId = technician.Id;

            // 6. Regla acordada: si el ticket estaba Abierto pasa a Asignado.
            //    En cualquier otro estado (Asignado, En Proceso, Reabierto, Resuelto, Cerrado)
            //    se conserva el estado actual.
            if (ticket.Status == "Abierto")
                ticket.Status = "Asignado";

            // 7. Registrar la reasignación en el historial del ticket
            var history = new StatusHistory
            {
                TicketId = ticket.Id,
                ChangedByUserId = request.UserId,
                PreviousStatus = previousStatus,
                NewStatus = ticket.Status,
                Note = $"Reasignado de {previousTechnicianName} a {technician.FullName}",
                ChangedAt = DateTime.UtcNow
            };
            await _statusHistoryRepository.AddAsync(history, cancellationToken);

            // 8. Guardar cambios
            //    La entidad ya está siendo rastreada por EF Core (GetByIdAsync usa el mismo DbContext),
            //    pero se marca explícitamente como modificada para que quede claro en el código.
            _ticketRepository.Update(ticket);
            await _unitOfWork.SaveChangesAsync(cancellationToken);

            // 9. Devolver el detalle actualizado
            var updatedTicket = await _ticketRepository.GetByIdAsync(ticket.Id, cancellationToken);

            return Result<TicketDetailDto>.Success(new TicketDetailDto
            {
                Id = updatedTicket!.Id,
                Title = updatedTicket.Title,
                Description = updatedTicket.Description,
                Status = updatedTicket.Status,
                Priority = updatedTicket.Priority,
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
    }
}
