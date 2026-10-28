using MediatR;
using OpiSupport.Application.DTOs;
using OpiSupport.Application.Shared;

namespace OpiSupport.Application.Commands.CreateTicket
{
    public class CreateTicketCommand : IRequest<Result<TicketResponseDto>>
    {
        public required string Title { get; set; }
        public required string Description { get; set; }
        public required int CategoryId { get; set; }
        public required int AreaId { get; set; }
        public required string Priority { get; set; } // "Baja", "Media", "Alta", "Crítica"
        public int UserId { get; set; } // Se llena desde el token JWT
    }
}

