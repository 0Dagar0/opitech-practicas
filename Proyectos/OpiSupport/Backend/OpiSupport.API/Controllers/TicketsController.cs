using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using OpiSupport.Application.Commands.AddComment;
using OpiSupport.Application.Commands.AssignTicket;
using OpiSupport.Application.Commands.ChangeTicketStatus;
using OpiSupport.Application.Commands.CreateTicket;
using OpiSupport.Application.Queries.GetTicketDetail;
using OpiSupport.Application.Queries.GetTicketList;
using System.Security.Claims;

namespace OpiSupport.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class TicketsController : ControllerBase
    {
        private readonly IMediator _mediator;

        public TicketsController(IMediator mediator)
        {
            _mediator = mediator;
        }

        [HttpGet]
        public async Task<IActionResult> GetTickets([FromQuery] GetTicketListQuery query)
        {
            // 1. Obtener el ID del usuario desde el token JWT
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier);
            if (userIdClaim == null || !int.TryParse(userIdClaim.Value, out int userId))
                return Unauthorized(new { message = "Usuario no autenticado" });

            // 2. Obtener el rol del usuario desde el token JWT
            var roleClaim = User.FindFirst(ClaimTypes.Role);
            var role = roleClaim?.Value ?? "Colaborador";

            // 3. Asignar userId y role al query
            query.UserId = userId;
            query.Role = role;

            // 4. Enviar el query a MediatR
            var result = await _mediator.Send(query);

            // 5. Manejar el resultado
            if (!result.IsSuccess)
                return BadRequest(new { message = result.Error });

            return Ok(result.Value);
        }

        [HttpPost]
        public async Task<IActionResult> CreateTicket([FromBody] CreateTicketCommand command)
        {
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier);
            if (userIdClaim == null || !int.TryParse(userIdClaim.Value, out int userId))
                return Unauthorized(new { message = "Usuario no autenticado" });

            command.UserId = userId;

            var result = await _mediator.Send(command);

            if (!result.IsSuccess)
                return BadRequest(new { message = result.Error });

            return CreatedAtAction(nameof(CreateTicket), new { id = result.Value!.Id }, result.Value);
        }

        [HttpPut("{id}/status")]
        public async Task<IActionResult> ChangeStatus(int id, [FromBody] ChangeTicketStatusCommand command)
        {
            // 1. Obtener el ID del usuario desde el token JWT
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier);
            if (userIdClaim == null || !int.TryParse(userIdClaim.Value, out int userId))
                return Unauthorized(new { message = "Usuario no autenticado" });

            // 2. Obtener el rol del usuario desde el token JWT
            var roleClaim = User.FindFirst(ClaimTypes.Role);
            var role = roleClaim?.Value ?? "Colaborador";

            // 3. Asignar los datos al command
            command.TicketId = id;
            command.UserId = userId;
            command.Role = role;

            // 4. Enviar el command a MediatR
            var result = await _mediator.Send(command);

            // 5. Manejar el resultado
            if (!result.IsSuccess)
                return BadRequest(new { message = result.Error });

            return Ok(result.Value);
        }

        /// <summary>
        /// Reasigna un ticket a otro técnico. Solo Supervisor o Sistema.
        /// Cuerpo esperado: { "technicianId": 3 }
        /// </summary>
        [HttpPut("{id}/assign")]
        [Authorize(Roles = "Supervisor,Sistema")]
        public async Task<IActionResult> AssignTicket(int id, [FromBody] AssignTicketCommand command)
        {
            // 1. Obtener el ID del usuario desde el token JWT
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier);
            if (userIdClaim == null || !int.TryParse(userIdClaim.Value, out int userId))
                return Unauthorized(new { message = "Usuario no autenticado" });

            // 2. Obtener el rol del usuario desde el token JWT
            var roleClaim = User.FindFirst(ClaimTypes.Role);
            var role = roleClaim?.Value ?? "Colaborador";

            // 3. Asignar los datos al command (la ruta manda sobre el cuerpo)
            command.TicketId = id;
            command.UserId = userId;
            command.Role = role;

            // 4. Enviar el command a MediatR
            var result = await _mediator.Send(command);

            // 5. Manejar el resultado
            if (!result.IsSuccess)
                return BadRequest(new { message = result.Error });

            return Ok(result.Value);
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetTicketById(int id)        {
            // 1. Obtener el ID del usuario desde el token JWT
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier);
            if (userIdClaim == null || !int.TryParse(userIdClaim.Value, out int userId))
                return Unauthorized(new { message = "Usuario no autenticado" });

            // 2. Obtener el rol del usuario desde el token JWT
            var roleClaim = User.FindFirst(ClaimTypes.Role);
            var role = roleClaim?.Value ?? "Colaborador";

            // 3. Crear el query
            var query = new GetTicketDetailQuery
            {
                TicketId = id,
                UserId = userId,
                Role = role
            };

            // 4. Enviar el query a MediatR
            var result = await _mediator.Send(query);

            // 5. Manejar el resultado
            if (!result.IsSuccess)
                return NotFound(new { message = result.Error });

            return Ok(result.Value);
        }

        [HttpPost("{id}/comments")]
        public async Task<IActionResult> AddComment(int id, [FromBody] AddCommentCommand command)
        {
            // 1. Obtener el ID del usuario desde el token JWT
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier);
            if (userIdClaim == null || !int.TryParse(userIdClaim.Value, out int userId))
                return Unauthorized(new { message = "Usuario no autenticado" });

            // 2. Obtener el rol del usuario desde el token JWT
            var roleClaim = User.FindFirst(ClaimTypes.Role);
            var role = roleClaim?.Value ?? "Colaborador";

            // 3. Asignar los datos al command
            command.TicketId = id;
            command.UserId = userId;
            command.Role = role;

            // 4. Enviar el command a MediatR
            var result = await _mediator.Send(command);

            // 5. Manejar el resultado
            if (!result.IsSuccess)
                return BadRequest(new { message = result.Error });

            return Ok(result.Value);
        }



    }
}

