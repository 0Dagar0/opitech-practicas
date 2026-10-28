namespace OpiSupport.Application.DTOs
{
    public class CreateUserDto
    {
        public required string FullName { get; set; }
        public required string EmployeeCode { get; set; }
        public string? Email { get; set; }
        public required string Password { get; set; }
        public required string Role { get; set; } // "Colaborador", "Tecnico", "Supervisor"
        public List<int>? SpecialtyCategoryIds { get; set; } // Solo para técnicos
    }
}