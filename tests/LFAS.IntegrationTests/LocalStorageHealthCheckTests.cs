using LFAS.Api.Health;
using Microsoft.Extensions.Diagnostics.HealthChecks;

namespace LFAS.IntegrationTests;

public sealed class LocalStorageHealthCheckTests
{
    [Fact]
    public async Task CheckHealthAsync_WhenStoragePathIsWritable_ReturnsHealthy()
    {
        string contentRoot = CreateTempDirectory();

        try
        {
            var check = new LocalStorageHealthCheck(new LocalStorageHealthCheckOptions("storage", contentRoot));

            HealthCheckResult result = await check.CheckHealthAsync(new HealthCheckContext());

            Assert.Equal(HealthStatus.Healthy, result.Status);
            Assert.Equal("Storage path is writable.", result.Description);
            Assert.True(Directory.Exists(Path.Combine(contentRoot, "storage")));
        }
        finally
        {
            DeleteDirectory(contentRoot);
        }
    }

    [Fact]
    public async Task CheckHealthAsync_WhenStoragePathCannotBeCreated_ReturnsSanitizedUnhealthyResult()
    {
        string contentRoot = CreateTempDirectory();
        string blockedPath = Path.Combine(contentRoot, "storage");
        await File.WriteAllTextAsync(blockedPath, "not a directory");

        try
        {
            var check = new LocalStorageHealthCheck(new LocalStorageHealthCheckOptions(blockedPath, contentRoot));

            HealthCheckResult result = await check.CheckHealthAsync(new HealthCheckContext());

            Assert.Equal(HealthStatus.Unhealthy, result.Status);
            Assert.Equal("Storage path is unavailable.", result.Description);
            Assert.DoesNotContain(blockedPath, result.Description);
        }
        finally
        {
            DeleteDirectory(contentRoot);
        }
    }

    private static string CreateTempDirectory()
    {
        string path = Path.Combine(Path.GetTempPath(), $"lfas-storage-health-{Guid.NewGuid():N}");
        Directory.CreateDirectory(path);

        return path;
    }

    private static void DeleteDirectory(string path)
    {
        if (Directory.Exists(path))
        {
            Directory.Delete(path, recursive: true);
        }
    }
}
