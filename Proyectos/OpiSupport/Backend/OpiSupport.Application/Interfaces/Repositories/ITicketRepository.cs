using OpiSupport.Domain.Entities;
using System.Linq.Expressions;

namespace OpiSupport.Application.Interfaces.Repositories
{
    public interface ITicketRepository
    {
        Task<Ticket?> GetByIdAsync(int id, CancellationToken cancellationToken = default);
        Task<IEnumerable<Ticket>> GetAsync(
            Expression<Func<Ticket, bool>>? filter = null,
            CancellationToken cancellationToken = default);
        Task AddAsync(Ticket ticket, CancellationToken cancellationToken = default);
        void Update(Ticket ticket);
        void Delete(Ticket ticket);
        Task<bool> ExistsAsync(int id, CancellationToken cancellationToken = default);
        IQueryable<Ticket> GetQueryable();
    }
}