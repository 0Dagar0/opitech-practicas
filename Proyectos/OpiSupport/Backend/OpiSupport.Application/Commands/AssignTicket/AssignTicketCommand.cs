using MediatR;
using OpiSupport.Application.DTOs;
using OpiSupport.Application.Shared;

namespace OpiSupport.Application.Commands.AssignTicket
{
    /// <summary>
    /// Reasigna un ticket a otro técnico.
    /// Solo puede ejecutarlo un Supervisor o el rol Sistema.
    /// El cuerpo del request solo necesita "technicianId"; el resto de campos
    /// los completa el controlador a partir del token JWT.
    /// </summary>
    public class AssignTicketCommand : IRequest<Result<TicketDetailDto>>
    {
        public int TicketId { get; set; }          // Se asigna desde el controlador (viene en la ruta)
        public int TechnicianId { get; set; }       // Viene en el cuerpo del request
        public int UserId { get; set; }             // Usuario que ejecuta la reasignación
        public string Role { get; set; } = "Colaborador"; // Rol de quien ejecuta, desde el token
    }
}
