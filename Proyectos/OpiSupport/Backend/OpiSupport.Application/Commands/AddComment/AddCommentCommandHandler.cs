using MediatR;
using OpiSupport.Application.DTOs;
using OpiSupport.Application.Interfaces;
using OpiSupport.Application.Interfaces.Repositories;
using OpiSupport.Application.Shared;
using OpiSupport.Domain.Entities;

namespace OpiSupport.Application.Commands.AddComment
{
    public class AddCommentCommandHandler : IRequestHandler<AddCommentCommand, Result<CommentDto>>
    {
        private readonly ITicketRepository _ticketRepository;
        private readonly IUserRepository _userRepository;
        private readonly ICommentRepository _commentRepository;
        private readonly IStatusHistoryRepository _statusHistoryRepository;
        private readonly IUnitOfWork _unitOfWork;

        public AddCommentCommandHandler(
            ITicketRepository ticketRepository,
            IUserRepository userRepository,
            ICommentRepository commentRepository,
            IStatusHistoryRepository statusHistoryRepository,
            IUnitOfWork unitOfWork)
        {
            _ticketRepository = ticketRepository;
            _userRepository = userRepository;
            _commentRepository = commentRepository;
            _statusHistoryRepository = statusHistoryRepository;
            _unitOfWork = unitOfWork;
        }

        public async Task<Result<CommentDto>> Handle(AddCommentCommand request, CancellationToken cancellationToken)
        {
            var ticket = await _ticketRepository.GetByIdAsync(request.TicketId, cancellationToken);
            if (ticket == null)
                return Result<CommentDto>.Failure("Ticket no encontrado");

            if (request.Role == "Colaborador" && ticket.CreatedById != request.UserId)
                return Result<CommentDto>.Failure("No tienes permiso para comentar en este ticket");

            if (request.Role == "Tecnico" && ticket.AssignedToId != request.UserId)
                return Result<CommentDto>.Failure("No tienes permiso para comentar en este ticket");

            var shouldReopen = false;
            if (request.Role == "Colaborador" && (ticket.Status == "Resuelto" || ticket.Status == "Cerrado"))
            {
                if (ticket.ResolvedAt.HasValue && (DateTime.UtcNow - ticket.ResolvedAt.Value).TotalHours <= 48)
                    shouldReopen = true;
            }

            var comment = new Comment
            {
                TicketId = ticket.Id,
                UserId = request.UserId,
                Text = request.Text,
                CreatedAt = DateTime.UtcNow
            };

            await _commentRepository.AddAsync(comment, cancellationToken);

            if (shouldReopen)
            {
                var previousStatus = ticket.Status;
                ticket.Status = "Reabierto";
                ticket.ReopenCount = (ticket.ReopenCount ?? 0) + 1;

                var history = new StatusHistory
                {
                    TicketId = ticket.Id,
                    ChangedByUserId = request.UserId,
                    PreviousStatus = previousStatus,
                    NewStatus = "Reabierto",
                    ChangedAt = DateTime.UtcNow
                };
                await _statusHistoryRepository.AddAsync(history, cancellationToken);
            }

            await _unitOfWork.SaveChangesAsync(cancellationToken);

            var user = await _userRepository.GetByIdAsync(request.UserId, cancellationToken);
            var authorName = user?.FullName ?? "Usuario desconocido";

            return Result<CommentDto>.Success(new CommentDto
            {
                Id = comment.Id,
                Author = authorName,
                Text = comment.Text,
                CreatedAt = comment.CreatedAt
            });
        }
    }
}