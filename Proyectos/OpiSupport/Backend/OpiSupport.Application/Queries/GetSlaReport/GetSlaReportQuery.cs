using MediatR;
using OpiSupport.Application.DTOs;
using OpiSupport.Application.Shared;

namespace OpiSupport.Application.Queries.GetSlaReport
{
    public class GetSlaReportQuery : IRequest<Result<SlaReportDto>>
    {
        // No se necesita parámetros, es un reporte global
    }
}


