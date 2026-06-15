# Story: Create processing status state machine

## Parent

- Epic: MVP-E02 — Statement Ingestion
- Feature: MVP-E02-F03 — Processing Orchestration

## Release / Milestone

MVP

## User Story

As a product builder of LFAS, I want `Create processing status state machine` so that the system can progress toward trusted, private financial analysis.

## Acceptance Criteria

- [ ] Invalid transitions prevented

## Implementation Tasks

- [ ] Uploaded
- [ ] Extracting
- [ ] Parsed
- [ ] Validated
- [ ] Failed

## Engineering Notes

- Use Next.js App Router in `apps/web` for pages, route handlers, and server actions.
- Keep deterministic financial rules in workspace packages, especially `packages/bank-statement-parser` or future domain packages.
- Keep raw bank statement data isolated behind storage and privacy boundaries.
- Use PNPM workspace dependencies and Turborepo tasks for build, lint, typecheck, test, and dev workflows.
- Add Vitest, integration, or Playwright coverage for parsing, validation, scoring, upload, or security behavior where applicable.
- Update documentation when behavior, package contracts, or route contracts are introduced.

## Monorepo Enrichment

### Target Workspace

- Primary ownership: replaceable infrastructure packages and worker/orchestration adapters.
- Start from the package contract, then wire it into `apps/web` only when needed.
- Keep reusable business behavior in workspace packages and keep `apps/web` thin.

### Implementation Focus

- Keep the first implementation vertical and business-capability oriented.
- Avoid leaking framework, storage, or provider details into domain logic.

### Validation Expectations

- Run `pnpm lint`, `pnpm typecheck`, `pnpm test`, and `pnpm build` before marking done.
- Add focused unit or integration coverage for the introduced behavior.

### Privacy Boundary

- Never commit real bank statements, account numbers, card numbers, IDs, emails, phone numbers, or raw statement text.
- Logs, telemetry, tests, and issue examples must remain privacy-safe.

## Dependencies

MVP-E02-F02-S04

## Suggested Labels

release:mvp, type:story, area:infrastructure, priority:high
