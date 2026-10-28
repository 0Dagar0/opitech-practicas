using System;
using System.Collections.Generic;
using System.Linq;

namespace OpiSupport.Domain.Shared
{
    /// <summary>
    /// Máquina de estados del ticket en un único lugar.
    /// El backend valida los cambios con esta tabla y el frontend dibuja los botones
    /// a partir de la misma definición, para que nunca se muestre un botón que el
    /// servidor vaya a rechazar.
    /// </summary>
    public static class TicketStatusTransitions
    {
        private static readonly Dictionary<string, string[]> Allowed =
            new Dictionary<string, string[]>(StringComparer.OrdinalIgnoreCase)
            {
                { "Abierto",    new[] { "En Proceso" } },
                { "Asignado",   new[] { "En Proceso" } },
                { "En Proceso", new[] { "Resuelto" } },
                { "Resuelto",   new[] { "Cerrado", "Reabierto" } },
                { "Reabierto",  new[] { "En Proceso" } },
                { "Cerrado",    new[] { "Reabierto" } }
            };

        /// <summary>
        /// Indica si se puede pasar del estado actual al nuevo.
        /// </summary>
        public static bool CanTransition(string currentStatus, string newStatus)
        {
            return Allowed.TryGetValue(currentStatus, out var targets)
                   && targets.Contains(newStatus, StringComparer.OrdinalIgnoreCase);
        }

        /// <summary>
        /// Estados a los que se puede pasar desde el estado actual.
        /// </summary>
        public static IReadOnlyList<string> GetAllowedTransitions(string currentStatus)
        {
            return Allowed.TryGetValue(currentStatus, out var targets)
                ? targets
                : Array.Empty<string>();
        }
    }
}
