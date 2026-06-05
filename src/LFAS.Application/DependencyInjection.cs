using LFAS.Application.Statements.Upload;
using Microsoft.Extensions.DependencyInjection;

namespace LFAS.Application;

public static class DependencyInjection
{
    public static IServiceCollection AddApplication(this IServiceCollection services)
    {
        services.AddSingleton<IUploadStatementService, UploadStatementService>();
        return services;
    }
}
