using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using OpiSupport.Application.Queries.GetSlaReport;

namespace OpiSupport.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize(Roles = "Supervisor")] // Solo Supervisores pueden ver el reporte
    public class ReportsController : ControllerBase
    {
        private readonly IMediator _mediator;

        public ReportsController(IMediator mediator)
        {
            _mediator = mediator;
        }

        [HttpGet("sla-compliance")]
        public async Task<IActionResult> GetSlaReport()
        {
            var query = new GetSlaReportQuery();
            var result = await _mediator.Send(query);

            if (!result.IsSuccess)
                return BadRequest(new { message = result.Error });

            return Ok(result.Value);
        }
    }
}