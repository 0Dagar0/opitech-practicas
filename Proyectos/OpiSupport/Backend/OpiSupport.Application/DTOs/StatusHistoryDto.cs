using System;

namespace OpiSupport.Application.DTOs
{
    public class StatusHistoryDto
    {
        public DateTime Date { get; set; }
        public string? PreviousStatus { get; set; }
        public required string NewStatus { get; set; }
        public string? Note { get; set; }
        public required string User { get; set; }
    }
}