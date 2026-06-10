using LFAS.SharedKernel;

namespace LFAS.Domain.Entities;

public class StatementProcessingJob : BaseEntity
{
    public StatementJobStatus Status { get; set; } = StatementJobStatus.Queued;
    public string? FailureReason { get; set; }
    public string? TargetStoragePath { get; set; }
    public required string FileName { get; set; }
    public required string ContentType { get; set; }
    public long FileSize { get; set; }
}
