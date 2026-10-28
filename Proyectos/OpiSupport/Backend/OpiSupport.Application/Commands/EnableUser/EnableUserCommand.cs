using MediatR;
using OpiSupport.Application.Shared;

namespace OpiSupport.Application.Commands.EnableUser
{
    public class EnableUserCommand : IRequest<Result<bool>>
    {
        public int UserIdToEnable { get; set; }
        public int RequestedByUserId { get; set; }
        public string RequestedByRole { get; set; } = string.Empty;
    }
}

