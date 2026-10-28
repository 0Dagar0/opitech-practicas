namespace OpiSupport.Application.DTOs
{
    public class TechnicianDto
    {
        public int Id { get; set; }
        public string FullName { get; set; } = string.Empty;
        public List<int> Specialties { get; set; } = new();
    }
}