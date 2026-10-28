using MediatR;
using OpiSupport.Application.DTOs;
using OpiSupport.Application.Interfaces;
using OpiSupport.Application.Interfaces.Repositories;
using OpiSupport.Application.Shared;
using OpiSupport.Domain.Entities;
using OpiSupport.Domain.Shared;

namespace OpiSupport.Application.Commands.ChangeTicketStatus
{
    public class ChangeTicketStatusCommandHandler : IRequestHandler<ChangeTicketStatusCommand, Result<TicketDetailDto>>
    {
        private readonly ITicketRepository _ticketRepository;
        private readonly IUserRepository _userRepository;
        private readonly IStatusHistoryRepository _statusHistoryRepository;
        private readonly ICommentRepository _commentRepository;
        private readonly IUnitOfWork _unitOfWork;

        public ChangeTicketStatusCommandHandler(
            ITicketRepository ticketRepository,
            IUserRepository userRepository,
            IStatusHistoryRepository statusHistoryRepository,
            ICommentRepository commentRepository,
            IUnitOfWork unitOfWork)
        {
            _ticketRepository = ticketRepository;
            _userRepository = userRepository;
            _statusHistoryRepository = statusHistoryRepository;
            _commentRepository = commentRepository;
            _unitOfWork = unitOfWork;
        }

        public async Task<Result<TicketDetailDto>> Handle(ChangeTicketStatusCommand request, CancellationToken cancellationToken)
        {
            // 1. Obtener el ticket con sus relaciones
            var ticket = await _ticketRepository.GetByIdAsync(request.TicketId, cancellationToken);
            if (ticket == null)
                return Result<TicketDetailDto>.Failure("Ticket no encontrado");

            // 2. Validar permisos según el rol
            if (request.Role == "Colaborador" && ticket.CreatedById != request.UserId)
                return Result<TicketDetailDto>.Failure("No tienes permiso para modificar este ticket");

            if (request.Role == "Tecnico" && ticket.AssignedToId != request.UserId)
                return Result<TicketDetailDto>.Failure("No tienes permiso para modificar este ticket");

            // 3. Validar la transición contra la máquina de estados (única fuente de verdad)
            if (!TicketStatusTransitions.CanTransition(ticket.Status, request.NewStatus))
                return Result<TicketDetailDto>.Failure($"No se puede pasar de '{ticket.Status}' a '{request.NewStatus}'");

            // 4. El colaborador solo puede reabrir sus propios tickets
            if (request.Role == "Colaborador" && request.NewStatus != "Reabierto")
                return Result<TicketDetailDto>.Failure("Como colaborador solo puedes reabrir un ticket resuelto o cerrado");

            // 5. Guardar el estado anterior para el historial
            string previousStatus = ticket.Status;

            // 6. Reglas de la reapertura
            if (request.NewStatus == "Reabierto")
            {
                // 6.1. Plazo de 48 horas desde la última resolución
                if (!ticket.ResolvedAt.HasValue || (DateTime.UtcNow - ticket.ResolvedAt.Value).TotalHours > 48)
                    return Result<TicketDetailDto>.Failure("El plazo para reabrir el ticket ha expirado (máximo 48 horas)");

                // 6.2. Si el técnico ya acumula 2 o más tickets reabiertos, el ticket queda sin asignar
                if (ticket.AssignedToId.HasValue)
                {
                    var reopenedCount = _ticketRepository.GetQueryable()
                        .Count(t => t.AssignedToId == ticket.AssignedToId && t.Status == "Reabierto");

                    if (reopenedCount >= 2)
                        ticket.AssignedToId = null;
                }
            }

            // 7. Resolver SIEMPRE exige un comentario de resolución,
            // sin importar el rol de quien lo hace (Tecnico, Supervisor o Sistema).
            if (request.NewStatus == "Resuelto" && string.IsNullOrWhiteSpace(request.Comment))
                return Result<TicketDetailDto>.Failure("Debe proporcionar un comentario de resolución");

            // 8. Actualizar el estado del ticket
            ticket.Status = request.NewStatus;

            // 9. Actualizar campos especiales según el estado
            if (request.NewStatus == "En Proceso" && !ticket.StartedAt.HasValue)
                ticket.StartedAt = DateTime.UtcNow;

            // Se refresca en CADA resolución: si el ticket se reabre y se vuelve a resolver,
            // la fecha de resolución debe ser la nueva, no la de la primera vez.
            if (request.NewStatus == "Resuelto")
                ticket.ResolvedAt = DateTime.UtcNow;

            // 10. Incrementar contador de reaperturas si es Reabierto
            if (request.NewStatus == "Reabierto")
                ticket.ReopenCount = (ticket.ReopenCount ?? 0) + 1;

            // 10. Guardar el cambio en el historial
            var history = new StatusHistory
            {
                TicketId = ticket.Id,
                ChangedByUserId = request.UserId,
                PreviousStatus = previousStatus,
                NewStatus = request.NewStatus,
                ChangedAt = DateTime.UtcNow
            };
            await _statusHistoryRepository.AddAsync(history, cancellationToken);

            // 10.1. Persistir el comentario de resolución (antes se pedía y se descartaba)
            if (request.NewStatus == "Resuelto" && !string.IsNullOrWhiteSpace(request.Comment))
            {
                var resolutionComment = new Comment
                {
                    TicketId = ticket.Id,
                    UserId = request.UserId,
                    Text = request.Comment.Trim(),
                    CreatedAt = DateTime.UtcNow
                };
                await _commentRepository.AddAsync(resolutionComment, cancellationToken);
            }

            // 11. Guardar todos los cambios (estado, historial y comentario en una sola operación)
            await _unitOfWork.SaveChangesAsync(cancellationToken);

            // 12. Devolver el ticket actualizado
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
                IsOverdue = updatedTicket.IsOverdue
            });
        }
    }
}