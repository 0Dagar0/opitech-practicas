using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using Moq;
using OpiSupport.Application.Commands.UpdateTicketClassification;
using OpiSupport.Application.Interfaces;
using OpiSupport.Application.Interfaces.Repositories;
using OpiSupport.Application.Services;
using OpiSupport.Domain.Entities;
using Xunit;

namespace OpiSupport.Tests.Application
{
    /// <summary>
    /// Pruebas del cambio de clasificación (categoría/prioridad) por parte de SYS.
    /// Cubren las reglas acordadas: permiso, motivo obligatorio, reasignación por
    /// especialidad y recálculo del SLA.
    /// </summary>
    public class UpdateTicketClassificationCommandHandlerTests
    {
        private const int TicketId = 42;
        private const int SoftwareId = 2;
        private const int HardwareId = 1;
        private const int TechnicianId = 5;
        private const int ReplacementId = 8;
        private const int SystemUserId = 1;

        private static readonly DateTime CreatedAt = new(2026, 11, 12, 9, 0, 0, DateTimeKind.Utc);

        private readonly Mock<ITicketRepository> _ticketRepository = new();
        private readonly Mock<ICategoryRepository> _categoryRepository = new();
        private readonly Mock<ITechnicianSpecialtyRepository> _specialtyRepository = new();
        private readonly Mock<IUserRepository> _userRepository = new();
        private readonly Mock<IStatusHistoryRepository> _statusHistoryRepository = new();
        private readonly Mock<IUnitOfWork> _unitOfWork = new();

        private static Ticket CreateTicket(string status = "Asignado") => new()
        {
            Id = TicketId,
            Title = "Impresora no imprime",
            Description = "ticket de prueba",
            Priority = "Media",
            Status = status,
            CategoryId = HardwareId,
            AreaId = 1,
            CreatedById = 3,
            AssignedToId = TechnicianId,
            CreatedAt = CreatedAt,
            SLA_Deadline = CreatedAt.AddHours(8),
            Category = new Category { Id = HardwareId, Name = "Hardware" },
            AssignedToUser = new User { Id = TechnicianId, FullName = "Técnico actual" }
        };

        private static User CreateTechnician(int id, string name, params int[] categoryIds) => new()
        {
            Id = id,
            FullName = name,
            EmployeeCode = $"TEC-{id}",
            Role = "Tecnico",
            IsActive = true,
            Specialties = categoryIds
                .Select(categoryId => new TechnicianSpecialty { TechnicianId = id, CategoryId = categoryId })
                .ToList()
        };

        private UpdateTicketClassificationCommandHandler CreateHandler(
            Ticket ticket,
            Category newCategory,
            IEnumerable<TechnicianSpecialty> currentSpecialties,
            IEnumerable<User> availableTechnicians,
            IEnumerable<Ticket> assignedTickets = null!)
        {
            _ticketRepository
                .Setup(r => r.GetByIdAsync(TicketId, It.IsAny<CancellationToken>()))
                .ReturnsAsync(ticket);
            _ticketRepository
                .Setup(r => r.GetQueryable())
                .Returns((assignedTickets ?? Enumerable.Empty<Ticket>()).AsQueryable());
            _categoryRepository
                .Setup(r => r.GetByIdAsync(newCategory.Id, It.IsAny<CancellationToken>()))
                .ReturnsAsync(newCategory);
            _specialtyRepository
                .Setup(r => r.GetByTechnicianIdAsync(It.IsAny<int>(), It.IsAny<CancellationToken>()))
                .ReturnsAsync(currentSpecialties);
            _userRepository
                .Setup(r => r.GetAllActiveTechniciansAsync(It.IsAny<CancellationToken>()))
                .ReturnsAsync(availableTechnicians.ToList());
            _statusHistoryRepository
                .Setup(r => r.AddAsync(It.IsAny<StatusHistory>(), It.IsAny<CancellationToken>()))
                .Returns(Task.CompletedTask);
            _unitOfWork
                .Setup(u => u.SaveChangesAsync(It.IsAny<CancellationToken>()))
                .ReturnsAsync(1);

            var assignmentService = new TicketAssignmentService(
                _userRepository.Object,
                _ticketRepository.Object);

            return new UpdateTicketClassificationCommandHandler(
                _ticketRepository.Object,
                _categoryRepository.Object,
                _specialtyRepository.Object,
                _statusHistoryRepository.Object,
                _unitOfWork.Object,
                assignmentService);
        }

        private static UpdateTicketClassificationCommand Command(
            int categoryId = HardwareId,
            string priority = "Media",
            string reason = "El ticket estaba mal clasificado",
            string role = "Sistema")
            => new()
            {
                TicketId = TicketId,
                CategoryId = categoryId,
                Priority = priority,
                Reason = reason,
                UserId = SystemUserId,
                Role = role
            };

        private static Category SoftwareCategory() => new() { Id = SoftwareId, Name = "Software" };

        [Fact]
        public async Task Un_usuario_que_no_es_Sistema_no_puede_cambiar_la_clasificacion()
        {
            var ticket = CreateTicket();
            var handler = CreateHandler(
                ticket, SoftwareCategory(), Enumerable.Empty<TechnicianSpecialty>(), Enumerable.Empty<User>());

            var result = await handler.Handle(Command(role: "Supervisor"), CancellationToken.None);

            Assert.False(result.IsSuccess);
            Assert.Contains("Sistema", result.Error!);
            _statusHistoryRepository.Verify(
                r => r.AddAsync(It.IsAny<StatusHistory>(), It.IsAny<CancellationToken>()), Times.Never);
        }

        [Fact]
        public async Task El_motivo_es_obligatorio()
        {
            var ticket = CreateTicket();
            var handler = CreateHandler(
                ticket, SoftwareCategory(), Enumerable.Empty<TechnicianSpecialty>(), Enumerable.Empty<User>());

            var result = await handler.Handle(Command(reason: "corto"), CancellationToken.None);

            Assert.False(result.IsSuccess);
            Assert.Contains("motivo", result.Error!, StringComparison.OrdinalIgnoreCase);
            _unitOfWork.Verify(u => u.SaveChangesAsync(It.IsAny<CancellationToken>()), Times.Never);
        }

        [Fact]
        public async Task Sin_cambios_reales_devuelve_error()
        {
            var ticket = CreateTicket();
            // Misma categoría (Hardware) y misma prioridad (Media)
            var handler = CreateHandler(
                ticket, new Category { Id = HardwareId, Name = "Hardware" },
                Enumerable.Empty<TechnicianSpecialty>(), Enumerable.Empty<User>());

            var result = await handler.Handle(Command(), CancellationToken.None);

            Assert.False(result.IsSuccess);
            Assert.Contains("No se detectaron cambios", result.Error!);
        }

        [Fact]
        public async Task Cambiar_la_prioridad_recalcula_el_SLA_desde_la_creacion()
        {
            var ticket = CreateTicket();
            var handler = CreateHandler(
                ticket, new Category { Id = HardwareId, Name = "Hardware" },
                Enumerable.Empty<TechnicianSpecialty>(), Enumerable.Empty<User>());

            var result = await handler.Handle(Command(priority: "Alta"), CancellationToken.None);

            Assert.True(result.IsSuccess);
            Assert.Equal("Alta", ticket.Priority);
            Assert.Equal(CreatedAt.AddHours(4), ticket.SLA_Deadline);
            _statusHistoryRepository.Verify(r => r.AddAsync(
                It.Is<StatusHistory>(h =>
                    h.Note!.Contains("Prioridad: Media → Alta")
                    && h.Note.Contains("SLA:")
                    && h.Note.Contains("Motivo:")),
                It.IsAny<CancellationToken>()), Times.Once);
        }

        [Fact]
        public async Task Cambiar_la_categoria_reasigna_si_el_tecnico_no_tiene_la_especialidad()
        {
            var ticket = CreateTicket(status: "Asignado");
            var replacement = CreateTechnician(ReplacementId, "Laura Gómez", SoftwareId);
            var handler = CreateHandler(
                ticket,
                SoftwareCategory(),
                new List<TechnicianSpecialty> { new() { TechnicianId = TechnicianId, CategoryId = HardwareId } },
                new[] { replacement });

            var result = await handler.Handle(Command(categoryId: SoftwareId), CancellationToken.None);

            Assert.True(result.IsSuccess);
            Assert.Equal(SoftwareId, ticket.CategoryId);
            Assert.Equal(ReplacementId, ticket.AssignedToId);
            Assert.Equal("Asignado", ticket.Status);
            _statusHistoryRepository.Verify(r => r.AddAsync(
                It.Is<StatusHistory>(h => h.Note!.Contains("Reasignado de") && h.Note.Contains("Laura Gómez")),
                It.IsAny<CancellationToken>()), Times.Once);
        }

        [Fact]
        public async Task Cambiar_la_categoria_conserva_al_tecnico_si_ya_tiene_la_especialidad()
        {
            var ticket = CreateTicket(status: "En Proceso");
            var handler = CreateHandler(
                ticket,
                SoftwareCategory(),
                new List<TechnicianSpecialty> { new() { TechnicianId = TechnicianId, CategoryId = SoftwareId } },
                Enumerable.Empty<User>());

            var result = await handler.Handle(Command(categoryId: SoftwareId), CancellationToken.None);

            Assert.True(result.IsSuccess);
            Assert.Equal(TechnicianId, ticket.AssignedToId);
            Assert.Equal("En Proceso", ticket.Status);
            _statusHistoryRepository.Verify(r => r.AddAsync(
                It.Is<StatusHistory>(h => h.Note!.Contains("conserva la asignación")),
                It.IsAny<CancellationToken>()), Times.Once);
        }

        [Fact]
        public async Task Si_no_hay_tecnicos_con_la_nueva_especialidad_el_ticket_queda_sin_asignar()
        {
            var ticket = CreateTicket(status: "Asignado");
            var handler = CreateHandler(
                ticket,
                SoftwareCategory(),
                new List<TechnicianSpecialty> { new() { TechnicianId = TechnicianId, CategoryId = HardwareId } },
                Enumerable.Empty<User>());

            var result = await handler.Handle(Command(categoryId: SoftwareId), CancellationToken.None);

            Assert.True(result.IsSuccess);
            Assert.Null(ticket.AssignedToId);
            Assert.Equal("Abierto", ticket.Status);
            _statusHistoryRepository.Verify(r => r.AddAsync(
                It.Is<StatusHistory>(h => h.Note!.Contains("sin asignar")),
                It.IsAny<CancellationToken>()), Times.Once);
        }

        [Fact]
        public async Task Un_ticket_resuelto_conserva_su_tecnico_al_cambiar_de_categoria()
        {
            var ticket = CreateTicket(status: "Resuelto");
            ticket.ResolvedAt = CreatedAt.AddHours(6);
            var replacement = CreateTechnician(ReplacementId, "Laura Gómez", SoftwareId);
            var handler = CreateHandler(
                ticket,
                SoftwareCategory(),
                new List<TechnicianSpecialty> { new() { TechnicianId = TechnicianId, CategoryId = HardwareId } },
                new[] { replacement });

            var result = await handler.Handle(Command(categoryId: SoftwareId), CancellationToken.None);

            Assert.True(result.IsSuccess);
            Assert.Equal(TechnicianId, ticket.AssignedToId);
            Assert.Equal("Resuelto", ticket.Status);
        }

        [Fact]
        public async Task En_un_ticket_resuelto_se_recalcula_el_SLA_pero_no_se_marca_vencido()
        {
            var ticket = CreateTicket(status: "Resuelto");
            ticket.CreatedAt = DateTime.UtcNow.AddHours(-100);
            ticket.SLA_Deadline = ticket.CreatedAt.AddHours(8);
            ticket.IsOverdue = false;
            var handler = CreateHandler(
                ticket, new Category { Id = HardwareId, Name = "Hardware" },
                Enumerable.Empty<TechnicianSpecialty>(), Enumerable.Empty<User>());

            var result = await handler.Handle(Command(priority: "Alta"), CancellationToken.None);

            Assert.True(result.IsSuccess);
            Assert.Equal(ticket.CreatedAt.AddHours(4), ticket.SLA_Deadline);
            // El vencimiento es histórico y no se altera en tickets finalizados
            Assert.False(ticket.IsOverdue);
        }
    }
}
