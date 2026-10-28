using MediatR;
using OpiSupport.Application.Interfaces;
using OpiSupport.Application.Interfaces.Repositories;
using OpiSupport.Application.Shared;

namespace OpiSupport.Application.Commands.EnableUser
{
    public class EnableUserCommandHandler : IRequestHandler<EnableUserCommand, Result<bool>>
    {
        private readonly IUserRepository _userRepository;
        private readonly IUnitOfWork _unitOfWork;

        public EnableUserCommandHandler(IUserRepository userRepository, IUnitOfWork unitOfWork)
        {
            _userRepository = userRepository;
            _unitOfWork = unitOfWork;
        }

        public async Task<Result<bool>> Handle(EnableUserCommand request, CancellationToken cancellationToken)
        {
            if (request.UserIdToEnable == request.RequestedByUserId)
                return Result<bool>.Failure("No puedes habilitarte a ti mismo.");

            var userToEnable = await _userRepository.GetByIdAsync(request.UserIdToEnable, cancellationToken);
            if (userToEnable == null)
                return Result<bool>.Failure("Usuario no encontrado.");

            if (request.RequestedByRole == "Sistema")
            {
                // Sistema puede habilitar a cualquiera
            }
            else if (request.RequestedByRole == "Supervisor")
            {
                if (userToEnable.Role == "Supervisor")
                    return Result<bool>.Failure("Los Supervisores no pueden habilitar a otros Supervisores.");
            }
            else
            {
                return Result<bool>.Failure("No tienes permisos para habilitar usuarios.");
            }

            userToEnable.IsActive = true;
            _userRepository.Update(userToEnable);
            await _unitOfWork.SaveChangesAsync(cancellationToken);

            return Result<bool>.Success(true);
        }
    }
}