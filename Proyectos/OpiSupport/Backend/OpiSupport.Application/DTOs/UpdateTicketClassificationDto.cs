namespace OpiSupport.Application.DTOs
{
    /// <summary>
    /// Cuerpo del endpoint PUT /api/tickets/{id}/classification.
    /// </summary>
    public class UpdateTicketClassificationDto
    {
        public int CategoryId { get; set; }
        public required string Priority { get; set; }
        public required string Reason { get; set; }
    }
}
