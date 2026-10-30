using MediatR;
using Microsoft.EntityFrameworkCore;
using OpiSupport.Application.DTOs;
using OpiSupport.Application.Interfaces.Repositories;
using OpiSupport.Application.Shared;
using OpiSupport.Domain.Entities;

namespace OpiSupport.Application.Queries.GetTicketList
{
    public class GetTicketListQueryHandler : IRequestHandler<GetTicketListQuery, Result<PagedResult<TicketListDto>>>
    {
        // Tope de seguridad: nadie puede pedir una página gigante.
        private const int MaxPageSize = 100;

        private readonly ITicketRepository _ticketRepository;

        public GetTicketListQueryHandler(ITicketRepository ticketRepository)
        {
            _ticketRepository = ticketRepository;
        }

        public async Task<Result<PagedResult<TicketListDto>>> Handle(GetTicketListQuery request, CancellationToken cancellationToken)
        {
            try
            {
                // Normalizar la paginación recibida
                var page = request.Page < 1 ? 1 : request.Page;
                var size = request.Size < 1 ? 10 : Math.Min(request.Size, MaxPageSize);

                // ✅ Usamos IQueryable<Ticket> explícitamente
                IQueryable<Ticket> ticketsQuery = _ticketRepository.GetQueryable()
                    .Include(t => t.Category)
                    .Include(t => t.Area)
                    .Include(t => t.CreatedByUser)
                    .Include(t => t.AssignedToUser);

                // Aplicar filtros según el rol
                ticketsQuery = ApplyRoleFilters(ticketsQuery, request);

                // Aplicar filtros adicionales (Status, Priority, etc.)
                ticketsQuery = ApplyAdditionalFilters(ticketsQuery, request);

                // Contar ANTES de paginar, con los mismos filtros aplicados
                var totalItems = await ticketsQuery.CountAsync(cancellationToken);

                // Aplicar ordenamiento y paginación
                var tickets = await ticketsQuery
                    .OrderByDescending(t => t.CreatedAt)
                    .Skip((page - 1) * size)
                    .Take(size)
                    .ToListAsync(cancellationToken);

                // Mapear a DTOs
                var dtos = tickets.Select(t => new TicketListDto
                {
                    Id = t.Id,
                    Title = t.Title,
                    Status = t.Status,
                    Priority = t.Priority,
                    Category = t.Category?.Name ?? "Sin categoría",
                    Area = t.Area?.Name ?? "Sin área",
                    CreatedAt = t.CreatedAt,
                    AssignedToFullName = t.AssignedToUser?.FullName,
                    CreatedByFullName = t.CreatedByUser?.FullName ?? "Usuario desconocido",
                    IsOverdue = t.IsOverdue
                }).ToList();

                // Devolver los datos junto con los metadatos de paginación
                return Result<PagedResult<TicketListDto>>.Success(
                    PagedResult<TicketListDto>.Create(dtos, totalItems, page, size));
            }
            catch (Exception ex)
            {
                return Result<PagedResult<TicketListDto>>.Failure($"Error al obtener los tickets: {ex.Message}");
            }
        }

        private IQueryable<Ticket> ApplyRoleFilters(IQueryable<Ticket> query, GetTicketListQuery request)
        {
            if (request.Role == "Colaborador")
            {
                query = query.Where(t => t.CreatedById == request.UserId);
            }
            else if (request.Role == "Tecnico")
            {
                query = query.Where(t => t.AssignedToId == request.UserId);
            }
            // Supervisor: no se aplica filtro, ve todos

            return query;
        }

        private IQueryable<Ticket> ApplyAdditionalFilters(IQueryable<Ticket> query, GetTicketListQuery request)
        {
            if (!string.IsNullOrEmpty(request.Status))
                query = query.Where(t => t.Status == request.Status);

            if (!string.IsNullOrEmpty(request.Priority))
                query = query.Where(t => t.Priority == request.Priority);

            if (request.TechnicianId.HasValue)
                query = query.Where(t => t.AssignedToId == request.TechnicianId.Value);

            // Tickets sin asignar: solo lo pueden consultar Supervisor y Sistema.
            // Para otros roles el filtro se ignora (su consulta ya está limitada a sus propios tickets).
            if (request.Unassigned.HasValue && request.Unassigned.Value
                && (request.Role == "Supervisor" || request.Role == "Sistema"))
                query = query.Where(t => t.AssignedToId == null);

            if (request.OnlyOverdue.HasValue && request.OnlyOverdue.Value)
                query = query.Where(t => t.IsOverdue);

            return query;
        }
    }
}