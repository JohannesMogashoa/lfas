using Microsoft.Extensions.Diagnostics.HealthChecks;
using Npgsql;

namespace LFAS.Api.Health;

public sealed class PostgreSqlHealthCheck(IConfiguration configuration) : IHealthCheck
{
    public async Task<HealthCheckResult> CheckHealthAsync(
        HealthCheckContext context,
        CancellationToken cancellationToken = default)
    {
        var connectionString = configuration.GetConnectionString("lfasdb");

        if (string.IsNullOrWhiteSpace(connectionString))
        {
            return HealthCheckResult.Unhealthy("Database connection string is not configured.");
        }

        try
        {
            await using var connection = new NpgsqlConnection(connectionString);
            await connection.OpenAsync(cancellationToken);

            await using var command = new NpgsqlCommand("SELECT 1", connection);
            var result = await command.ExecuteScalarAsync(cancellationToken);

            return result is 1
                ? HealthCheckResult.Healthy("Database connection is available.")
                : HealthCheckResult.Unhealthy("Database health query returned an unexpected result.");
        }
        catch (Exception exception) when (exception is not OperationCanceledException)
        {
            return HealthCheckResult.Unhealthy("Database connection is unavailable.");
        }
    }
}
