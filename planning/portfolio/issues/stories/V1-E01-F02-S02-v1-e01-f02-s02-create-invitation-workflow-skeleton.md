# Story: Create invitation workflow skeleton

## Parent

- Epic: V1-E01 — Identity and Access
- Feature: V1-E01-F02 — Organizations

## Release / Milestone

V1

## User Story

As a product builder of LFAS, I want `Create invitation workflow skeleton` so that the system can progress toward trusted, private financial analysis.

## Acceptance Criteria

- [ ] Team onboarding model exists

## Implementation Tasks

- [ ] Invite
- [ ] Accept
- [ ] Expire

## Engineering Notes

- Use Next.js App Router in `apps/web` for pages, route handlers, and server actions.
- Keep deterministic financial rules in workspace packages, especially `packages/bank-statement-parser` or future domain packages.
- Keep raw bank statement data isolated behind storage and privacy boundaries.
- Use PNPM workspace dependencies and Turborepo tasks for build, lint, typecheck, test, and dev workflows.
- Add Vitest, integration, or Playwright coverage for parsing, validation, scoring, upload, or security behavior where applicable.
- Update documentation when behavior, package contracts, or route contracts are introduced.

## Monorepo Enrichment

### Target Workspace

- Primary ownership: `apps/web` authentication, session, middleware, and authorization boundaries.
- Start with server-side auth/session contracts and authorization checks.
- Keep reusable business behavior in workspace packages and keep `apps/web` thin.

### Implementation Focus

- Resolve identity and tenant context on the server before data access.
- Keep authorization checks close to route handlers and shared application services.

### Validation Expectations

- Run `pnpm lint`, `pnpm typecheck`, `pnpm test`, and `pnpm build` before marking done.
- Add route handler/server action tests or Playwright coverage for the user-facing path.

### Privacy Boundary

- Never commit real bank statements, account numbers, card numbers, IDs, emails, phone numbers, or raw statement text.
- Logs, telemetry, tests, and issue examples must remain privacy-safe.

## Dependencies

None

## Suggested Labels

release:v1, type:story, area:identity, priority:medium
