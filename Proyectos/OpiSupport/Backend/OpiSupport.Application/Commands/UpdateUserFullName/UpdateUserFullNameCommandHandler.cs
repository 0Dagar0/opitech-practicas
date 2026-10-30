using MediatR;
using OpiSupport.Application.Interfaces;
using OpiSupport.Application.Interfaces.Repositories;
using OpiSupport.Application.Shared;

namespace OpiSupport.Application.Commands.UpdateUserFullName
{
    public class UpdateUserFullNameCommandHandler
        : IRequestHandler<UpdateUserFullNameCommand, Result<bool>>
    {
        private const int MinNameLength = 3;
        private const int MaxNameLength = 150;

        private readonly IUserRepository _userRepository;
        private readonly IUnitOfWork _unitOfWork;

        public UpdateUserFullNameCommandHandler(
            IUserRepository userRepository,
            IUnitOfWork unitOfWork)
        {
            _userRepository = userRepository;
            _unitOfWork = unitOfWork;
        }

        public async Task<Result<bool>> Handle(UpdateUserFullNameCommand request, CancellationToken cancellationToken)
        {
            // 1. Validar permisos: únicamente el perfil Sistema (SYS)
            if (request.RequestedByRole != "Sistema")
                return Result<bool>.Failure("Solo el perfil Sistema puede editar los nombres de los usuarios.");

            // 2. Validar el nombre recibido
            var fullName = (request.FullName ?? string.Empty).Trim();

            if (fullName.Length < MinNameLength)
                return Result<bool>.Failure($"El nombre debe tener al menos {MinNameLength} caracteres.");

            if (fullName.Length > MaxNameLength)
                return Result<bool>.Failure($"El nombre no puede superar los {MaxNameLength} caracteres.");

            // 3. El usuario debe existir
            var user = await _userRepository.GetByIdAsync(request.UserId, cancellationToken);
            if (user == null)
                return Result<bool>.Failure("Usuario no encontrado.");

            // 4. Si el nombre no cambió, no se escribe en la base de datos
            if (string.Equals(user.FullName, fullName, StringComparison.Ordinal))
                return Result<bool>.Success(true);

            // 5. Guardar el nuevo nombre
            user.FullName = fullName;
            _userRepository.Update(user);
            await _unitOfWork.SaveChangesAsync(cancellationToken);

            return Result<bool>.Success(true);
        }
    }
}
