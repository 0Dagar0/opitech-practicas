using Microsoft.EntityFrameworkCore;
using OpiSupport.Application.Interfaces.Repositories;
using OpiSupport.Domain.Entities;
using OpiSupport.Infrastructure.Data;
using System.Linq.Expressions;

namespace OpiSupport.Infrastructure.Repositories
{
    public class TicketRepository : ITicketRepository
    {
        private readonly ApplicationDbContext _context;

        public TicketRepository(ApplicationDbContext context)
        {
            _context = context;
        }

        public async Task<Ticket?> GetByIdAsync(int id, CancellationToken cancellationToken = default)
        {
            return await _context.Tickets
                .Include(t => t.Category)
                .Include(t => t.Area)
                .Include(t => t.CreatedByUser)
                .Include(t => t.AssignedToUser)
                .FirstOrDefaultAsync(t => t.Id == id, cancellationToken);
        }

        public async Task<IEnumerable<Ticket>> GetAsync(
            Expression<Func<Ticket, bool>>? filter = null,
            CancellationToken cancellationToken = default)
        {
            IQueryable<Ticket> query = _context.Tickets
                .Include(t => t.Category)
                .Include(t => t.Area)
                .Include(t => t.CreatedByUser)
                .Include(t => t.AssignedToUser);

            if (filter != null)
                query = query.Where(filter);

            return await query.ToListAsync(cancellationToken);
        }

        public async Task AddAsync(Ticket ticket, CancellationToken cancellationToken = default)
        {
            await _context.Tickets.AddAsync(ticket, cancellationToken);
        }

        public void Update(Ticket ticket)
        {
            _context.Tickets.Update(ticket);
        }

        public void Delete(Ticket ticket)
        {
            _context.Tickets.Remove(ticket);
        }

        public async Task<bool> ExistsAsync(int id, CancellationToken cancellationToken = default)
        {
            return await _context.Tickets.AnyAsync(t => t.Id == id, cancellationToken);
        }
        public IQueryable<Ticket> GetQueryable()
        {
            return _context.Tickets.AsQueryable();
        }
    }
}