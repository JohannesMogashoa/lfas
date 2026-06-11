using Microsoft.Extensions.DependencyInjection;

namespace LFAS.Application;

public static class DependencyInjection
{
    public static IServiceCollection AddApplication(this IServiceCollection services)
    {
        services.AddSingleton<
            global::LFAS.Application.Abstractions.Time.IClock,
            global::LFAS.Application.Abstractions.Time.SystemClock>();

        services.AddScoped<
            global::LFAS.Application.Statements.Upload.IUploadStatementService,
            global::LFAS.Application.Statements.Upload.UploadStatementService>();
        return services;
    }
}
