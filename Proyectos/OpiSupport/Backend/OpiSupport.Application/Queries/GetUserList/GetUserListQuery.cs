using MediatR;
using OpiSupport.Application.DTOs;
using OpiSupport.Application.Shared;

namespace OpiSupport.Application.Queries.GetUserList
{
    public class GetUserListQuery : IRequest<Result<List<UserResponseDto>>>
    {
        public string? Role { get; set; }       // "Colaborador", "Tecnico", "Supervisor", "Sistema"
        public bool? IsActive { get; set; }     // true, false, null (todos)
        public string? Search { get; set; }     // Buscar por nombre o código de empleado
    }
}