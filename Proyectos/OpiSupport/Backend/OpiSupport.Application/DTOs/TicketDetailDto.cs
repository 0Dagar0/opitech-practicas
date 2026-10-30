using System;
using System.Collections.Generic;

namespace OpiSupport.Application.DTOs
{
    public class TicketDetailDto
    {
        public int Id { get; set; }
        public required string Title { get; set; }
        public required string Description { get; set; }
        public required string Status { get; set; }
        public required string Priority { get; set; }
        public int CategoryId { get; set; }
        public required string Category { get; set; }
        public required string Area { get; set; }
        public DateTime CreatedAt { get; set; }
        public DateTime? SLA_Deadline { get; set; }
        public int? AssignedToId { get; set; }
        public string? AssignedToFullName { get; set; }
        public required string CreatedByFullName { get; set; }
        public bool IsOverdue { get; set; }
        public int ReopenCount { get; set; }
        public List<CommentDto> Comments { get; set; } = new();
        public List<StatusHistoryDto> History { get; set; } = new();
        public DateTime? ResolvedAt { get; set; }
    }
}


