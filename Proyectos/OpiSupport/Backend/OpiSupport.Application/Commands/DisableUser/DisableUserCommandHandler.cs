using MediatR;
using OpiSupport.Application.Interfaces;
using OpiSupport.Application.Interfaces.Repositories;
using OpiSupport.Application.Shared;

namespace OpiSupport.Application.Commands.DisableUser
{
    public class DisableUserCommandHandler : IRequestHandler<DisableUserCommand, Result<bool>>
    {
        private readonly IUserRepository _userRepository;
        private readonly IUnitOfWork _unitOfWork;

        public DisableUserCommandHandler(IUserRepository userRepository, IUnitOfWork unitOfWork)
        {
            _userRepository = userRepository;
            _unitOfWork = unitOfWork;
        }

        public async Task<Result<bool>> Handle(DisableUserCommand request, CancellationToken cancellationToken)
        {
            // 1. Validar que no se inhabilite a sí mismo
            if (request.UserIdToDisable == request.RequestedByUserId)
                return Result<bool>.Failure("No puedes inhabilitarte a ti mismo.");

            // 2. Obtener usuario a inhabilitar
            var userToDisable = await _userRepository.GetByIdAsync(request.UserIdToDisable, cancellationToken);
            if (userToDisable == null)
                return Result<bool>.Failure("Usuario no encontrado.");

            // 3. Validar permisos
            if (request.RequestedByRole == "Sistema")
            {
                // Sistema puede inhabilitar a cualquiera
            }
            else if (request.RequestedByRole == "Supervisor")
            {
                // Supervisor no puede inhabilitar a otro Supervisor
                if (userToDisable.Role == "Supervisor")
                    return Result<bool>.Failure("Los Supervisores no pueden inhabilitar a otros Supervisores.");
            }
            else
            {
                return Result<bool>.Failure("No tienes permisos para inhabilitar usuarios.");
            }

            // 4. Inhabilitar (cambiar IsActive a false)
            userToDisable.IsActive = false;
            _userRepository.Update(userToDisable);
            await _unitOfWork.SaveChangesAsync(cancellationToken);

            return Result<bool>.Success(true);
        }
    }
}