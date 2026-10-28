using System;

namespace OpiSupport.Application.DTOs
{
    public class CommentDto
    {
        public int Id { get; set; }
        public required string Author { get; set; }
        public required string Text { get; set; }
        public DateTime CreatedAt { get; set; }
    }
}


