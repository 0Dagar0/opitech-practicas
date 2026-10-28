using Microsoft.EntityFrameworkCore;
using OpiSupport.Application.DTOs;
using OpiSupport.Domain.Entities;
using System.Collections.Generic;
using System.Threading;
using System.Threading.Tasks;

namespace OpiSupport.Application.Interfaces.Repositories
{
    public interface IUserRepository
    {
        Task<User?> GetByIdAsync(int id, CancellationToken cancellationToken = default);
        Task<User?> GetByEmployeeCodeAsync(string employeeCode, CancellationToken cancellationToken = default);
        Task<User?> GetByEmailAsync(string email, CancellationToken cancellationToken = default);
        Task AddAsync(User user, CancellationToken cancellationToken = default);
        void Update(User user);
        Task<bool> ExistsAsync(int id, CancellationToken cancellationToken = default);

        // NUEVO: Obtener todos los técnicos activos con sus especialidades
        Task<List<User>> GetAllActiveTechniciansAsync(CancellationToken cancellationToken = default);
        Task<List<User>> GetActiveTechniciansAsync(CancellationToken cancellationToken = default);
        IQueryable<User> GetQueryable();
        Task<List<TechnicianDto>> GetActiveTechniciansWithSpecialtiesAsync(CancellationToken cancellationToken = default);

    }
}