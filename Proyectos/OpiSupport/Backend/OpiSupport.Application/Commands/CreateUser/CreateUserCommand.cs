using MediatR;
using OpiSupport.Application.DTOs;
using OpiSupport.Application.Shared;

namespace OpiSupport.Application.Commands.CreateUser
{
    public class CreateUserCommand : IRequest<Result<UserResponseDto>>
    {
        public required string FullName { get; set; }
        public required string EmployeeCode { get; set; }
        public string? Email { get; set; }
        public required string Password { get; set; }
        public required string Role { get; set; }
        public List<int>? SpecialtyCategoryIds { get; set; } 
        public int RequestedByUserId { get; set; }
        public string RequestedByRole { get; set; } = string.Empty;
    }
}