namespace LFAS.SharedKernel;

public interface IDomainEvent
{
    DateTime OccurredOn { get; }
    CorrelationId CorrelationId { get; }
}
