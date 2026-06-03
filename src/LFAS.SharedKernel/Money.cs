namespace LFAS.SharedKernel;

public readonly record struct Money : IComparable<Money>
{
    public decimal Amount { get; }
    public string Currency { get; }

    public Money(decimal amount, string currency)
    {
        Amount = Math.Round(amount, 4);
        Currency = currency.ToUpperInvariant();
    }

    public static Money ZAR(decimal amount) => new(amount, "ZAR");

    public static Money operator +(Money a, Money b) => GuardCurrency(a, b, a.Amount + b.Amount);
    public static Money operator -(Money a, Money b) => GuardCurrency(a, b, a.Amount - b.Amount);
    public static Money operator *(Money a, decimal multiplier) => new(a.Amount * multiplier, a.Currency);

    public Money[] Allocate(int parts)
    {
        decimal lowAmount = Math.Floor(Amount / parts * 100) / 100;
        decimal highAmount = lowAmount + 0.01m;
        int remainder = (int)((Amount % (lowAmount * parts)) * 100);

        var results = new Money[parts];
        for (int i = 0; i < parts; i++)
            results[i] = new Money(i < remainder ? highAmount : lowAmount, Currency);

        return results;
    }

    private static Money GuardCurrency(Money a, Money b, decimal result)
    {
        if (a.Currency != b.Currency)
            throw new CurrencyMismatchException($"Cannot mix {a.Currency} and {b.Currency}");
        return new Money(result, a.Currency);
    }

    public int CompareTo(Money other)
    {
        return Currency != other.Currency ? 0 : Amount.CompareTo(other.Amount);
    }
}

public class CurrencyMismatchException(string message) : Exception(message);
