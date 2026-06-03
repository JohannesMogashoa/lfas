namespace LFAS.SharedKernel;

public abstract class BaseEntity
{
    public Guid Id { get; protected set; } = Guid.NewGuid();

    // Tracking for the Audit Platform (Epic 11)
    public DateTime CreatedAt { get; private set; } = DateTime.UtcNow;
    public DateTime? LastModifiedAt { get; private set; }
    public CorrelationId CreatedByCorrelationId { get; private set; }

    // Domain Events Collection
    private readonly List<IDomainEvent> _domainEvents = new();
    public IReadOnlyCollection<IDomainEvent> DomainEvents => _domainEvents.AsReadOnly();

    protected void AddDomainEvent(IDomainEvent domainEvent) => _domainEvents.Add(domainEvent);
    public void ClearDomainEvents() => _domainEvents.Clear();

    public void MarkModified(CorrelationId cid)
    {
        LastModifiedAt = DateTime.UtcNow;
        // Every mutation is tied back to a CorrelationId
    }

    // Standard Equality Logic
    public override bool Equals(object? obj) => obj is BaseEntity entity && Id.Equals(entity.Id);
    public override int GetHashCode() => Id.GetHashCode();
}
