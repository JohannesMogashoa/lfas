# Architecture

## Next.js Monorepo Workspaces

```text
apps/
├── web

packages/
├── ui
├── bank-statement-parser
├── eslint-config
└── typescript-config
```

## Dependency Direction

```text
apps/web → packages/ui
apps/web → product packages
product packages → domain primitives
infrastructure adapters → application/domain contracts
```

Workspace packages must not depend on `apps/web`. Financial domain and parser
packages must remain independent of Next.js, React, browser APIs, persistence
clients, and external AI clients.

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

## Workspace Responsibilities

- `apps/web` owns Next.js routes, pages, layouts, route handlers, server actions,
  and user workflows.
- `packages/ui` owns reusable shadcn/ui-based presentation components.
- `packages/bank-statement-parser` owns deterministic parsing, extraction,
  normalization, and bank-format detection logic.
- Future product packages should own stable business capabilities, not incidental
  technical groupings.
- Shared configuration packages own ESLint and TypeScript defaults only.

## Upload Audit Trail

Accepted statement uploads emit a single audit event that links the upload, job,
and correlation identifiers without storing raw statement content. Validation
failures are intentionally excluded from this trail. See
[upload-audit-trail.md](./upload-audit-trail.md) for the field contract and
privacy rules.

## Health Endpoints

The web app should expose operational health checks through Next.js route
handlers:

- `GET /api/health/live` reports process liveness.
- `GET /api/health/ready` reports readiness from database, storage, and required
  local services.
- `GET /api/health` reports the aggregate status for all registered checks.

Responses are JSON and include the overall status plus named check entries. The
payload is sanitized for operational use and must not expose connection strings,
filesystem paths, raw statement data, or exception details.

## Error Handling

Route handlers and server actions return consistent safe error payloads.
Unhandled failures return HTTP `500` with a safe title, a generic detail message,
and correlation metadata. Responses must not include stack traces, exception type
names, raw exception messages, connection strings, filesystem paths, or raw
financial statement data.

Every API response includes `X-Correlation-ID`. If the caller supplies a valid
correlation ID, the same value is returned and included in the error payload as
`correlationId`; otherwise, the application generates a new value.
