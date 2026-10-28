using Microsoft.EntityFrameworkCore;
using OpiSupport.Application.Interfaces.Repositories;
using OpiSupport.Domain.Entities;
using OpiSupport.Infrastructure.Data;

namespace OpiSupport.Infrastructure.Repositories
{
    public class AreaRepository : IAreaRepository
    {
        private readonly ApplicationDbContext _context;

        public AreaRepository(ApplicationDbContext context)
        {
            _context = context;
        }

        public async Task<Area?> GetByIdAsync(int id, CancellationToken cancellationToken = default)
        {
            return await _context.Areas
                .FirstOrDefaultAsync(a => a.Id == id, cancellationToken);
        }

        public async Task<IEnumerable<Area>> GetAllAsync(CancellationToken cancellationToken = default)
        {
            return await _context.Areas
                .OrderBy(a => a.Name)
                .ToListAsync(cancellationToken);
        }

        public async Task<bool> ExistsAsync(int id, CancellationToken cancellationToken = default)
        {
            return await _context.Areas.AnyAsync(a => a.Id == id, cancellationToken);
        }
    }
}