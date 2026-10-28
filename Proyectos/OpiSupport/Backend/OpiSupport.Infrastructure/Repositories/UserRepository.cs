using Microsoft.EntityFrameworkCore;
using OpiSupport.Application.DTOs;
using OpiSupport.Application.Interfaces.Repositories;
using OpiSupport.Domain.Entities;
using OpiSupport.Infrastructure.Data;

namespace OpiSupport.Infrastructure.Repositories
{
    public class UserRepository : IUserRepository
    {
        private readonly ApplicationDbContext _context;

        public UserRepository(ApplicationDbContext context)
        {
            _context = context;
        }

        public async Task<User?> GetByIdAsync(int id, CancellationToken cancellationToken = default)
        {
            return await _context.Users
                .Include(u => u.CreatedTickets)
                .Include(u => u.AssignedTickets)
                .FirstOrDefaultAsync(u => u.Id == id, cancellationToken);
        }

        public async Task<User?> GetByEmployeeCodeAsync(string employeeCode, CancellationToken cancellationToken = default)
        {
            return await _context.Users
                .FirstOrDefaultAsync(u => u.EmployeeCode == employeeCode, cancellationToken);
        }

        public async Task<User?> GetByEmailAsync(string email, CancellationToken cancellationToken = default)
        {
            return await _context.Users
                .FirstOrDefaultAsync(u => u.Email == email, cancellationToken);
        }

        public async Task AddAsync(User user, CancellationToken cancellationToken = default)
        {
            await _context.Users.AddAsync(user, cancellationToken);
        }

        public void Update(User user)
        {
            _context.Users.Update(user);
        }

        public async Task<bool> ExistsAsync(int id, CancellationToken cancellationToken = default)
        {
            return await _context.Users.AnyAsync(u => u.Id == id, cancellationToken);
        }

        public async Task<List<User>> GetAllActiveTechniciansAsync(CancellationToken cancellationToken = default)
        {
            return await _context.Users
                .Where(u => u.Role == "Tecnico" && u.IsActive)
                .Include(u => u.Specialties) // Incluye las especialidades para filtrar por categoría
                .ToListAsync(cancellationToken);
        }

        public async Task<List<User>> GetActiveTechniciansAsync(CancellationToken cancellationToken = default)
        {
            return await _context.Users
                .Where(u => u.Role == "Tecnico" && u.IsActive)
                .Select(u => new User { Id = u.Id, FullName = u.FullName }) // solo lo necesario
                .ToListAsync(cancellationToken);
        }

        public IQueryable<User> GetQueryable()
        {
            return _context.Users.AsQueryable();
        }

        public async Task<List<TechnicianDto>> GetActiveTechniciansWithSpecialtiesAsync(CancellationToken cancellationToken = default)
        {
            return await _context.Users
                .Where(u => u.Role == "Tecnico" && u.IsActive)
                .Include(u => u.Specialties)
                .Select(u => new TechnicianDto
                {
                    Id = u.Id,
                    FullName = u.FullName,
                    Specialties = u.Specialties.Select(s => s.CategoryId).ToList()
                })
                .ToListAsync(cancellationToken);
        }

    }
}