using MediatR;
using OpiSupport.Application.Shared;

namespace OpiSupport.Application.Commands.DisableUser
{
    public class DisableUserCommand : IRequest<Result<bool>>
    {
        public int UserIdToDisable { get; set; }
        public int RequestedByUserId { get; set; }
        public string RequestedByRole { get; set; } = string.Empty;
    }
}
