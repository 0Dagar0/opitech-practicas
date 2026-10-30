using MediatR;
using OpiSupport.Application.Shared;

namespace OpiSupport.Application.Commands.UpdateUserFullName
{
    /// <summary>
    /// Cambia el nombre completo de un usuario.
    /// Solo el perfil "Sistema" (SYS) tiene permiso para ejecutarlo.
    /// </summary>
    public class UpdateUserFullNameCommand : IRequest<Result<bool>>
    {
        public int UserId { get; set; }
        public required string FullName { get; set; }
        public int RequestedByUserId { get; set; }
        public string RequestedByRole { get; set; } = string.Empty;
    }
}
