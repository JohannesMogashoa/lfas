# Story: Create executive insight generator

## Parent

- Epic: MVP-E08 — Reporting
- Feature: MVP-E08-F01 — Financial Summary Reporting

## Release / Milestone

MVP

## User Story

As a product builder of LFAS, I want `Create executive insight generator` so that the system can progress toward trusted, private financial analysis.

## Acceptance Criteria

- [ ] Non-AI deterministic insights generated

## Implementation Tasks

- [ ] Top insights
- [ ] Warnings
- [ ] Opportunities

## Engineering Notes

- Use Next.js App Router in `apps/web` for pages, route handlers, and server actions.
- Keep deterministic financial rules in workspace packages, especially `packages/bank-statement-parser` or future domain packages.
- Keep raw bank statement data isolated behind storage and privacy boundaries.
- Use PNPM workspace dependencies and Turborepo tasks for build, lint, typecheck, test, and dev workflows.
- Add Vitest, integration, or Playwright coverage for parsing, validation, scoring, upload, or security behavior where applicable.
- Update documentation when behavior, package contracts, or route contracts are introduced.

## Monorepo Enrichment

### Target Workspace

- Primary ownership: future `packages/reporting` plus `apps/web` report route handlers.
- Start from the package contract, then wire it into `apps/web` only when needed.
- Keep reusable business behavior in workspace packages and keep `apps/web` thin.

### Implementation Focus

- Generate reports from sanitized summary models, not raw statements.
- Keep export format code behind replaceable reporting adapters.

### Validation Expectations

- Run `pnpm lint`, `pnpm typecheck`, `pnpm test`, and `pnpm build` before marking done.
- Add focused unit or integration coverage for the introduced behavior.

### Privacy Boundary

- Never commit real bank statements, account numbers, card numbers, IDs, emails, phone numbers, or raw statement text.
- Exports must use sanitized report models and avoid unnecessary transaction-level PII.

## Dependencies

None

## Suggested Labels

release:mvp, type:story, area:reporting, priority:medium
