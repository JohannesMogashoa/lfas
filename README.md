# LFAS

LFAS is a fully .NET monorepo for the **Local Financial Analysis System**. The solution is centered on .NET Aspire for local orchestration and uses Blazor for the frontend.

## Solution Shape

```text
LFAS.slnx
src/
  LFAS.AppHost/           Aspire orchestrator for the platform
  LFAS.ServiceDefaults/   Shared health, telemetry, resilience, and discovery defaults
  LFAS.Api/               ASP.NET Core API
  LFAS.Web/               Blazor web frontend
  LFAS.Application/       Application use cases
  LFAS.Domain/            Domain model and business rules
  LFAS.Infrastructure/    Persistence and external integrations
  LFAS.SharedKernel/      Cross-cutting domain primitives
  LFAS.StatementParser/   Bank statement ingestion/parsing
  LFAS.Reporting/         Reporting workflows
  LFAS.AI/                AI-assisted analysis capabilities
tests/
  LFAS.UnitTests/
  LFAS.IntegrationTests/
docs/
  adr/                    Architecture Decision Records
artifacts/
  Backlog, roadmap, ADR, and bootstrap artifacts
```

## Run Locally

Run the Aspire AppHost:

```bash
dotnet run --project src/LFAS.AppHost/LFAS.AppHost.csproj
```

The AppHost orchestrates:

- `postgres` with `pgAdmin`
- `api` from `LFAS.Api`
- `web` from `LFAS.Web`

## Development

Useful commands:

```bash
dotnet restore LFAS.slnx
dotnet build LFAS.slnx
dotnet test LFAS.slnx
```

Historical backlog and GitHub bootstrap material is kept under `artifacts/`.
