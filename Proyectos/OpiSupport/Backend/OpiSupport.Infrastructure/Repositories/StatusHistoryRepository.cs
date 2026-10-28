using Microsoft.EntityFrameworkCore;
using OpiSupport.Application.Interfaces.Repositories;
using OpiSupport.Domain.Entities;
using OpiSupport.Infrastructure.Data;
using System.Threading;
using System.Threading.Tasks;

namespace OpiSupport.Infrastructure.Repositories
{
    public class StatusHistoryRepository : IStatusHistoryRepository
    {
        private readonly ApplicationDbContext _context;

        public StatusHistoryRepository(ApplicationDbContext context)
        {
            _context = context;
        }

        public async Task AddAsync(StatusHistory history, CancellationToken cancellationToken = default)
        {
            await _context.StatusHistories.AddAsync(history, cancellationToken);
        }
    }
}