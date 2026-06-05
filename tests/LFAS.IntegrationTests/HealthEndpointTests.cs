using System.Net;
using System.Text.Json;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Mvc.Testing;
using Microsoft.Extensions.Configuration;

namespace LFAS.IntegrationTests;

public sealed class HealthEndpointTests
{
    [Fact]
    public async Task HealthLive_ReturnsHealthyJson()
    {
        var storageRoot = CreateTempDirectory();

        try
        {
            using var factory = CreateFactory(storageRoot);
            using var client = factory.CreateClient();

            using var response = await client.GetAsync("/health/live");
            using var body = await ReadJsonAsync(response);

            Assert.Equal(HttpStatusCode.OK, response.StatusCode);
            Assert.Equal("Healthy", body.RootElement.GetProperty("status").GetString());

            var entries = body.RootElement.GetProperty("entries");
            Assert.Equal("Healthy", entries.GetProperty("self").GetProperty("status").GetString());
        }
        finally
        {
            DeleteDirectory(storageRoot);
        }
    }

    [Fact]
    public async Task HealthReady_WhenDatabaseConnectionIsMissing_ReturnsUnavailableReadiness()
    {
        var storageRoot = CreateTempDirectory();

        try
        {
            using var factory = CreateFactory(storageRoot);
            using var client = factory.CreateClient();

            using var response = await client.GetAsync("/health/ready");
            using var body = await ReadJsonAsync(response);

            Assert.Equal(HttpStatusCode.ServiceUnavailable, response.StatusCode);
            Assert.Equal("Unhealthy", body.RootElement.GetProperty("status").GetString());

            var entries = body.RootElement.GetProperty("entries");
            Assert.Equal("Unhealthy", entries.GetProperty("database").GetProperty("status").GetString());
            Assert.Equal("Healthy", entries.GetProperty("storage").GetProperty("status").GetString());
        }
        finally
        {
            DeleteDirectory(storageRoot);
        }
    }

    [Fact]
    public async Task Health_WhenReadinessFails_ReturnsSanitizedAggregateJson()
    {
        var storageRoot = CreateTempDirectory();
        var blockedStoragePath = Path.Combine(storageRoot, "storage-file");
        await File.WriteAllTextAsync(blockedStoragePath, "not a directory");

        try
        {
            using var factory = CreateFactory(blockedStoragePath);
            using var client = factory.CreateClient();

            using var response = await client.GetAsync("/health");
            var responseBody = await response.Content.ReadAsStringAsync();
            using var body = JsonDocument.Parse(responseBody);

            Assert.Equal(HttpStatusCode.ServiceUnavailable, response.StatusCode);
            Assert.Equal("Unhealthy", body.RootElement.GetProperty("status").GetString());
            Assert.Contains("\"database\"", responseBody);
            Assert.Contains("\"storage\"", responseBody);
            Assert.DoesNotContain(blockedStoragePath, responseBody);
            Assert.DoesNotContain("Host=", responseBody);
            Assert.DoesNotContain("Password=", responseBody);
            Assert.DoesNotContain("Exception", responseBody);
        }
        finally
        {
            DeleteDirectory(storageRoot);
        }
    }

    private static WebApplicationFactory<Program> CreateFactory(string storageRoot) =>
        new WebApplicationFactory<Program>()
            .WithWebHostBuilder(builder =>
            {
                builder.UseEnvironment("Testing");
                builder.ConfigureAppConfiguration((_, configuration) =>
                {
                    configuration.AddInMemoryCollection(new Dictionary<string, string?>
                    {
                        ["LFAS:Storage:RootPath"] = storageRoot,
                        ["LFAS:Logging:FilePath"] = Path.Combine(
                            Path.GetTempPath(),
                            "lfas-health-test-logs",
                            "lfas-.ndjson")
                    });
                });
            });

    private static async Task<JsonDocument> ReadJsonAsync(HttpResponseMessage response)
    {
        var responseBody = await response.Content.ReadAsStringAsync();
        return JsonDocument.Parse(responseBody);
    }

    private static string CreateTempDirectory()
    {
        var path = Path.Combine(Path.GetTempPath(), $"lfas-health-{Guid.NewGuid():N}");
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
