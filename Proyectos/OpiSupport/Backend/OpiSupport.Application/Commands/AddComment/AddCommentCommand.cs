using MediatR;
using OpiSupport.Application.DTOs;
using OpiSupport.Application.Shared;

namespace OpiSupport.Application.Commands.AddComment
{
    public class AddCommentCommand : IRequest<Result<CommentDto>>
    {
        public int TicketId { get; set; }
        public required string Text { get; set; }
        public int UserId { get; set; } // Asignado desde el controlador
        public string Role { get; set; } = "Colaborador"; // Asignado desde el controlador
    }
}