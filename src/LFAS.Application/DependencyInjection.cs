using LFAS.Application.Abstractions.Time;
using LFAS.Application.Statements.Upload;
using Microsoft.Extensions.DependencyInjection;

namespace LFAS.Application;

public static class DependencyInjection
{
    public static IServiceCollection AddApplication(this IServiceCollection services)
    {
        services.AddSingleton<IClock, SystemClock>();
        services.AddScoped<IUploadStatementService, UploadStatementService>();
        return services;
    }
}
