using System.Text.Json;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Diagnostics;
using Microsoft.AspNetCore.Diagnostics.HealthChecks;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Diagnostics.HealthChecks;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;
using OpenTelemetry;
using OpenTelemetry.Metrics;
using OpenTelemetry.Trace;
using Serilog;
using Serilog.Context;
using Serilog.Events;
using Serilog.Formatting.Compact;

namespace Microsoft.Extensions.Hosting;

public static class Extensions
{
    private static readonly JsonSerializerOptions HealthJsonOptions = new(JsonSerializerDefaults.Web);

    public static TBuilder AddServiceDefaults<TBuilder>(this TBuilder builder) where TBuilder : IHostApplicationBuilder
    {
        builder.ConfigureStructuredLogging();

        builder.ConfigureOpenTelemetry();

        builder.AddDefaultHealthChecks();

        builder.AddDefaultExceptionHandling();

        builder.Services.AddServiceDiscovery();

        builder.Services.ConfigureHttpClientDefaults(http =>
        {
            http.AddStandardResilienceHandler();
            http.AddServiceDiscovery();
        });

        return builder;
    }

    public static TBuilder ConfigureStructuredLogging<TBuilder>(this TBuilder builder) where TBuilder : IHostApplicationBuilder
    {
        var logFilePath = builder.Configuration["LFAS:Logging:FilePath"] ?? "logs/lfas-.ndjson";

        builder.Logging.ClearProviders();
        builder.Services.AddHttpContextAccessor();
        builder.Services.AddTransient<IStartupFilter, CorrelationIdLoggingStartupFilter>();
        builder.Services.AddSerilog((_, loggerConfiguration) =>
        {
            loggerConfiguration
                .ReadFrom.Configuration(builder.Configuration)
                .MinimumLevel.Information()
                .MinimumLevel.Override("Microsoft.AspNetCore", LogEventLevel.Warning)
                .Enrich.FromLogContext()
                .Enrich.WithProperty("Application", builder.Environment.ApplicationName)
                .Enrich.WithProperty("Environment", builder.Environment.EnvironmentName)
                .WriteTo.Console(new CompactJsonFormatter())
                .WriteTo.File(
                    new CompactJsonFormatter(),
                    logFilePath,
                    rollingInterval: RollingInterval.Day,
                    retainedFileCountLimit: 14,
                    shared: true);
        });

        return builder;
    }

    public static TBuilder ConfigureOpenTelemetry<TBuilder>(this TBuilder builder) where TBuilder : IHostApplicationBuilder
    {
        builder.Services.AddOpenTelemetry()
            .WithMetrics(metrics =>
            {
                metrics.AddAspNetCoreInstrumentation()
                    .AddHttpClientInstrumentation()
                    .AddRuntimeInstrumentation();
            })
            .WithTracing(tracing =>
            {
                tracing.AddAspNetCoreInstrumentation()
                    .AddHttpClientInstrumentation();
            });

        builder.AddOpenTelemetryExporters();

        return builder;
    }

    private static TBuilder AddOpenTelemetryExporters<TBuilder>(this TBuilder builder) where TBuilder : IHostApplicationBuilder
    {
        var useOtlpExporter = !string.IsNullOrWhiteSpace(builder.Configuration["OTEL_EXPORTER_OTLP_ENDPOINT"]);

        if (useOtlpExporter)
        {
            builder.Services.ConfigureOpenTelemetryMeterProvider(metrics => metrics.AddOtlpExporter());
            builder.Services.ConfigureOpenTelemetryTracerProvider(tracing => tracing.AddOtlpExporter());
        }

        return builder;
    }

    public static TBuilder AddDefaultHealthChecks<TBuilder>(this TBuilder builder) where TBuilder : IHostApplicationBuilder
    {
        builder.Services.AddHealthChecks()
            .AddCheck("self", () => HealthCheckResult.Healthy(), ["live"]);

        return builder;
    }

    public static TBuilder AddDefaultExceptionHandling<TBuilder>(this TBuilder builder) where TBuilder : IHostApplicationBuilder
    {
        builder.Services.AddProblemDetails(options =>
        {
            options.CustomizeProblemDetails = context =>
            {
                var correlationId = ResolveCorrelationId(context.HttpContext);

                context.ProblemDetails.Extensions["correlationId"] = correlationId;
                context.ProblemDetails.Extensions["traceId"] = context.HttpContext.TraceIdentifier;
                context.ProblemDetails.Instance ??= context.HttpContext.Request.Path;
            };
        });

        builder.Services.AddExceptionHandler<SafeExceptionHandler>();

        return builder;
    }

    public static WebApplication MapDefaultEndpoints(this WebApplication app)
    {
        app.MapHealthChecks("/health/live", new HealthCheckOptions
        {
            Predicate = registration => registration.Tags.Contains("live"),
            ResponseWriter = WriteHealthCheckResponse
        });

        app.MapHealthChecks("/health/ready", new HealthCheckOptions
        {
            Predicate = registration => registration.Tags.Contains("ready"),
            ResponseWriter = WriteHealthCheckResponse
        });

        app.MapHealthChecks("/health", new HealthCheckOptions
        {
            ResponseWriter = WriteHealthCheckResponse
        });

        return app;
    }

    private static Task WriteHealthCheckResponse(HttpContext context, HealthReport report)
    {
        context.Response.ContentType = "application/json";

        var response = new
        {
            status = report.Status.ToString(),
            duration = report.TotalDuration.TotalMilliseconds,
            entries = report.Entries.ToDictionary(
                entry => entry.Key,
                entry => new
                {
                    status = entry.Value.Status.ToString(),
                    description = entry.Value.Description,
                    duration = entry.Value.Duration.TotalMilliseconds
                })
        };

        return context.Response.WriteAsync(JsonSerializer.Serialize(response, HealthJsonOptions));
    }

    internal static string ResolveCorrelationId(HttpContext context)
    {
        var responseHeaderValue = context.Response.Headers[CorrelationIdLoggingMiddleware.HeaderName].FirstOrDefault();

        if (Guid.TryParse(responseHeaderValue, out var parsedResponseHeader))
        {
            return parsedResponseHeader.ToString();
        }

        var requestHeaderValue = context.Request.Headers[CorrelationIdLoggingMiddleware.HeaderName].FirstOrDefault();

        if (Guid.TryParse(requestHeaderValue, out var parsedRequestHeader))
        {
            return parsedRequestHeader.ToString();
        }

        return Guid.NewGuid().ToString();
    }
}

internal sealed class SafeExceptionHandler(IProblemDetailsService problemDetailsService, ILogger<SafeExceptionHandler> logger) : IExceptionHandler
{
    public async ValueTask<bool> TryHandleAsync(
        HttpContext httpContext,
        Exception exception,
        CancellationToken cancellationToken)
    {
        var correlationId = Extensions.ResolveCorrelationId(httpContext);

        httpContext.Response.Headers[CorrelationIdLoggingMiddleware.HeaderName] = correlationId;

        logger.LogError(
            "Unhandled exception of type {ExceptionType} for request {Method} {Path}. CorrelationId: {CorrelationId}",
            exception.GetType().Name,
            httpContext.Request.Method,
            httpContext.Request.Path,
            correlationId);

        httpContext.Response.StatusCode = StatusCodes.Status500InternalServerError;

        return await problemDetailsService.TryWriteAsync(new ProblemDetailsContext
        {
            HttpContext = httpContext,
            ProblemDetails =
            {
                Status = StatusCodes.Status500InternalServerError,
                Title = "An unexpected error occurred.",
                Detail = "The request could not be completed. Use the correlation ID when contacting support.",
                Type = "https://httpstatuses.com/500"
            },
            Exception = exception
        });
    }
}

internal sealed class CorrelationIdLoggingStartupFilter : IStartupFilter
{
    public Action<IApplicationBuilder> Configure(Action<IApplicationBuilder> next) =>
        app =>
        {
            app.UseMiddleware<CorrelationIdLoggingMiddleware>();
            app.UseSerilogRequestLogging();

            next(app);
        };
}

internal sealed class CorrelationIdLoggingMiddleware(RequestDelegate next)
{
    public const string HeaderName = "X-Correlation-ID";

    public async Task InvokeAsync(HttpContext context)
    {
        var correlationId = ResolveOrCreateCorrelationId(context);

        context.Response.Headers[HeaderName] = correlationId;

        using (LogContext.PushProperty("CorrelationId", correlationId))
        {
            await next(context);
        }
    }

    private static string ResolveOrCreateCorrelationId(HttpContext context)
    {
        var headerValue = context.Request.Headers[HeaderName].FirstOrDefault();

        return Guid.TryParse(headerValue, out var parsed)
            ? parsed.ToString()
            : Guid.NewGuid().ToString();
    }
}
