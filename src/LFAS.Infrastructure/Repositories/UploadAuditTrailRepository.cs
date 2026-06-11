using LFAS.Application.Statements.Upload;

namespace LFAS.Infrastructure.Repositories;

public class UploadAuditTrailRepository : IUploadAuditTrailRepository
{
    private readonly List<UploadAuditEvent> _events = new();

    public Task<Guid> CreateAsync(UploadAuditEvent auditEvent, CancellationToken cancellationToken = default)
    {
        _events.Add(auditEvent);
        return Task.FromResult(auditEvent.Id);
    }
}
