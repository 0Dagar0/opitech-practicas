namespace OpiSupport.Application.DTOs
{
    /// <summary>
    /// Cuerpo del endpoint PUT /api/users/{id}/name.
    /// </summary>
    public class UpdateUserNameDto
    {
        public required string FullName { get; set; }
    }
}
