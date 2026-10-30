using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using Moq;
using OpiSupport.Application.Commands.AssignTicket;
using OpiSupport.Application.Interfaces;
using OpiSupport.Application.Interfaces.Repositories;
using OpiSupport.Domain.Entities;
using Xunit;

namespace OpiSupport.Tests.Application
{
    /// <summary>
    /// Pruebas de la reasignación de tickets.
    /// Regla principal: un ticket solo puede reasignarse a un técnico activo
    /// que tenga la especialidad (categoría) del ticket.
    /// </summary>
    public class AssignTicketCommandHandlerTests
    {
        private const int TicketId = 20;
        private const int CategoryId = 2;      // Software
        private const int OtherCategoryId = 1; // Hardware
        private const int TechnicianId = 7;
        private const int SupervisorId = 1;

        private readonly Mock<ITicketRepository> _ticketRepository = new();
        private readonly Mock<IUserRepository> _userRepository = new();
        private readonly Mock<ITechnicianSpecialtyRepository> _specialtyRepository = new();
        private readonly Mock<IStatusHistoryRepository> _statusHistoryRepository = new();
        private readonly Mock<IUnitOfWork> _unitOfWork = new();

        private static Ticket CreateTicket(string status = "Abierto") => new()
        {
            Id = TicketId,
            Title = "prueba de reasignación",
            Description = "ticket de prueba",
            Priority = "Media",
            Status = status,
            CategoryId = CategoryId,
            AreaId = 1,
            CreatedById = 3,
            Category = new Category { Id = CategoryId, Name = "Software" }
        };

        private static User CreateTechnician(bool isActive = true) => new()
        {
            Id = TechnicianId,
            FullName = "Técnico de prueba",
            EmployeeCode = "TEC-001",
            Role = "Tecnico",
            IsActive = isActive
        };

        private AssignTicketCommandHandler CreateHandler(
            Ticket ticket,
            IEnumerable<TechnicianSpecialty> specialties)
        {
            _ticketRepository
                .Setup(r => r.GetByIdAsync(TicketId, It.IsAny<CancellationToken>()))
                .ReturnsAsync(ticket);
            _userRepository
                .Setup(r => r.GetByIdAsync(TechnicianId, It.IsAny<CancellationToken>()))
                .ReturnsAsync(CreateTechnician());
            _specialtyRepository
                .Setup(r => r.GetByTechnicianIdAsync(TechnicianId, It.IsAny<CancellationToken>()))
                .ReturnsAsync(specialties);
            _statusHistoryRepository
                .Setup(r => r.AddAsync(It.IsAny<StatusHistory>(), It.IsAny<CancellationToken>()))
                .Returns(Task.CompletedTask);
            _unitOfWork
                .Setup(u => u.SaveChangesAsync(It.IsAny<CancellationToken>()))
                .ReturnsAsync(1);

            return new AssignTicketCommandHandler(
                _ticketRepository.Object,
                _userRepository.Object,
                _specialtyRepository.Object,
                _statusHistoryRepository.Object,
                _unitOfWork.Object);
        }

        private static AssignTicketCommand Command(string role = "Supervisor", int userId = SupervisorId)
            => new()
            {
                TicketId = TicketId,
                TechnicianId = TechnicianId,
                UserId = userId,
                Role = role
            };

        [Fact]
        public async Task Reasignar_a_un_tecnico_con_la_especialidad_funciona()
        {
            var ticket = CreateTicket();
            var specialties = new List<TechnicianSpecialty>
            {
                new() { TechnicianId = TechnicianId, CategoryId = CategoryId }
            };
            var handler = CreateHandler(ticket, specialties);

            var result = await handler.Handle(Command(), CancellationToken.None);

            Assert.True(result.IsSuccess);
            Assert.Equal(TechnicianId, ticket.AssignedToId);
            Assert.Equal("Asignado", ticket.Status);
            _statusHistoryRepository.Verify(r => r.AddAsync(
                It.IsAny<StatusHistory>(), It.IsAny<CancellationToken>()), Times.Once);
        }

        [Fact]
        public async Task Reasignar_a_un_tecnico_sin_la_especialidad_falla()
        {
            var ticket = CreateTicket();
            var specialties = new List<TechnicianSpecialty>
            {
                new() { TechnicianId = TechnicianId, CategoryId = OtherCategoryId }
            };
            var handler = CreateHandler(ticket, specialties);

            var result = await handler.Handle(Command(), CancellationToken.None);

            Assert.False(result.IsSuccess);
            Assert.Contains("especialidad", result.Error!, StringComparison.OrdinalIgnoreCase);
            Assert.Null(ticket.AssignedToId);
            Assert.Equal("Abierto", ticket.Status);
            _statusHistoryRepository.Verify(r => r.AddAsync(
                It.IsAny<StatusHistory>(), It.IsAny<CancellationToken>()), Times.Never);
        }

        [Fact]
        public async Task Reasignar_a_un_tecnico_sin_especialidades_falla()
        {
            var ticket = CreateTicket();
            var handler = CreateHandler(ticket, Enumerable.Empty<TechnicianSpecialty>());

            var result = await handler.Handle(Command(), CancellationToken.None);

            Assert.False(result.IsSuccess);
            Assert.Null(ticket.AssignedToId);
        }

        [Fact]
        public async Task Un_tecnico_no_puede_reasignar_tickets()
        {
            var ticket = CreateTicket();
            var handler = CreateHandler(
                ticket,
                new List<TechnicianSpecialty> { new() { TechnicianId = TechnicianId, CategoryId = CategoryId } });

            var result = await handler.Handle(
                Command(role: "Tecnico", userId: TechnicianId),
                CancellationToken.None);

            Assert.False(result.IsSuccess);
            Assert.Null(ticket.AssignedToId);
        }
    }
}
