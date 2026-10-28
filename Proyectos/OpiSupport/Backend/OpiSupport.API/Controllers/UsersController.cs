using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using OpiSupport.Application.Commands.CreateUser;
using OpiSupport.Application.Commands.DisableUser;
using OpiSupport.Application.Commands.EnableUser;
using OpiSupport.Application.Commands.UpdateTechnicianSpecialties;
using OpiSupport.Application.DTOs;
using OpiSupport.Application.Queries.GetUserList;
using System.Security.Claims;
using OpiSupport.Application.Interfaces.Repositories;



namespace OpiSupport.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class UsersController : ControllerBase
    {
        private readonly IMediator _mediator;
        private readonly IUserRepository _userRepository;

        public UsersController(IMediator mediator, IUserRepository userRepository)
        {
            _mediator = mediator;
            _userRepository = userRepository;
        }

        [HttpPost]
        public async Task<IActionResult> CreateUser([FromBody] CreateUserDto dto)
        {
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier);
            if (userIdClaim == null || !int.TryParse(userIdClaim.Value, out int userId))
                return Unauthorized(new { message = "Usuario no autenticado" });

            var roleClaim = User.FindFirst(ClaimTypes.Role);
            var role = roleClaim?.Value ?? string.Empty;

            var command = new CreateUserCommand
            {
                FullName = dto.FullName,
                EmployeeCode = dto.EmployeeCode,
                Email = dto.Email,
                Password = dto.Password,
                Role = dto.Role,
                SpecialtyCategoryIds = dto.SpecialtyCategoryIds,
                RequestedByUserId = userId,
                RequestedByRole = role
            };

            var result = await _mediator.Send(command);

            if (!result.IsSuccess)
                return BadRequest(new { message = result.Error });

            return CreatedAtAction(nameof(CreateUser), new { id = result.Value!.Id }, result.Value!);
        }

        [HttpPut("{id}/disable")]
        public async Task<IActionResult> DisableUser(int id)
        {
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier);
            if (userIdClaim == null || !int.TryParse(userIdClaim.Value, out int userId))
                return Unauthorized(new { message = "Usuario no autenticado" });

            var roleClaim = User.FindFirst(ClaimTypes.Role);
            var role = roleClaim?.Value ?? string.Empty;

            var command = new DisableUserCommand
            {
                UserIdToDisable = id,
                RequestedByUserId = userId,
                RequestedByRole = role
            };

            var result = await _mediator.Send(command);

            if (!result.IsSuccess)
                return BadRequest(new { message = result.Error });

            return NoContent();
        }

        [HttpGet]
        [Authorize(Roles = "Supervisor, Sistema")]
        public async Task<IActionResult> GetUsers([FromQuery] GetUserListQuery query)
        {
            var result = await _mediator.Send(query);

            if (!result.IsSuccess)
                return BadRequest(new { message = result.Error });

            return Ok(result.Value);
        }

        [HttpPut("{id}/enable")]
        [Authorize(Roles = "Supervisor, Sistema")]
        public async Task<IActionResult> EnableUser(int id)
        {
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier);
            if (userIdClaim == null || !int.TryParse(userIdClaim.Value, out int userId))
                return Unauthorized(new { message = "Usuario no autenticado" });

            var roleClaim = User.FindFirst(ClaimTypes.Role);
            var role = roleClaim?.Value ?? string.Empty;

            var command = new EnableUserCommand
            {
                UserIdToEnable = id,
                RequestedByUserId = userId,
                RequestedByRole = role
            };

            var result = await _mediator.Send(command);

            if (!result.IsSuccess)
                return BadRequest(new { message = result.Error });

            return NoContent();
        }

        [HttpPut("{id}/specialties")]
        [Authorize(Roles = "Supervisor, Sistema")]
        public async Task<IActionResult> UpdateSpecialties(int id, [FromBody] List<int> specialtyCategoryIds)
        {
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier);
            if (userIdClaim == null || !int.TryParse(userIdClaim.Value, out int userId))
                return Unauthorized(new { message = "Usuario no autenticado" });

            var roleClaim = User.FindFirst(ClaimTypes.Role);
            var role = roleClaim?.Value ?? string.Empty;

            var command = new UpdateTechnicianSpecialtiesCommand
            {
                TechnicianId = id,
                SpecialtyCategoryIds = specialtyCategoryIds,
                RequestedByUserId = userId,
                RequestedByRole = role
            };

            var result = await _mediator.Send(command);

            if (!result.IsSuccess)
                return BadRequest(new { message = result.Error });

            return NoContent();
        }

        [HttpGet("technicians")]
        [Authorize]
        public async Task<IActionResult> GetTechnicians()
        {
            var technicians = await _userRepository.GetActiveTechniciansWithSpecialtiesAsync();
            return Ok(technicians);
        }

    }
}