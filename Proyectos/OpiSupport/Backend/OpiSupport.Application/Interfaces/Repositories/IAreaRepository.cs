using OpiSupport.Domain.Entities;

namespace OpiSupport.Application.Interfaces.Repositories
{
    public interface IAreaRepository
    {
        Task<Area?> GetByIdAsync(int id, CancellationToken cancellationToken = default);
        Task<IEnumerable<Area>> GetAllAsync(CancellationToken cancellationToken = default);
        Task<bool> ExistsAsync(int id, CancellationToken cancellationToken = default);
    }
}