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

## Upload Audit Trail

Accepted statement uploads emit a single audit event that links the upload,
job, and correlation identifiers without storing raw statement content.
Validation failures are intentionally excluded from this trail. See
[upload-audit-trail.md](./upload-audit-trail.md) for the field contract and
privacy rules.

## Health Endpoints

The API exposes operational health endpoints through ASP.NET Core health checks:

- `GET /health/live` reports process liveness from the `self` check.
- `GET /health/ready` reports readiness from database and storage checks.
- `GET /health` reports the aggregate status for all registered checks.

Responses are JSON and include the overall status plus named check entries. The
payload is sanitized for operational use and must not expose connection strings,
filesystem paths, raw statement data, or exception details.

## Error Handling

The API uses global exception handling with Problem Details responses. Unhandled
exceptions return HTTP `500` with a safe title, a generic detail message, and
correlation metadata. Responses must not include stack traces, exception type
names, raw exception messages, connection strings, filesystem paths, or raw
financial statement data.

Every API response includes `X-Correlation-ID`. If the caller supplies a valid
correlation ID, the same value is returned and included in the Problem Details
payload as `correlationId`; otherwise, the API generates a new value.
