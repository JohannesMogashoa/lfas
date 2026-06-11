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
        string storageRoot = CreateTempDirectory();

        try
        {
            using WebApplicationFactory<Program> factory = CreateFactory(storageRoot);
            using HttpClient client = factory.CreateClient();

            using HttpResponseMessage response = await client.GetAsync("/health/live");
            using JsonDocument body = await ReadJsonAsync(response);

            Assert.Equal(HttpStatusCode.OK, response.StatusCode);
            Assert.Equal("Healthy", body.RootElement.GetProperty("status").GetString());

            JsonElement entries = body.RootElement.GetProperty("entries");
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
        string storageRoot = CreateTempDirectory();

        try
        {
            using WebApplicationFactory<Program> factory = CreateFactory(storageRoot);
            using HttpClient client = factory.CreateClient();

            using HttpResponseMessage response = await client.GetAsync("/health/ready");
            using JsonDocument body = await ReadJsonAsync(response);

            Assert.Equal(HttpStatusCode.ServiceUnavailable, response.StatusCode);
            Assert.Equal("Unhealthy", body.RootElement.GetProperty("status").GetString());

            JsonElement entries = body.RootElement.GetProperty("entries");
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
        string storageRoot = CreateTempDirectory();
        string blockedStoragePath = Path.Combine(storageRoot, "storage-file");
        await File.WriteAllTextAsync(blockedStoragePath, "not a directory");

        try
        {
            using WebApplicationFactory<Program> factory = CreateFactory(blockedStoragePath);
            using HttpClient client = factory.CreateClient();

            using HttpResponseMessage response = await client.GetAsync("/health");
            string responseBody = await response.Content.ReadAsStringAsync();
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
        string responseBody = await response.Content.ReadAsStringAsync();
        return JsonDocument.Parse(responseBody);
    }

    private static string CreateTempDirectory()
    {
        string path = Path.Combine(Path.GetTempPath(), $"lfas-health-{Guid.NewGuid():N}");
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
