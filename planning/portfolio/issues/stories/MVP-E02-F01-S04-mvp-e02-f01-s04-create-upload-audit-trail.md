# Story: Create upload audit trail

## Parent

- Epic: MVP-E02 — Statement Ingestion
- Feature: MVP-E02-F01 — Upload Workflow

## Release / Milestone

MVP

## User Story

As a product builder of LFAS, I want `Create upload audit trail` so that the system can progress toward trusted, private financial analysis.

## Acceptance Criteria

- [ ] Audit event created per upload

## Implementation Tasks

- [ ] UploadedAt
- [ ] UploadedBy placeholder
- [ ] Source IP optional
- [ ] Correlation ID

## Engineering Notes

- Use Next.js App Router in `apps/web` for pages, route handlers, and server actions.
- Keep deterministic financial rules in workspace packages, especially `packages/bank-statement-parser` or future domain packages.
- Keep raw bank statement data isolated behind storage and privacy boundaries.
- Use PNPM workspace dependencies and Turborepo tasks for build, lint, typecheck, test, and dev workflows.
- Add Vitest, integration, or Playwright coverage for parsing, validation, scoring, upload, or security behavior where applicable.
- Update documentation when behavior, package contracts, or route contracts are introduced.

## Monorepo Enrichment

### Target Workspace

- Primary ownership: `apps/web` route handlers, server actions, and typed response contracts.
- Start from the package contract, then wire it into `apps/web` only when needed.
- Keep reusable business behavior in workspace packages and keep `apps/web` thin.

### Implementation Focus

- Validate file type, size, correlation ID, and idempotency before persisting metadata.
- Keep raw statement bytes server-side only and return a typed upload/job result.

### Validation Expectations

- Run `pnpm lint`, `pnpm typecheck`, `pnpm test`, and `pnpm build` before marking done.
- Add route handler/server action tests or Playwright coverage for the user-facing path.

### Privacy Boundary

- Never commit real bank statements, account numbers, card numbers, IDs, emails, phone numbers, or raw statement text.
- Do not send raw statement bytes or extracted PII to Client Components.

## Dependencies

None

## Suggested Labels

release:mvp, type:story, area:api, priority:high
