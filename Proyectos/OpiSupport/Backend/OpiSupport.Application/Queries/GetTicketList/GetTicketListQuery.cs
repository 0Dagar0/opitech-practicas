using MediatR;
using OpiSupport.Application.DTOs;
using OpiSupport.Application.Shared;

namespace OpiSupport.Application.Queries.GetTicketList
{
    public class GetTicketListQuery : IRequest<Result<PagedResult<TicketListDto>>>
    {
        public int UserId { get; set; }
        public string Role { get; set; } = "Colaborador";
        public string? Status { get; set; }
        public string? Priority { get; set; }
        public int? TechnicianId { get; set; }
        public bool? OnlyOverdue { get; set; }

        /// <summary>
        /// Si es true, devuelve solo los tickets que no tienen técnico asignado.
        /// Solo se aplica para los perfiles Supervisor y Sistema.
        /// </summary>
        public bool? Unassigned { get; set; }

        public int Page { get; set; } = 1;
        public int Size { get; set; } = 10;
    }
}


