using LFAS.Domain.Repositories;
using LFAS.Infrastructure.Repositories;
using Microsoft.Extensions.DependencyInjection;

namespace LFAS.Infrastructure;

public static class DependencyInjection
{
    public static IServiceCollection AddInfrastructure(this IServiceCollection services)
    {
        services.AddScoped<IStatementProcessingJobRepository, StatementProcessingJobRepository>();
        return services;
    }
}
