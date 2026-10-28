using BCrypt.Net;
using MediatR;
using OpiSupport.Application.DTOs;
using OpiSupport.Application.Interfaces;
using OpiSupport.Application.Interfaces.Repositories;
using OpiSupport.Application.Shared;
using OpiSupport.Domain.Entities;

namespace OpiSupport.Application.Commands.CreateUser
{
    public class CreateUserCommandHandler : IRequestHandler<CreateUserCommand, Result<UserResponseDto>>
    {
        private readonly IUserRepository _userRepository;
        private readonly ITechnicianSpecialtyRepository _specialtyRepository;
        private readonly IUnitOfWork _unitOfWork;

        public CreateUserCommandHandler(
            IUserRepository userRepository,
            ITechnicianSpecialtyRepository specialtyRepository,
            IUnitOfWork unitOfWork)
        {
            _userRepository = userRepository;
            _specialtyRepository = specialtyRepository;
            _unitOfWork = unitOfWork;
        }

        public async Task<Result<UserResponseDto>> Handle(CreateUserCommand request, CancellationToken cancellationToken)
        {
            // 1. Validar permisos
            if (request.RequestedByRole == "Sistema")
            {
                // Sistema puede crear cualquier rol
            }
            else if (request.RequestedByRole == "Supervisor")
            {
                if (request.Role == "Supervisor")
                    return Result<UserResponseDto>.Failure("Los Supervisores no pueden crear otros Supervisores.");
            }
            else
            {
                return Result<UserResponseDto>.Failure("No tienes permisos para crear usuarios.");
            }

            // 2. Validar que el EmployeeCode no exista
            var existing = await _userRepository.GetByEmployeeCodeAsync(request.EmployeeCode, cancellationToken);
            if (existing != null)
                return Result<UserResponseDto>.Failure("El código de empleado ya está registrado.");

            // 3. Validar que el Email no exista (si se envió)
            if (!string.IsNullOrEmpty(request.Email))
            {
                var existingEmail = await _userRepository.GetByEmailAsync(request.Email, cancellationToken);
                if (existingEmail != null)
                    return Result<UserResponseDto>.Failure("El correo electrónico ya está registrado.");
            }

            // 4. Hash de la contraseña
            var passwordHash = BCrypt.Net.BCrypt.HashPassword(request.Password);

            // 5. Crear el usuario
            var user = new User
            {
                FullName = request.FullName,
                EmployeeCode = request.EmployeeCode,
                Email = request.Email,
                PasswordHash = passwordHash,
                Role = request.Role,
                IsActive = true,
                CreatedAt = DateTime.UtcNow,
                ActiveReopenedCount = 0
            };

            await _userRepository.AddAsync(user, cancellationToken);
            await _unitOfWork.SaveChangesAsync(cancellationToken);

            // 6. Asignar especialidades si es técnico
            if (request.Role == "Tecnico" && request.SpecialtyCategoryIds != null && request.SpecialtyCategoryIds.Any())
            {
                foreach (var categoryId in request.SpecialtyCategoryIds)
                {
                    var specialty = new TechnicianSpecialty
                    {
                        TechnicianId = user.Id,
                        CategoryId = categoryId
                    };
                    await _specialtyRepository.AddAsync(specialty, cancellationToken);
                }
                await _unitOfWork.SaveChangesAsync(cancellationToken);
            }

            // 7. Devolver respuesta
            return Result<UserResponseDto>.Success(new UserResponseDto
            {
                Id = user.Id,
                FullName = user.FullName,
                EmployeeCode = user.EmployeeCode,
                Email = user.Email,
                Role = user.Role,
                IsActive = user.IsActive,
                CreatedAt = user.CreatedAt
            });
        }
    }
}