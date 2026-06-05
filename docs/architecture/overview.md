# Architecture

## Clean Architecture Projects

```text
src/
├── LFAS.Domain
├── LFAS.Application
├── LFAS.Infrastructure
├── LFAS.Api
├── LFAS.StatementParser
├── LFAS.Reporting
├── LFAS.AI
└── LFAS.SharedKernel

tests/
├── LFAS.UnitTests
└── LFAS.IntegrationTests
```

## Dependency Direction

```text
Api → Application → Domain → SharedKernel
Infrastructure → Application
StatementParser → Application
Reporting → Application
AI → Application
```

## Product Boundaries

- Statement ingestion
- Extraction
- Normalization
- Validation
- Privacy
- Financial engine
- Categorization
- Reporting
- Questionnaire
- Scoring
- Recommendations
- AI
- Commercial platform

## Health Endpoints

The API exposes operational health endpoints through ASP.NET Core health checks:

- `GET /health/live` reports process liveness from the `self` check.
- `GET /health/ready` reports readiness from database and storage checks.
- `GET /health` reports the aggregate status for all registered checks.

Responses are JSON and include the overall status plus named check entries. The
payload is sanitized for operational use and must not expose connection strings,
filesystem paths, raw statement data, or exception details.
