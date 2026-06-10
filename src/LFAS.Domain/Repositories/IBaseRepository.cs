using LFAS.SharedKernel;

namespace LFAS.Domain.Repositories;

public interface IBaseRepository
{
    Task<BaseEntity> GetByIdAsync(Guid id,  CancellationToken cancellationToken = default);
    Task<List<BaseEntity>> GetAllAsync(CancellationToken cancellationToken = default);
}
