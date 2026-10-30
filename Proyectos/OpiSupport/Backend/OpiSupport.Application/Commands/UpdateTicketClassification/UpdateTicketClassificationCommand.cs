using MediatR;
using OpiSupport.Application.DTOs;
using OpiSupport.Application.Shared;

namespace OpiSupport.Application.Commands.UpdateTicketClassification
{
    /// <summary>
    /// Cambia la categoría y/o la prioridad de un ticket.
    /// Solo puede ejecutarlo el perfil Sistema (SYS) y exige un motivo
    /// que queda registrado en el historial del ticket.
    /// </summary>
    public class UpdateTicketClassificationCommand : IRequest<Result<TicketDetailDto>>
    {
        public int TicketId { get; set; }          // Se asigna desde el controlador (ruta)
        public int CategoryId { get; set; }
        public string Priority { get; set; } = string.Empty;
        public string Reason { get; set; } = string.Empty;
        public int UserId { get; set; }            // Usuario que ejecuta el cambio
        public string Role { get; set; } = string.Empty;
    }
}
