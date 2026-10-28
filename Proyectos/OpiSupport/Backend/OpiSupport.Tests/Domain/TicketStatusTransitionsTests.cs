using OpiSupport.Domain.Shared;
using Xunit;

namespace OpiSupport.Tests.Domain
{
    /// <summary>
    /// Pruebas de la máquina de estados del ticket.
    /// Es la lógica que causaba el bug del ticket que quedaba atrapado en "Reabierto".
    /// </summary>
    public class TicketStatusTransitionsTests
    {
        [Theory]
        [InlineData("Abierto", "En Proceso")]
        [InlineData("Asignado", "En Proceso")]
        [InlineData("En Proceso", "Resuelto")]
        [InlineData("Resuelto", "Cerrado")]
        [InlineData("Resuelto", "Reabierto")]
        [InlineData("Reabierto", "En Proceso")] // este caso estaba roto: no existía salida
        [InlineData("Cerrado", "Reabierto")]
        public void Permite_las_transiciones_validas(string estadoActual, string estadoNuevo)
        {
            Assert.True(TicketStatusTransitions.CanTransition(estadoActual, estadoNuevo));
        }

        [Theory]
        [InlineData("Abierto", "Resuelto")]   // no se puede saltar pasos
        [InlineData("Abierto", "Cerrado")]
        [InlineData("Asignado", "Resuelto")]
        [InlineData("En Proceso", "Reabierto")] // solo se reabre desde Resuelto o Cerrado
        [InlineData("Reabierto", "Cerrado")]
        [InlineData("Cerrado", "En Proceso")]
        public void Rechaza_las_transiciones_invalidas(string estadoActual, string estadoNuevo)
        {
            Assert.False(TicketStatusTransitions.CanTransition(estadoActual, estadoNuevo));
        }

        [Fact]
        public void Un_estado_desconocido_no_permite_nada()
        {
            Assert.False(TicketStatusTransitions.CanTransition("EstadoInventado", "Resuelto"));
            Assert.Empty(TicketStatusTransitions.GetAllowedTransitions("EstadoInventado"));
        }

        [Fact]
        public void Desde_reabierto_solo_se_puede_pasar_a_en_proceso()
        {
            var permitidas = TicketStatusTransitions.GetAllowedTransitions("Reabierto");

            Assert.Single(permitidas);
            Assert.Equal("En Proceso", permitidas[0]);
        }

        [Fact]
        public void Desde_cerrado_solo_se_puede_reabrir()
        {
            var permitidas = TicketStatusTransitions.GetAllowedTransitions("Cerrado");

            Assert.Single(permitidas);
            Assert.Equal("Reabierto", permitidas[0]);
        }
    }
}
