using MediatR;
using OpiSupport.Application.DTOs;
using OpiSupport.Application.Interfaces;
using OpiSupport.Application.Interfaces.Repositories;
using OpiSupport.Application.Services;
using OpiSupport.Application.Shared;
using OpiSupport.Domain.Entities;

namespace OpiSupport.Application.Commands.CreateTicket
{
    public class CreateTicketCommandHandler : IRequestHandler<CreateTicketCommand, Result<TicketResponseDto>>
    {
        private readonly ITicketRepository _ticketRepository;
        private readonly IUserRepository _userRepository;
        private readonly ICategoryRepository _categoryRepository;
        private readonly IStatusHistoryRepository _statusHistoryRepository;
        private readonly IUnitOfWork _unitOfWork;
        private readonly TicketAssignmentService _assignmentService;

        public CreateTicketCommandHandler(
            ITicketRepository ticketRepository,
            IUserRepository userRepository,
            ICategoryRepository categoryRepository,
            IStatusHistoryRepository statusHistoryRepository,
            IUnitOfWork unitOfWork,
            TicketAssignmentService assignmentService)
        {
            _ticketRepository = ticketRepository;
            _userRepository = userRepository;
            _categoryRepository = categoryRepository;
            _statusHistoryRepository = statusHistoryRepository;
            _unitOfWork = unitOfWork;
            _assignmentService = assignmentService;
        }

        public async Task<Result<TicketResponseDto>> Handle(CreateTicketCommand request, CancellationToken cancellationToken)
        {
            // 1. Validar que la categoría existe
            var category = await _categoryRepository.GetByIdAsync(request.CategoryId, cancellationToken);
            if (category == null)
                return Result<TicketResponseDto>.Failure("La categoría especificada no existe.");

            // 2. Validar que el área existe (asumimos que existe por simplicidad)

            // 3. Validar prioridad
            var validPriorities = new[] { "Baja", "Media", "Alta", "Crítica" };
            if (!validPriorities.Contains(request.Priority))
                return Result<TicketResponseDto>.Failure("La prioridad debe ser Baja, Media, Alta o Crítica.");

            // 4. Obtener el usuario creador
            var user = await _userRepository.GetByIdAsync(request.UserId, cancellationToken);
            if (user == null)
                return Result<TicketResponseDto>.Failure("Usuario no encontrado.");

            // 5. Calcular SLA_Deadline según prioridad
            var slaDeadline = SlaCalculator.CalculateDeadline(DateTime.UtcNow, request.Priority);
            Console.WriteLine($"🔍 SLA_Deadline calculado: {slaDeadline} para prioridad: {request.Priority}");

            // 6. Buscar técnico disponible para esta categoría
            var technician = await _assignmentService.FindAvailableTechnicianAsync(request.CategoryId, cancellationToken);
            var technicianId = technician?.Id;

            // 7. Crear el ticket
            var ticket = new Ticket
            {
                Title = request.Title,
                Description = request.Description,
                CategoryId = request.CategoryId,
                AreaId = request.AreaId,
                Priority = request.Priority,
                Status = technicianId.HasValue ? "Asignado" : "Abierto",
                CreatedById = request.UserId,
                CreatedAt = DateTime.UtcNow,
                SLA_Deadline = slaDeadline,
                IsOverdue = false,
                AssignedToId = technicianId,
                ReopenCount = 0
            };

            // 8. Guardar el ticket
            await _ticketRepository.AddAsync(ticket, cancellationToken);
            await _unitOfWork.SaveChangesAsync(cancellationToken);

            // 9. Registrar en el historial de estados
            var history = new StatusHistory
            {
                TicketId = ticket.Id,
                ChangedByUserId = request.UserId,
                PreviousStatus = null,
                NewStatus = ticket.Status,
                ChangedAt = DateTime.UtcNow
            };
            await _statusHistoryRepository.AddAsync(history, cancellationToken);
            await _unitOfWork.SaveChangesAsync(cancellationToken);

            // 10. Cargar relaciones para la respuesta
            var createdTicket = await _ticketRepository.GetByIdAsync(ticket.Id, cancellationToken);

            // 11. Mapear a DTO de respuesta
            var responseDto = new TicketResponseDto
            {
                Id = createdTicket!.Id,
                Title = createdTicket.Title,
                Status = createdTicket.Status,
                Priority = createdTicket.Priority,
                Category = createdTicket.Category?.Name ?? "Sin categoría",
                Area = createdTicket.Area?.Name ?? "Sin área",
                CreatedAt = createdTicket.CreatedAt,
                CreatedById = createdTicket.CreatedById,
                CreatedByFullName = createdTicket.CreatedByUser?.FullName ?? "Usuario desconocido",
                AssignedToId = createdTicket.AssignedToId,
                AssignedToFullName = createdTicket.AssignedToUser?.FullName
            };

            return Result<TicketResponseDto>.Success(responseDto);
        }
    }
}