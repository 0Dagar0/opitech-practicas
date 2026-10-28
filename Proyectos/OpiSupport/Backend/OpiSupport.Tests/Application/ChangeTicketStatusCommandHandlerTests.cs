using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using Moq;
using OpiSupport.Application.Commands.ChangeTicketStatus;
using OpiSupport.Application.Interfaces;
using OpiSupport.Application.Interfaces.Repositories;
using OpiSupport.Domain.Entities;
using Xunit;

namespace OpiSupport.Tests.Application
{
    /// <summary>
    /// Pruebas del cambio de estado de un ticket.
    /// Cubren los dos bugs corregidos: el comentario de resolución que se descartaba
    /// y el ticket que quedaba atrapado en estado "Reabierto".
    /// </summary>
    public class ChangeTicketStatusCommandHandlerTests
    {
        private const int TicketId = 11;
        private const int TechnicianId = 5;
        private const int CollaboratorId = 9;

        private readonly Mock<ITicketRepository> _ticketRepository = new();
        private readonly Mock<IUserRepository> _userRepository = new();
        private readonly Mock<IStatusHistoryRepository> _statusHistoryRepository = new();
        private readonly Mock<ICommentRepository> _commentRepository = new();
        private readonly Mock<IUnitOfWork> _unitOfWork = new();

        private static Ticket CreateTicket(string status, DateTime? resolvedAt = null) => new()
        {
            Id = TicketId,
            Title = "prueba tickets asignado hardware",
            Description = "prueba de asignación de ticket",
            Priority = "Crítica",
            Status = status,
            CreatedById = CollaboratorId,
            AssignedToId = TechnicianId,
            ResolvedAt = resolvedAt
        };

        private ChangeTicketStatusCommandHandler CreateHandler(Ticket ticket)
        {
            _ticketRepository
                .Setup(r => r.GetByIdAsync(TicketId, It.IsAny<CancellationToken>()))
                .ReturnsAsync(ticket);
            _ticketRepository
                .Setup(r => r.GetQueryable())
                .Returns(new List<Ticket>().AsQueryable());
            _statusHistoryRepository
                .Setup(r => r.AddAsync(It.IsAny<StatusHistory>(), It.IsAny<CancellationToken>()))
                .Returns(Task.CompletedTask);
            _commentRepository
                .Setup(r => r.AddAsync(It.IsAny<Comment>(), It.IsAny<CancellationToken>()))
                .ReturnsAsync((Comment comment, CancellationToken _) => comment);
            _unitOfWork
                .Setup(u => u.SaveChangesAsync(It.IsAny<CancellationToken>()))
                .ReturnsAsync(1);

            return new ChangeTicketStatusCommandHandler(
                _ticketRepository.Object,
                _userRepository.Object,
                _statusHistoryRepository.Object,
                _commentRepository.Object,
                _unitOfWork.Object);
        }

        private static ChangeTicketStatusCommand Command(string newStatus, string? comment, string role = "Tecnico", int userId = TechnicianId)
            => new()
            {
                TicketId = TicketId,
                NewStatus = newStatus,
                Comment = comment,
                Role = role,
                UserId = userId
            };

        [Fact]
        public async Task Resolver_guarda_el_comentario_de_resolucion()
        {
            var ticket = CreateTicket("En Proceso");
            var handler = CreateHandler(ticket);

            var result = await handler.Handle(
                Command("Resuelto", "  se cambió el cable de red  "),
                CancellationToken.None);

            Assert.True(result.IsSuccess);
            _commentRepository.Verify(r => r.AddAsync(
                It.Is<Comment>(c =>
                    c.TicketId == TicketId &&
                    c.UserId == TechnicianId &&
                    c.Text == "se cambió el cable de red"),
                It.IsAny<CancellationToken>()), Times.Once);
        }

        [Fact]
        public async Task Resolver_sin_comentario_falla_y_no_guarda_nada()
        {
            var ticket = CreateTicket("En Proceso");
            var handler = CreateHandler(ticket);

            var result = await handler.Handle(Command("Resuelto", null), CancellationToken.None);

            Assert.False(result.IsSuccess);
            Assert.Contains("comentario", result.Error!, StringComparison.OrdinalIgnoreCase);
            _commentRepository.Verify(r => r.AddAsync(
                It.IsAny<Comment>(), It.IsAny<CancellationToken>()), Times.Never);
        }

        [Fact]
        public async Task Un_supervisor_tambien_necesita_comentario_para_resolver()
        {
            var ticket = CreateTicket("En Proceso");
            var handler = CreateHandler(ticket);

            var result = await handler.Handle(
                Command("Resuelto", "   ", role: "Supervisor", userId: 1),
                CancellationToken.None);

            Assert.False(result.IsSuccess);
            _commentRepository.Verify(r => r.AddAsync(
                It.IsAny<Comment>(), It.IsAny<CancellationToken>()), Times.Never);
        }

        [Fact]
        public async Task Un_ticket_reabierto_puede_pasar_a_en_proceso()
        {
            var ticket = CreateTicket("Reabierto");
            var handler = CreateHandler(ticket);

            var result = await handler.Handle(Command("En Proceso", null), CancellationToken.None);

            Assert.True(result.IsSuccess);
            Assert.Equal("En Proceso", ticket.Status);
            Assert.NotNull(ticket.StartedAt);
        }

        [Fact]
        public async Task No_se_puede_saltar_de_abierto_a_resuelto()
        {
            var ticket = CreateTicket("Abierto");
            var handler = CreateHandler(ticket);

            var result = await handler.Handle(Command("Resuelto", "listo"), CancellationToken.None);

            Assert.False(result.IsSuccess);
            Assert.Equal("Abierto", ticket.Status);
        }

        [Fact]
        public async Task Reabrir_dentro_de_las_48_horas_incrementa_el_contador()
        {
            var ticket = CreateTicket("Resuelto", DateTime.UtcNow.AddHours(-2));
            var handler = CreateHandler(ticket);

            var result = await handler.Handle(
                Command("Reabierto", "sigue fallando", role: "Colaborador", userId: CollaboratorId),
                CancellationToken.None);

            Assert.True(result.IsSuccess);
            Assert.Equal("Reabierto", ticket.Status);
            Assert.Equal(1, ticket.ReopenCount);
        }

        [Fact]
        public async Task Reabrir_fuera_del_plazo_de_48_horas_falla()
        {
            var ticket = CreateTicket("Resuelto", DateTime.UtcNow.AddHours(-49));
            var handler = CreateHandler(ticket);

            var result = await handler.Handle(
                Command("Reabierto", "sigue fallando", role: "Colaborador", userId: CollaboratorId),
                CancellationToken.None);

            Assert.False(result.IsSuccess);
            Assert.Contains("48", result.Error!);
            Assert.Equal("Resuelto", ticket.Status);
        }

        [Fact]
        public async Task Un_colaborador_no_puede_cambiar_el_estado_a_otra_cosa_que_no_sea_reabrir()
        {
            var ticket = CreateTicket("En Proceso");
            var handler = CreateHandler(ticket);

            var result = await handler.Handle(
                Command("Resuelto", "ya está", role: "Colaborador", userId: CollaboratorId),
                CancellationToken.None);

            Assert.False(result.IsSuccess);
            Assert.Equal("En Proceso", ticket.Status);
        }
    }
}
