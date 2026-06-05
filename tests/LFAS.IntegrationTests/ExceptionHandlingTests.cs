using System.Net;
using System.Text.Json;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Mvc.Testing;
using Microsoft.Extensions.Configuration;

namespace LFAS.IntegrationTests;

public sealed class ExceptionHandlingTests
{
    [Fact]
    public async Task UnhandledException_ReturnsSafeProblemDetailsWithCorrelationId()
    {
        var storageRoot = CreateTempDirectory();
        var correlationId = Guid.NewGuid().ToString();

        try
        {
            using var factory = CreateFactory(storageRoot);
            using var client = factory.CreateClient();

            using var request = new HttpRequestMessage(HttpMethod.Get, "/_testing/unhandled-exception");
            request.Headers.Add("X-Correlation-ID", correlationId);

            using var response = await client.SendAsync(request);
            var responseBody = await response.Content.ReadAsStringAsync();
            using var body = JsonDocument.Parse(responseBody);

            Assert.Equal(HttpStatusCode.InternalServerError, response.StatusCode);
            Assert.Equal("application/problem+json", response.Content.Headers.ContentType?.MediaType);
            Assert.Equal(correlationId, response.Headers.GetValues("X-Correlation-ID").Single());
            Assert.Equal(500, body.RootElement.GetProperty("status").GetInt32());
            Assert.Equal("An unexpected error occurred.", body.RootElement.GetProperty("title").GetString());
            Assert.Equal(correlationId, body.RootElement.GetProperty("correlationId").GetString());
            Assert.Equal("/_testing/unhandled-exception", body.RootElement.GetProperty("instance").GetString());
            Assert.DoesNotContain("Sensitive failure detail", responseBody);
            Assert.DoesNotContain("InvalidOperationException", responseBody);
            Assert.DoesNotContain("StackTrace", responseBody);
            Assert.DoesNotContain(" at ", responseBody);
        }
        finally
        {
            DeleteDirectory(storageRoot);
        }
    }

    [Fact]
    public async Task UnhandledException_WhenCorrelationHeaderIsInvalid_GeneratesResponseCorrelationId()
    {
        var storageRoot = CreateTempDirectory();

        try
        {
            using var factory = CreateFactory(storageRoot);
            using var client = factory.CreateClient();

            using var request = new HttpRequestMessage(HttpMethod.Get, "/_testing/unhandled-exception");
            request.Headers.Add("X-Correlation-ID", "not-a-guid");

            using var response = await client.SendAsync(request);
            using var body = JsonDocument.Parse(await response.Content.ReadAsStringAsync());

            var responseCorrelationId = response.Headers.GetValues("X-Correlation-ID").Single();

            Assert.Equal(HttpStatusCode.InternalServerError, response.StatusCode);
            Assert.True(Guid.TryParse(responseCorrelationId, out _));
            Assert.Equal(responseCorrelationId, body.RootElement.GetProperty("correlationId").GetString());
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
                            "lfas-exception-test-logs",
                            "lfas-.ndjson")
                    });
                });
            });

    private static string CreateTempDirectory()
    {
        var path = Path.Combine(Path.GetTempPath(), $"lfas-exception-{Guid.NewGuid():N}");
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
