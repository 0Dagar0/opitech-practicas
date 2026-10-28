using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using OpiSupport.Application.Interfaces.Repositories;

namespace OpiSupport.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class AreasController : ControllerBase
    {
        private readonly IAreaRepository _areaRepository;

        public AreasController(IAreaRepository areaRepository)
        {
            _areaRepository = areaRepository;
        }

        [HttpGet]
        public async Task<IActionResult> GetAreas()
        {
            var areas = await _areaRepository.GetAllAsync();
            return Ok(areas.Select(a => new { a.Id, a.Name }));
        }
    }
}