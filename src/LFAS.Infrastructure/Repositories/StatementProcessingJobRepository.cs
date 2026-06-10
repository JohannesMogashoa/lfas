using LFAS.Domain.Entities;
using LFAS.Domain.Repositories;
using LFAS.SharedKernel;

namespace LFAS.Infrastructure.Repositories;

public class StatementProcessingJobRepository : IStatementProcessingJobRepository
{
    public async Task<BaseEntity> GetByIdAsync(Guid id, CancellationToken cancellationToken = default)
    {
        throw new NotImplementedException();
    }

    public async Task<List<BaseEntity>> GetAllAsync(CancellationToken cancellationToken = default)
    {
        throw new NotImplementedException();
    }

    public async Task<Guid> CreateAsync(StatementProcessingJob job, CancellationToken cancellationToken = default)
    {
        return job.Id;
    }

    public async Task UpdateAsync(StatementProcessingJob job, CancellationToken cancellationToken = default)
    {
        throw new NotImplementedException();
    }

    public async Task DeleteAsync(Guid id, CancellationToken cancellationToken = default)
    {
        throw new NotImplementedException();
    }
}
