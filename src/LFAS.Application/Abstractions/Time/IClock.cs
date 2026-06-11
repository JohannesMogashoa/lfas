namespace LFAS.Application.Abstractions.Time;

public interface IClock
{
    DateTimeOffset UtcNow { get; }
}
