using MediatR;
using Microsoft.EntityFrameworkCore;
using OpiSupport.Application.DTOs;
using OpiSupport.Application.Interfaces.Repositories;
using OpiSupport.Application.Shared;

namespace OpiSupport.Application.Queries.GetTicketDetail
{
    public class GetTicketDetailQueryHandler : IRequestHandler<GetTicketDetailQuery, Result<TicketDetailDto>>
    {
        private readonly ITicketRepository _ticketRepository;

        public GetTicketDetailQueryHandler(ITicketRepository ticketRepository)
        {
            _ticketRepository = ticketRepository;
        }

        public async Task<Result<TicketDetailDto>> Handle(GetTicketDetailQuery request, CancellationToken cancellationToken)
        {
            // 1. Obtener el ticket con todas sus relaciones
            var ticket = await _ticketRepository.GetQueryable()
                .Include(t => t.Category)
                .Include(t => t.Area)
                .Include(t => t.CreatedByUser)
                .Include(t => t.AssignedToUser)
                .Include(t => t.Comments)
                .ThenInclude(c => c.User)          // ✅ Carga el User de cada comentario
                .Include(t => t.StatusHistories)
                .ThenInclude(h => h.ChangedByUser) // ✅ Opcional: también carga el ChangedByUser para el historial
                .FirstOrDefaultAsync(t => t.Id == request.TicketId, cancellationToken);

            if (ticket == null)
                return Result<TicketDetailDto>.Failure("Ticket no encontrado");

            // 2. Validar permisos según el rol
            if (request.Role == "Colaborador" && ticket.CreatedById != request.UserId)
                return Result<TicketDetailDto>.Failure("No tienes permiso para ver este ticket");

            if (request.Role == "Tecnico" && ticket.AssignedToId != request.UserId)
                return Result<TicketDetailDto>.Failure("No tienes permiso para ver este ticket");

            // 3. Mapear a DTO
            var dto = new TicketDetailDto
            {
                Id = ticket.Id,
                Title = ticket.Title,
                Description = ticket.Description,
                Status = ticket.Status,
                Priority = ticket.Priority,
                CategoryId = ticket.CategoryId,
                Category = ticket.Category?.Name ?? "Sin categoría",
                Area = ticket.Area?.Name ?? "Sin área",
                CreatedAt = ticket.CreatedAt,
                SLA_Deadline = ticket.SLA_Deadline,
                ResolvedAt = ticket.ResolvedAt,
                AssignedToId = ticket.AssignedToId,
                AssignedToFullName = ticket.AssignedToUser?.FullName,
                CreatedByFullName = ticket.CreatedByUser?.FullName ?? "Usuario desconocido",
                IsOverdue = ticket.IsOverdue,
                ReopenCount = ticket.ReopenCount ?? 0,
                // Comentarios
                Comments = ticket.Comments.Select(c => new CommentDto
                {
                    Id = c.Id,
                    Author = c.User?.FullName ?? "Usuario desconocido",
                    Text = c.Text,
                    CreatedAt = c.CreatedAt
                }).ToList(),

                // Historial de cambios
                History = ticket.StatusHistories.Select(h => new StatusHistoryDto
                {
                    Date = h.ChangedAt,
                    PreviousStatus = h.PreviousStatus,
                    NewStatus = h.NewStatus,
                    Note = h.Note,
                    User = h.ChangedByUser?.FullName ?? "Usuario desconocido"
                }).OrderBy(h => h.Date).ToList()
            };

            return Result<TicketDetailDto>.Success(dto);
        }
    }
}

