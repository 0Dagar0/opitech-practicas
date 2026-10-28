using OpiSupport.Domain.Entities;
using OpiSupport.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

public class AlertRepository : IAlertRepository
{
    private readonly ApplicationDbContext _context;
    public AlertRepository(ApplicationDbContext context) => _context = context;

    public async Task<List<Alert>> GetUnreadAlertsAsync(CancellationToken cancellationToken = default)
    {
        return await _context.Alerts
            .Where(a => !a.IsRead)
            .Include(a => a.Ticket)
            .OrderByDescending(a => a.CreatedAt)
            .ToListAsync(cancellationToken);
    }

    public async Task MarkAsReadAsync(int alertId, CancellationToken cancellationToken = default)
    {
        var alert = await _context.Alerts.FindAsync(alertId);
        if (alert != null)
        {
            alert.IsRead = true;
            await _context.SaveChangesAsync(cancellationToken);
        }
    }
}