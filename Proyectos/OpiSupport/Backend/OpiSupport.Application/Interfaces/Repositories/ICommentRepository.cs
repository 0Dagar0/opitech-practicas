using OpiSupport.Domain.Entities;
using System.Threading;
using System.Threading.Tasks;

namespace OpiSupport.Application.Interfaces.Repositories
{
    public interface ICommentRepository
    {
        Task<Comment> AddAsync(Comment comment, CancellationToken cancellationToken = default);
    }
}