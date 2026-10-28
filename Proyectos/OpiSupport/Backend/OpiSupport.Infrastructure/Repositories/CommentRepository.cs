using Microsoft.EntityFrameworkCore;
using OpiSupport.Application.Interfaces.Repositories;
using OpiSupport.Domain.Entities;
using OpiSupport.Infrastructure.Data;
using System.Threading;
using System.Threading.Tasks;

namespace OpiSupport.Infrastructure.Repositories
{
    public class CommentRepository : ICommentRepository
    {
        private readonly ApplicationDbContext _context;

        public CommentRepository(ApplicationDbContext context)
        {
            _context = context;
        }

        public async Task<Comment> AddAsync(Comment comment, CancellationToken cancellationToken = default)
        {
            await _context.Comments.AddAsync(comment, cancellationToken);
            return comment;
        }
    }
}