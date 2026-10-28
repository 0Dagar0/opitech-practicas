using MediatR;
using OpiSupport.Application.DTOs;
using OpiSupport.Application.Shared;

namespace OpiSupport.Application.Queries.GetTicketDetail
{
    public class GetTicketDetailQuery : IRequest<Result<TicketDetailDto>>
    {
        public int TicketId { get; set; }
        public int UserId { get; set; }
        public string Role { get; set; } = "Colaborador";
    }
}