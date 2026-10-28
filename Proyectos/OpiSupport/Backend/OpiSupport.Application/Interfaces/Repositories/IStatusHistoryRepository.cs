using OpiSupport.Domain.Entities;
using System.Threading;
using System.Threading.Tasks;

namespace OpiSupport.Application.Interfaces.Repositories
{
    public interface IStatusHistoryRepository
    {
        Task AddAsync(StatusHistory history, CancellationToken cancellationToken = default);
    }
}