using MediatR;
using Microsoft.EntityFrameworkCore;
using OpiSupport.Application.DTOs;
using OpiSupport.Application.Interfaces.Repositories;
using OpiSupport.Application.Shared;

namespace OpiSupport.Application.Queries.GetSlaReport
{
    public class GetSlaReportQueryHandler : IRequestHandler<GetSlaReportQuery, Result<SlaReportDto>>
    {
        private readonly ITicketRepository _ticketRepository;

        public GetSlaReportQueryHandler(ITicketRepository ticketRepository)
        {
            _ticketRepository = ticketRepository;
        }

        public async Task<Result<SlaReportDto>> Handle(GetSlaReportQuery request, CancellationToken cancellationToken)
        {
            try
            {
                // 1. Obtener todos los tickets resueltos (con ResolvedAt != null)
                var resolvedTickets = await _ticketRepository.GetQueryable()
                    .Include(t => t.AssignedToUser)
                    .Include(t => t.Category)
                    .Where(t => t.ResolvedAt.HasValue)
                    .ToListAsync(cancellationToken);

                if (!resolvedTickets.Any())
                    return Result<SlaReportDto>.Success(new SlaReportDto
                    {
                        GlobalCompliancePercentage = 0,
                        Technicians = new List<TechnicianSlaDto>(),
                        Categories = new List<CategorySlaDto>()
                    });

                // 2. Calcular estadísticas globales
                int totalResolved = resolvedTickets.Count;
                int compliantGlobal = resolvedTickets.Count(t => t.ResolvedAt!.Value <= t.SLA_Deadline);
                int nonCompliantGlobal = totalResolved - compliantGlobal;
                double globalPercentage = totalResolved > 0 ? (double)compliantGlobal / totalResolved * 100 : 0;

                // 3. Agrupar por técnico (solo tickets con técnico asignado)
                var technicianGroups = resolvedTickets
                    .Where(t => t.AssignedToId.HasValue)
                    .GroupBy(t => new { t.AssignedToId!.Value, t.AssignedToUser!.FullName })
                    .Select(g => new TechnicianSlaDto
                    {
                        TechnicianId = g.Key.Value,
                        TechnicianName = g.Key.FullName,
                        TotalResolved = g.Count(),
                        Compliant = g.Count(t => t.ResolvedAt!.Value <= t.SLA_Deadline),
                        NonCompliant = g.Count(t => t.ResolvedAt!.Value > t.SLA_Deadline),
                        CompliancePercentage = g.Count() > 0
                            ? (double)g.Count(t => t.ResolvedAt!.Value <= t.SLA_Deadline) / g.Count() * 100
                            : 0
                    })
                    .OrderByDescending(d => d.CompliancePercentage)
                    .ToList();

                // 4. Agrupar por categoría
                var categoryGroups = resolvedTickets
                    .GroupBy(t => new { t.CategoryId, t.Category!.Name })
                    .Select(g => new CategorySlaDto
                    {
                        CategoryId = g.Key.CategoryId,
                        CategoryName = g.Key.Name,
                        TotalResolved = g.Count(),
                        Compliant = g.Count(t => t.ResolvedAt!.Value <= t.SLA_Deadline),
                        NonCompliant = g.Count(t => t.ResolvedAt!.Value > t.SLA_Deadline),
                        CompliancePercentage = g.Count() > 0
                            ? (double)g.Count(t => t.ResolvedAt!.Value <= t.SLA_Deadline) / g.Count() * 100
                            : 0
                    })
                    .OrderByDescending(d => d.CompliancePercentage)
                    .ToList();

                // 5. Construir respuesta
                var report = new SlaReportDto
                {
                    GlobalCompliancePercentage = Math.Round(globalPercentage, 2),
                    Technicians = technicianGroups,
                    Categories = categoryGroups
                };

                return Result<SlaReportDto>.Success(report);
            }
            catch (Exception ex)
            {
                return Result<SlaReportDto>.Failure($"Error al generar el reporte SLA: {ex.Message}");
            }
        }
    }
}