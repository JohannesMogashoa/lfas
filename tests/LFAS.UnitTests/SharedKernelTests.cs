using LFAS.SharedKernel;

namespace LFAS.UnitTests;

public class SharedKernelTests
{
    [Fact]
    public void CorrelationId_New_creates_non_empty_identifier()
    {
        var correlationId = CorrelationId.New();

        correlationId.Value.Should().NotBe(Guid.Empty);
    }

    [Fact]
    public void CorrelationId_From_returns_parsed_guid_when_value_is_valid()
    {
        var guid = Guid.NewGuid();

        var correlationId = CorrelationId.From(guid.ToString());

        correlationId.Value.Should().Be(guid);
        correlationId.ToString().Should().Be(guid.ToString());
    }

    [Fact]
    public void CorrelationId_From_generates_new_identifier_when_value_is_invalid()
    {
        var correlationId = CorrelationId.From("not-a-guid");

        correlationId.Value.Should().NotBe(Guid.Empty);
    }

    [Fact]
    public void DateRange_rejects_end_before_start()
    {
        var start = new DateTime(2026, 6, 3);
        DateTime end = start.AddDays(-1);

        Action createRange = () => new DateRange(start, end);

        createRange.Should().Throw<ArgumentException>();
    }

    [Fact]
    public void DateRange_Monthly_covers_entire_calendar_month()
    {
        var range = DateRange.Monthly(2024, 2);

        range.Start.Should().Be(new DateTime(2024, 2, 1));
        range.End.Should().Be(new DateTime(2024, 2, 29));
        range.TotalDays.Should().Be(29);
        range.Includes(new DateTime(2024, 2, 29)).Should().BeTrue();
        range.ToString().Should().Be("2024-02-01 to 2024-02-29");
    }

    [Fact]
    public void DateRange_Overlaps_returns_true_for_intersecting_ranges()
    {
        var first = new DateRange(new DateTime(2026, 1, 1), new DateTime(2026, 1, 31));
        var second = new DateRange(new DateTime(2026, 1, 15), new DateTime(2026, 2, 15));

        first.Overlaps(second).Should().BeTrue();
    }

    [Fact]
    public void Money_normalizes_currency_and_rounds_amount()
    {
        var money = new Money(10.12345m, "zar");

        money.Amount.Should().Be(10.1234m);
        money.Currency.Should().Be("ZAR");
    }

    [Fact]
    public void Money_adds_subtracts_and_multiplies_same_currency_values()
    {
        var first = Money.ZAR(100m);
        var second = Money.ZAR(25.50m);

        (first + second).Should().Be(Money.ZAR(125.50m));
        (first - second).Should().Be(Money.ZAR(74.50m));
        (first * 2m).Should().Be(Money.ZAR(200m));
    }

    [Fact]
    public void Money_DifferentCurrencies_ThrowsCurrencyMismatchException()
    {
        var zar = Money.ZAR(100m);
        var usd = new Money(100m, "USD");

        Action addDifferentCurrencies = () => _ = zar + usd;

        addDifferentCurrencies.Should().Throw<CurrencyMismatchException>();
    }

    [Fact]
    public void Money_Allocate_splits_amount_across_parts()
    {
        Money[] allocations = Money.ZAR(10m).Allocate(3);

        allocations.Should().Equal(Money.ZAR(3.34m), Money.ZAR(3.33m), Money.ZAR(3.33m));
    }

    [Fact]
    public void Result_success_and_failure_factories_set_expected_state()
    {
        var success = Result.Success();
        var failure = Result.Fail("invalid statement");

        success.IsSuccessful.Should().BeTrue();
        success.ErrorMessage.Should().BeNull();
        failure.IsSuccessful.Should().BeFalse();
        failure.ErrorMessage.Should().Be("invalid statement");
    }

    [Fact]
    public void Result_of_T_success_and_failure_factories_set_expected_state()
    {
        var success = Result<int>.Success(42);
        var failure = Result<int>.Fail("missing value");

        success.IsSuccessful.Should().BeTrue();
        success.Data.Should().Be(42);
        failure.IsSuccessful.Should().BeFalse();
        failure.ErrorMessage.Should().Be("missing value");
        failure.Data.Should().Be(default);
    }

    [Fact]
    public void BaseEntity_tracks_identity_modification_time_and_domain_events()
    {
        var entity = new TestEntity();
        var domainEvent = new TestDomainEvent(DateTime.UtcNow, CorrelationId.New());

        entity.Raise(domainEvent);
        entity.MarkModified(CorrelationId.New());

        entity.Id.Should().NotBe(Guid.Empty);
        entity.CreatedAt.Should().BeOnOrBefore(DateTime.UtcNow);
        entity.LastModifiedAt.Should().NotBeNull();
        entity.DomainEvents.Should().ContainSingle().Which.Should().BeSameAs(domainEvent);

        entity.ClearDomainEvents();

        entity.DomainEvents.Should().BeEmpty();
    }

    [Fact]
    public void BaseEntity_equality_uses_identity()
    {
        var id = Guid.NewGuid();
        var first = new TestEntity(id);
        var second = new TestEntity(id);
        var third = new TestEntity(Guid.NewGuid());

        first.Should().Be(second);
        first.GetHashCode().Should().Be(second.GetHashCode());
        first.Should().NotBe(third);
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
