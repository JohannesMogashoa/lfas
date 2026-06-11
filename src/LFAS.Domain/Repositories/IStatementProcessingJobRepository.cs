using LFAS.Domain.Entities;

namespace LFAS.Domain.Repositories;

public interface IStatementProcessingJobRepository : IBaseRepository
{
    Task<Guid> CreateAsync(StatementProcessingJob job, CancellationToken cancellationToken = default);
    Task UpdateAsync(StatementProcessingJob job, CancellationToken cancellationToken = default);
    Task DeleteAsync(Guid id, CancellationToken cancellationToken = default);
}
