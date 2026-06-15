# Story: Create test data builder library

## Parent

- Epic: MVP-E01 — Foundation
- Feature: MVP-E01-F05 — Testing Foundation

## Release / Milestone

MVP

## User Story

As a product builder of LFAS, I want `Create test data builder library` so that the system can progress toward trusted, private financial analysis.

## Acceptance Criteria

- [ ] Builders reduce fixture duplication

## Implementation Tasks

- [ ] StatementBuilder
- [ ] TransactionBuilder
- [ ] AccountBuilder

## Engineering Notes

- Use Next.js App Router in `apps/web` for pages, route handlers, and server actions.
- Keep deterministic financial rules in workspace packages, especially `packages/bank-statement-parser` or future domain packages.
- Keep raw bank statement data isolated behind storage and privacy boundaries.
- Use PNPM workspace dependencies and Turborepo tasks for build, lint, typecheck, test, and dev workflows.
- Add Vitest, integration, or Playwright coverage for parsing, validation, scoring, upload, or security behavior where applicable.
- Update documentation when behavior, package contracts, or route contracts are introduced.

## Monorepo Enrichment

### Target Workspace

- Primary ownership: workspace test setup, future `packages/test-utils`, Vitest, and Playwright.
- Start with test runner configuration and workspace-level test commands.
- Keep reusable business behavior in workspace packages and keep `apps/web` thin.

### Implementation Focus

- Prefer fast Vitest unit tests for packages and Playwright for critical browser flows.
- Ensure `pnpm test` remains the single root test command for CI.

### Validation Expectations

- Run `pnpm lint`, `pnpm typecheck`, `pnpm test`, and `pnpm build` before marking done.
- Add focused unit or integration coverage for the introduced behavior.

### Privacy Boundary

- Never commit real bank statements, account numbers, card numbers, IDs, emails, phone numbers, or raw statement text.
- Logs, telemetry, tests, and issue examples must remain privacy-safe.

## Dependencies

None

## Suggested Labels

release:mvp, type:story, area:testing, priority:high
