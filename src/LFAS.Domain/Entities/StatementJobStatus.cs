namespace LFAS.Domain.Entities;

public enum StatementJobStatus
{
    Queued,
    Processing,
    Completed,
    Failed,
    Cancelled
}
