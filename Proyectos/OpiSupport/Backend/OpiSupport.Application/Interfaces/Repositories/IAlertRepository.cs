using OpiSupport.Domain.Entities;

public interface IAlertRepository
{
    Task<List<Alert>> GetUnreadAlertsAsync(CancellationToken cancellationToken = default);
    Task MarkAsReadAsync(int alertId, CancellationToken cancellationToken = default);
}