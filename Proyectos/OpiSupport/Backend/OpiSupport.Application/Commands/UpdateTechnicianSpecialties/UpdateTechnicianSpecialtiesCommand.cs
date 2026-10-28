using MediatR;
using OpiSupport.Application.Shared;

namespace OpiSupport.Application.Commands.UpdateTechnicianSpecialties
{
    public class UpdateTechnicianSpecialtiesCommand : IRequest<Result<bool>>
    {
        public int TechnicianId { get; set; }
        public List<int> SpecialtyCategoryIds { get; set; } = new();
        public int RequestedByUserId { get; set; }
        public string RequestedByRole { get; set; } = string.Empty;
    }
}