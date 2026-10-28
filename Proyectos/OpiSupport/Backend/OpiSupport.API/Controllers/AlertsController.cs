using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

[ApiController]
[Route("api/[controller]")]
[Authorize(Roles = "Supervisor")]
public class AlertsController : ControllerBase
{
    private readonly IAlertRepository _alertRepository;

    public AlertsController(IAlertRepository alertRepository)
    {
        _alertRepository = alertRepository;
    }

    [HttpGet]
    public async Task<IActionResult> GetAlerts()
    {
        var alerts = await _alertRepository.GetUnreadAlertsAsync();
        return Ok(alerts.Select(a => new
        {
            a.Id,
            a.TicketId,
            a.Message,
            a.CreatedAt,
            TicketTitle = a.Ticket != null ? a.Ticket.Title : null
        }));
    }

    [HttpPut("{id}/read")]
    public async Task<IActionResult> MarkAsRead(int id)
    {
        await _alertRepository.MarkAsReadAsync(id);
        return NoContent();
    }
}