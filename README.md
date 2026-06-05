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
  architecture/            Architecture overview and diagrams
  adr/                    Architecture Decision Records
  configuration/          Local configuration and secrets guidance
  development/            Developer bootstrap and workflow documentation
  planning/               Roadmap, labels, and delivery definitions
  testing/                Test conventions and commands
planning/
  backlog/                Backlog source spreadsheets
  portfolio/              GitHub issue, label, milestone, and release data
scripts/
  development/            Developer bootstrap scripts
  maintenance/            Repository maintenance scripts
  portfolio/              GitHub portfolio automation
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

Validate local prerequisites and start PostgreSQL:

```bash
./scripts/development/setup-dev.sh
```

On Windows, run the PowerShell bootstrap:

```powershell
.\scripts\development\setup-dev.ps1
```

Useful commands:

```bash
dotnet restore LFAS.slnx
dotnet build LFAS.slnx
dotnet test LFAS.slnx
```

See [Developer Bootstrap](docs/development/developer-bootstrap.md) for
platform-specific details and skip options.

See [Local Configuration and Secrets](docs/configuration/local-configuration.md) for
appsettings, `.env`, and user-secrets guidance.

See [Testing](docs/testing/unit-testing.md) for unit test conventions.

See [Planning](planning/README.md) for backlog and portfolio source data.
