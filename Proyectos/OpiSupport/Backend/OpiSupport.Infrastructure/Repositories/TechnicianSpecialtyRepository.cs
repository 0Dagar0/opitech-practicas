using Microsoft.EntityFrameworkCore;
using OpiSupport.Application.Interfaces.Repositories;
using OpiSupport.Domain.Entities;
using OpiSupport.Infrastructure.Data;

namespace OpiSupport.Infrastructure.Repositories
{
    public class TechnicianSpecialtyRepository : ITechnicianSpecialtyRepository
    {
        private readonly ApplicationDbContext _context;

        public TechnicianSpecialtyRepository(ApplicationDbContext context)
        {
            _context = context;
        }

        public async Task AddAsync(TechnicianSpecialty specialty, CancellationToken cancellationToken = default)
        {
            await _context.TechnicianSpecialties.AddAsync(specialty, cancellationToken);
        }

        public async Task<IEnumerable<TechnicianSpecialty>> GetByTechnicianIdAsync(int technicianId, CancellationToken cancellationToken = default)
        {
            return await _context.TechnicianSpecialties
                .Where(ts => ts.TechnicianId == technicianId)
                .Include(ts => ts.Category)
                .ToListAsync(cancellationToken);
        }

        public async Task ReplaceAsync(int technicianId, List<int> categoryIds, CancellationToken cancellationToken = default)
        {
            // Eliminar las especialidades actuales
            var current = await _context.TechnicianSpecialties
                .Where(ts => ts.TechnicianId == technicianId)
                .ToListAsync(cancellationToken);
            _context.TechnicianSpecialties.RemoveRange(current);

            // Agregar las nuevas
            foreach (var categoryId in categoryIds.Distinct())
            {
                await _context.TechnicianSpecialties.AddAsync(new TechnicianSpecialty
                {
                    TechnicianId = technicianId,
                    CategoryId = categoryId
                }, cancellationToken);
            }
        }
    }
}