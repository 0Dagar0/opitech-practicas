using MediatR;
using Microsoft.EntityFrameworkCore;
using OpiSupport.Application.DTOs;
using OpiSupport.Application.Interfaces.Repositories;
using OpiSupport.Application.Shared;

namespace OpiSupport.Application.Queries.GetUserList
{
    public class GetUserListQueryHandler : IRequestHandler<GetUserListQuery, Result<List<UserResponseDto>>>
    {
        private readonly IUserRepository _userRepository;

        public GetUserListQueryHandler(IUserRepository userRepository)
        {
            _userRepository = userRepository;
        }

        public async Task<Result<List<UserResponseDto>>> Handle(GetUserListQuery request, CancellationToken cancellationToken)
        {
            var query = _userRepository.GetQueryable();

            // Filtros
            if (!string.IsNullOrEmpty(request.Role))
                query = query.Where(u => u.Role == request.Role);

            if (request.IsActive.HasValue)
                query = query.Where(u => u.IsActive == request.IsActive.Value);

            if (!string.IsNullOrEmpty(request.Search))
            {
                var search = request.Search.ToLower();
                query = query.Where(u =>
                    u.FullName.ToLower().Contains(search) ||
                    u.EmployeeCode.ToLower().Contains(search)
                );
            }

            var users = await query
                .Select(u => new UserResponseDto
                {
                    Id = u.Id,
                    FullName = u.FullName,
                    EmployeeCode = u.EmployeeCode,
                    Email = u.Email,
                    Role = u.Role,
                    IsActive = u.IsActive,
                    CreatedAt = u.CreatedAt
                })
                .ToListAsync(cancellationToken);

            return Result<List<UserResponseDto>>.Success(users);
        }
    }
}