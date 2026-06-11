using Microsoft.Extensions.Diagnostics.HealthChecks;

namespace LFAS.Api.Health;

public sealed class LocalStorageHealthCheck(LocalStorageHealthCheckOptions options) : IHealthCheck
{
    public async Task<HealthCheckResult> CheckHealthAsync(
        HealthCheckContext context,
        CancellationToken cancellationToken = default)
    {
        if (string.IsNullOrWhiteSpace(options.RootPath))
        {
            return HealthCheckResult.Unhealthy("Storage root is not configured.");
        }

        string rootPath = ResolveRootPath(options.RootPath, options.ContentRootPath);
        string probePath = Path.Combine(rootPath, $".lfas-health-{Guid.NewGuid():N}.tmp");

        try
        {
            Directory.CreateDirectory(rootPath);

            await File.WriteAllTextAsync(probePath, "health", cancellationToken);
            File.Delete(probePath);

            return HealthCheckResult.Healthy("Storage path is writable.");
        }
        catch (Exception exception) when (exception is not OperationCanceledException)
        {
            return HealthCheckResult.Unhealthy("Storage path is unavailable.");
        }
    }

    private static string ResolveRootPath(string rootPath, string contentRootPath)
    {
        if (Path.IsPathRooted(rootPath))
        {
            return rootPath;
        }

        return Path.GetFullPath(Path.Combine(contentRootPath, rootPath));
    }
}

public sealed record LocalStorageHealthCheckOptions(string? RootPath, string ContentRootPath);
