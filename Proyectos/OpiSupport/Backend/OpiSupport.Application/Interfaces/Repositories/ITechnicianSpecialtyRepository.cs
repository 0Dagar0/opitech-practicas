using OpiSupport.Domain.Entities;

namespace OpiSupport.Application.Interfaces.Repositories
{
    public interface ITechnicianSpecialtyRepository
    {
        Task AddAsync(TechnicianSpecialty specialty, CancellationToken cancellationToken = default);
        Task<IEnumerable<TechnicianSpecialty>> GetByTechnicianIdAsync(int technicianId, CancellationToken cancellationToken = default);
        Task ReplaceAsync(int technicianId, List<int> categoryIds, CancellationToken cancellationToken = default);
    }
}