using Microsoft.Extensions.Diagnostics.HealthChecks;

namespace LFAS.Api.Health;

public static class ApiHealthChecks
{
    public static IServiceCollection AddApiHealthChecks(
        this IServiceCollection services,
        IConfiguration configuration,
        IHostEnvironment environment)
    {
        services.AddSingleton(new LocalStorageHealthCheckOptions(
            configuration["LFAS:Storage:RootPath"],
            environment.ContentRootPath));

        services.AddHealthChecks()
            .AddCheck<PostgreSqlHealthCheck>(
                "database",
                failureStatus: HealthStatus.Unhealthy,
                tags: ["ready", "database"])
            .AddCheck<LocalStorageHealthCheck>(
                "storage",
                failureStatus: HealthStatus.Unhealthy,
                tags: ["ready", "storage"]);

        return services;
    }
}
