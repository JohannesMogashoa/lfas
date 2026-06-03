using MediatR;

namespace LFAS.SharedKernel;

public interface IDomainEvent : INotification
{
    DateTime OccurredOn { get; }
    CorrelationId CorrelationId { get; }
}
