using LFAS.Api.Endpoints.Statements.Upload;
using LFAS.Api.Health;
using LFAS.Application;
using Microsoft.AspNetCore.Antiforgery;
using Scalar.AspNetCore;

WebApplicationBuilder builder = WebApplication.CreateBuilder(args);

builder.AddServiceDefaults();

builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowTestingClients", policy =>
    {
        policy.AllowAnyOrigin()   // Allows any origin (perfect for local testing)
            .AllowAnyMethod()   // Allows POST, GET, PUT, DELETE, etc.
            .AllowAnyHeader();  // Allows Content-Type, etc.
    });
});

// Add services to the container.
// Learn more about configuring OpenAPI at https://aka.ms/aspnet/openapi
builder.Services.AddOpenApi();
builder.Services.AddApiHealthChecks(builder.Configuration, builder.Environment);
builder.Services.AddAuthorization();
builder.Services.AddApplication();

WebApplication app = builder.Build();

// Configure the HTTP request pipeline.
app.UseExceptionHandler();
app.UseCors("AllowTestingClients");
app.UseAuthorization();

if (app.Environment.IsDevelopment())
{
    app.MapOpenApi();
    app.MapScalarApiReference("/docs");
}

app.MapDefaultEndpoints();

app.MapUploadStatement();

app.UseHttpsRedirection();

if (app.Environment.IsEnvironment("Testing"))
{
    app.MapGet("/_testing/unhandled-exception", (HttpContext _) =>
        throw new InvalidOperationException("Sensitive failure detail must not reach API clients."));
}

app.Run();
