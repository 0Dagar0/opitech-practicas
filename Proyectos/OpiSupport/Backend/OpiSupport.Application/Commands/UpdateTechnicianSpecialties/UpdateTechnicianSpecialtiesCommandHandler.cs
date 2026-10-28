using MediatR;
using OpiSupport.Application.Interfaces;
using OpiSupport.Application.Interfaces.Repositories;
using OpiSupport.Application.Shared;
using OpiSupport.Domain.Entities;

namespace OpiSupport.Application.Commands.UpdateTechnicianSpecialties
{
    public class UpdateTechnicianSpecialtiesCommandHandler
        : IRequestHandler<UpdateTechnicianSpecialtiesCommand, Result<bool>>
    {
        private readonly IUserRepository _userRepository;
        private readonly ITechnicianSpecialtyRepository _specialtyRepository;
        private readonly IUnitOfWork _unitOfWork;

        public UpdateTechnicianSpecialtiesCommandHandler(
            IUserRepository userRepository,
            ITechnicianSpecialtyRepository specialtyRepository,
            IUnitOfWork unitOfWork)
        {
            _userRepository = userRepository;
            _specialtyRepository = specialtyRepository;
            _unitOfWork = unitOfWork;
        }

        public async Task<Result<bool>> Handle(UpdateTechnicianSpecialtiesCommand request, CancellationToken cancellationToken)
        {
            // 1. Validar permisos (Supervisor o Sistema)
            if (request.RequestedByRole != "Supervisor" && request.RequestedByRole != "Sistema")
                return Result<bool>.Failure("No tienes permisos para actualizar especialidades.");

            // 2. Validar que el técnico exista y sea técnico
            var technician = await _userRepository.GetByIdAsync(request.TechnicianId, cancellationToken);
            if (technician == null || technician.Role != "Tecnico")
                return Result<bool>.Failure("El usuario no existe o no es un técnico.");

            // 3. Actualizar especialidades (reemplazar todas)
            await _specialtyRepository.ReplaceAsync(technician.Id, request.SpecialtyCategoryIds, cancellationToken);
            await _unitOfWork.SaveChangesAsync(cancellationToken);

            return Result<bool>.Success(true);
        }
    }
}