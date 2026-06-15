# Story: Create audit search API

## Parent

- Epic: V1-E07 — Fraud and Risk Detection
- Feature: V1-E07-F02 — Compliance and Audit

## Release / Milestone

V1

## User Story

As a product builder of LFAS, I want `Create audit search API` so that the system can progress toward trusted, private financial analysis.

## Acceptance Criteria

- [ ] Audit events searchable

## Implementation Tasks

- [ ] Filter by tenant
- [ ] Event type
- [ ] Date

## Engineering Notes

- Use Next.js App Router in `apps/web` for pages, route handlers, and server actions.
- Keep deterministic financial rules in workspace packages, especially `packages/bank-statement-parser` or future domain packages.
- Keep raw bank statement data isolated behind storage and privacy boundaries.
- Use PNPM workspace dependencies and Turborepo tasks for build, lint, typecheck, test, and dev workflows.
- Add Vitest, integration, or Playwright coverage for parsing, validation, scoring, upload, or security behavior where applicable.
- Update documentation when behavior, package contracts, or route contracts are introduced.

## Monorepo Enrichment

### Target Workspace

- Primary ownership: privacy/storage workspace packages and boundary code in `apps/web`.
- Start from the package contract, then wire it into `apps/web` only when needed.
- Keep reusable business behavior in workspace packages and keep `apps/web` thin.

### Implementation Focus

- Default to redaction, encryption, retention limits, and least-privilege data access.
- Do not expose raw PII in logs, client components, telemetry, or fixtures.

### Validation Expectations

- Run `pnpm lint`, `pnpm typecheck`, `pnpm test`, and `pnpm build` before marking done.
- Add negative tests proving sensitive data is rejected, redacted, isolated, or unauthorized.

### Privacy Boundary

- Never commit real bank statements, account numbers, card numbers, IDs, emails, phone numbers, or raw statement text.
- Logs, telemetry, tests, and issue examples must remain privacy-safe.

## Dependencies

None

## Suggested Labels

release:v1, type:story, area:security, priority:medium
