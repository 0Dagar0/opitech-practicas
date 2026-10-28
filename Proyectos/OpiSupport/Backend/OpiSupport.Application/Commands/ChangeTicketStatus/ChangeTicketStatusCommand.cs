using MediatR;
using OpiSupport.Application.DTOs;
using OpiSupport.Application.Shared;

namespace OpiSupport.Application.Commands.ChangeTicketStatus
{
    public class ChangeTicketStatusCommand : IRequest<Result<TicketDetailDto>>
    {
        public int TicketId { get; set; }
        public required string NewStatus { get; set; } // "En Proceso", "Resuelto", "Cerrado", "Reabierto"
        public string? Comment { get; set; } // Opcional, pero obligatorio si NewStatus es "Resuelto"
        public int UserId { get; set; } // Se asigna desde el controlador
        public string Role { get; set; } = "Colaborador"; // Se asigna desde el controlador
    }
}

