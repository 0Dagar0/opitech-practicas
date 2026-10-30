using OpiSupport.Application.Interfaces.Repositories;
using OpiSupport.Domain.Entities;

namespace OpiSupport.Application.Services
{
    /// <summary>
    /// Regla única de asignación automática de tickets.
    /// Se usa al crear un ticket y al cambiar su categoría, para que ambos
    /// caminos elijan al técnico de la misma forma:
    ///   1. Técnicos activos con la especialidad (categoría) del ticket.
    ///   2. Solo los que tengan menos de <see cref="MaxActiveTicketsPerTechnician"/> tickets activos.
    ///   3. Se elige el que menos tickets activos tenga.
    /// </summary>
    public class TicketAssignmentService
    {
        // Tope de carga por técnico. Coincide con el valor del seed
        // (SystemConfig "MaxTicketsPerTechnician" = 5).
        public const int MaxActiveTicketsPerTechnician = 5;

        private static readonly string[] ActiveStatuses = { "Abierto", "Asignado", "En Proceso" };

        private readonly IUserRepository _userRepository;
        private readonly ITicketRepository _ticketRepository;

        public TicketAssignmentService(
            IUserRepository userRepository,
            ITicketRepository ticketRepository)
        {
            _userRepository = userRepository;
            _ticketRepository = ticketRepository;
        }

        /// <summary>
        /// Devuelve el técnico elegido o null si no hay ninguno disponible.
        /// </summary>
        public async Task<User?> FindAvailableTechnicianAsync(int categoryId, CancellationToken cancellationToken = default)
        {
            // 1. Técnicos activos con sus especialidades
            var technicians = await _userRepository.GetAllActiveTechniciansAsync(cancellationToken);

            // 2. Solo los que tengan la especialidad de la categoría
            var candidates = technicians
                .Where(t => t.Specialties != null && t.Specialties.Any(s => s.CategoryId == categoryId))
                .ToList();

            if (candidates.Count == 0)
                return null;

            // 3. Elegir el que menos tickets activos tenga, sin superar el tope
            var available = candidates
                .Select(t => new
                {
                    Technician = t,
                    ActiveTicketsCount = _ticketRepository.GetQueryable()
                        .Count(ticket => ticket.AssignedToId == t.Id
                                         && ActiveStatuses.Contains(ticket.Status))
                })
                .Where(x => x.ActiveTicketsCount < MaxActiveTicketsPerTechnician)
                .OrderBy(x => x.ActiveTicketsCount)
                .FirstOrDefault();

            return available?.Technician;
        }
    }
}
