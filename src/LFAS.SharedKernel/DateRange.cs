namespace LFAS.SharedKernel;

public readonly record struct DateRange
{
    public DateTime Start { get; }
    public DateTime End { get; }

    public DateRange(DateTime start, DateTime end)
    {
        if (end < start)
            throw new ArgumentException("End date cannot be before start date.");

        Start = start;
        End = end;
    }

    // Common financial windows
    public static DateRange Monthly(int year, int month)
    {
        var start = new DateTime(year, month, 1);
        return new DateRange(start, start.AddMonths(1).AddDays(-1));
    }

    // Helper to check if a transaction falls within this statement
    public bool Includes(DateTime date) => date >= Start && date <= End;

    // Calculate overlap (Useful for Epic 4: Gap Detection)
    public bool Overlaps(DateRange other) => Start < other.End && other.Start < End;

    public int TotalDays => (End - Start).Days + 1;

    // Formatting for Reporting Engine (Epic 8)
    public override string ToString() => $"{Start:yyyy-MM-dd} to {End:yyyy-MM-dd}";
}
