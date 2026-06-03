namespace LFAS.SharedKernel;

public readonly record struct CorrelationId
{
    public Guid Value { get; }

    private CorrelationId(Guid value) => Value = value;

    public static CorrelationId New() => new(Guid.NewGuid());

    public static CorrelationId From(string value) =>
        Guid.TryParse(value, out var guid) ? new(guid) : New();

    public override string ToString() => Value.ToString();

    // Implicit conversion for easy use with logging and APIs
    public static implicit operator Guid(CorrelationId id) => id.Value;
    public static implicit operator string(CorrelationId id) => id.Value.ToString();
}
