namespace OpiSupport.Application.Services
{
    /// <summary>
    /// Cálculo del plazo (SLA) de un ticket según su prioridad.
    /// El plazo siempre se cuenta desde la fecha de creación del ticket,
    /// para que recalcular la prioridad no regale tiempo extra.
    /// </summary>
    public static class SlaCalculator
    {
        public static DateTime CalculateDeadline(DateTime createdAt, string priority)
        {
            return priority switch
            {
                "Crítica" => createdAt.AddHours(2),
                "Alta" => createdAt.AddHours(4),
                "Media" => createdAt.AddHours(8),
                "Baja" => createdAt.AddHours(24),
                _ => createdAt.AddHours(24)
            };
        }
    }
}
