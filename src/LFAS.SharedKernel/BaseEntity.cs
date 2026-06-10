namespace LFAS.SharedKernel;

public abstract class BaseEntity
{
    public Guid Id { get; protected set; } = Guid.NewGuid();

    // Tracking for the Audit Platform (Epic 11)
    public DateTime CreatedAt { get; private set; } = DateTime.UtcNow;
    public Guid CreatedByUserId { get; private set; }
    public CorrelationId CreatedByCorrelationId { get; set; }

    public DateTime? LastModifiedAt { get; private set; }
    public Guid LastModifiedByUserId { get; private set; }
    public CorrelationId LastModifiedByCorrelationId { get; private set; }

    // Domain Events Collection
    private readonly List<IDomainEvent> _domainEvents = new();
    public IReadOnlyCollection<IDomainEvent> DomainEvents => _domainEvents.AsReadOnly();

    protected void AddDomainEvent(IDomainEvent domainEvent) => _domainEvents.Add(domainEvent);
    public void ClearDomainEvents() => _domainEvents.Clear();

    public void MarkModified(Guid uid, CorrelationId cid)
    {
        LastModifiedAt = DateTime.UtcNow;
        LastModifiedByUserId = uid;
        LastModifiedByCorrelationId = cid;
        // Every mutation is tied back to a CorrelationId
    }

    // Standard Equality Logic
    public override bool Equals(object? obj) => obj is BaseEntity entity && Id.Equals(entity.Id);
    public override int GetHashCode() => Id.GetHashCode();
}
