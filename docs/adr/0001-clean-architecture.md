# ADR-0001: Use Clean Architecture

## Status

Accepted

## Context

LFAS handles private financial statement data and will grow across ingestion,
normalization, validation, analysis, reporting, and AI-assisted capabilities.
The core business rules must remain testable and independent from delivery
mechanisms such as Blazor, APIs, storage providers, queues, OCR tools, and AI
integrations.

The solution already separates projects by responsibility:

- `LFAS.Domain` for domain model and business rules.
- `LFAS.Application` for use cases and orchestration contracts.
- `LFAS.Infrastructure` for persistence and external integrations.
- `LFAS.Api` and `LFAS.Web` for delivery surfaces.
- `LFAS.StatementParser`, `LFAS.Reporting`, and `LFAS.AI` for specialized
  capabilities.
- `LFAS.SharedKernel` for cross-cutting domain primitives.

## Decision

Use Clean Architecture as the default dependency model for LFAS.

Domain and application code must not depend on infrastructure, UI, database,
or AI implementation details. External concerns should be expressed through
application contracts and implemented by outer-layer projects.

The intended dependency direction is:

```text
Api/Web -> Application -> Domain -> SharedKernel
Infrastructure -> Application
StatementParser -> Application
Reporting -> Application
AI -> Application
```

## Consequences

- Domain rules can be unit tested without databases, web hosts, or AI services.
- Infrastructure implementations can change without rewriting core business
  workflows.
- Project references must be reviewed as part of architecture-sensitive work.
- Some integration code requires explicit mapping between external models and
  domain/application contracts.

## Implementation Guidance

- Keep entities, value objects, and domain services free of persistence
  annotations unless explicitly accepted in a future ADR.
- Put use-case orchestration in `LFAS.Application`.
- Keep adapters for PostgreSQL, file storage, OCR, AI clients, and external
  systems in outer-layer projects.
- Add architecture tests when dependency boundaries are introduced or changed.
