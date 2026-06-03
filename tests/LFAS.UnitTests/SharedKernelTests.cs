using LFAS.SharedKernel;

namespace LFAS.UnitTests;

public class SharedKernelTests
{
    [Fact]
    public void CorrelationId_New_creates_non_empty_identifier()
    {
        var correlationId = CorrelationId.New();

        Assert.NotEqual(Guid.Empty, correlationId.Value);
    }

    [Fact]
    public void CorrelationId_From_returns_parsed_guid_when_value_is_valid()
    {
        var guid = Guid.NewGuid();

        var correlationId = CorrelationId.From(guid.ToString());

        Assert.Equal(guid, correlationId.Value);
        Assert.Equal(guid.ToString(), correlationId.ToString());
    }

    [Fact]
    public void CorrelationId_From_generates_new_identifier_when_value_is_invalid()
    {
        var correlationId = CorrelationId.From("not-a-guid");

        Assert.NotEqual(Guid.Empty, correlationId.Value);
    }

    [Fact]
    public void DateRange_rejects_end_before_start()
    {
        var start = new DateTime(2026, 6, 3);
        var end = start.AddDays(-1);

        Assert.Throws<ArgumentException>(() => new DateRange(start, end));
    }

    [Fact]
    public void DateRange_Monthly_covers_entire_calendar_month()
    {
        var range = DateRange.Monthly(2024, 2);

        Assert.Equal(new DateTime(2024, 2, 1), range.Start);
        Assert.Equal(new DateTime(2024, 2, 29), range.End);
        Assert.Equal(29, range.TotalDays);
        Assert.True(range.Includes(new DateTime(2024, 2, 29)));
        Assert.Equal("2024-02-01 to 2024-02-29", range.ToString());
    }

    [Fact]
    public void DateRange_Overlaps_returns_true_for_intersecting_ranges()
    {
        var first = new DateRange(new DateTime(2026, 1, 1), new DateTime(2026, 1, 31));
        var second = new DateRange(new DateTime(2026, 1, 15), new DateTime(2026, 2, 15));

        Assert.True(first.Overlaps(second));
    }

    [Fact]
    public void Money_normalizes_currency_and_rounds_amount()
    {
        var money = new Money(10.12345m, "zar");

        Assert.Equal(10.1234m, money.Amount);
        Assert.Equal("ZAR", money.Currency);
    }

    [Fact]
    public void Money_adds_subtracts_and_multiplies_same_currency_values()
    {
        var first = Money.ZAR(100m);
        var second = Money.ZAR(25.50m);

        Assert.Equal(Money.ZAR(125.50m), first + second);
        Assert.Equal(Money.ZAR(74.50m), first - second);
        Assert.Equal(Money.ZAR(200m), first * 2m);
    }

    [Fact]
    public void Money_throws_when_combining_different_currencies()
    {
        var zar = Money.ZAR(100m);
        var usd = new Money(100m, "USD");

        Assert.Throws<CurrencyMismatchException>(() => zar + usd);
    }

    [Fact]
    public void Money_Allocate_splits_amount_across_parts()
    {
        var allocations = Money.ZAR(10m).Allocate(3);

        Assert.Equal([Money.ZAR(3.34m), Money.ZAR(3.33m), Money.ZAR(3.33m)], allocations);
    }

    [Fact]
    public void Result_success_and_failure_factories_set_expected_state()
    {
        var success = Result.Success();
        var failure = Result.Fail("invalid statement");

        Assert.True(success.IsSuccessful);
        Assert.Null(success.ErrorMessage);
        Assert.False(failure.IsSuccessful);
        Assert.Equal("invalid statement", failure.ErrorMessage);
    }

    [Fact]
    public void Result_of_T_success_and_failure_factories_set_expected_state()
    {
        var success = Result<int>.Success(42);
        var failure = Result<int>.Fail("missing value");

        Assert.True(success.IsSuccessful);
        Assert.Equal(42, success.Data);
        Assert.False(failure.IsSuccessful);
        Assert.Equal("missing value", failure.ErrorMessage);
        Assert.Equal(default, failure.Data);
    }

    [Fact]
    public void BaseEntity_tracks_identity_modification_time_and_domain_events()
    {
        var entity = new TestEntity();
        var domainEvent = new TestDomainEvent(DateTime.UtcNow, CorrelationId.New());

        entity.Raise(domainEvent);
        entity.MarkModified(CorrelationId.New());

        Assert.NotEqual(Guid.Empty, entity.Id);
        Assert.True(entity.CreatedAt <= DateTime.UtcNow);
        Assert.NotNull(entity.LastModifiedAt);
        Assert.Collection(entity.DomainEvents, actual => Assert.Same(domainEvent, actual));

        entity.ClearDomainEvents();

        Assert.Empty(entity.DomainEvents);
    }

    [Fact]
    public void BaseEntity_equality_uses_identity()
    {
        var id = Guid.NewGuid();
        var first = new TestEntity(id);
        var second = new TestEntity(id);
        var third = new TestEntity(Guid.NewGuid());

        Assert.Equal(first, second);
        Assert.Equal(first.GetHashCode(), second.GetHashCode());
        Assert.NotEqual(first, third);
    }

    private sealed class TestEntity : BaseEntity
    {
        public TestEntity()
        {
        }

        public TestEntity(Guid id)
        {
            Id = id;
        }

        public void Raise(IDomainEvent domainEvent) => AddDomainEvent(domainEvent);
    }

    private sealed record TestDomainEvent(
        DateTime OccurredOn,
        CorrelationId CorrelationId) : IDomainEvent;
}
