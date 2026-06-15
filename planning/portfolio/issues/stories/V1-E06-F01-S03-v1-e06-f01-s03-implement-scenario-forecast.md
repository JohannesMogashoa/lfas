# Story: Implement scenario forecast

## Parent

- Epic: V1-E06 — Predictive Analytics
- Feature: V1-E06-F01 — Cashflow Forecasting

## Release / Milestone

V1

## User Story

As a product builder of LFAS, I want `Implement scenario forecast` so that the system can progress toward trusted, private financial analysis.

## Acceptance Criteria

- [ ] Scenario forecast generated

## Implementation Tasks

- [ ] Income drop
- [ ] Expense increase
- [ ] Debt payoff

## Engineering Notes

- Use Next.js App Router in `apps/web` for pages, route handlers, and server actions.
- Keep deterministic financial rules in workspace packages, especially `packages/bank-statement-parser` or future domain packages.
- Keep raw bank statement data isolated behind storage and privacy boundaries.
- Use PNPM workspace dependencies and Turborepo tasks for build, lint, typecheck, test, and dev workflows.
- Add Vitest, integration, or Playwright coverage for parsing, validation, scoring, upload, or security behavior where applicable.
- Update documentation when behavior, package contracts, or route contracts are introduced.

## Monorepo Enrichment

### Target Workspace

- Primary ownership: future `packages/analytics` deterministic trend and forecast engines.
- Start from the package contract, then wire it into `apps/web` only when needed.
- Keep reusable business behavior in workspace packages and keep `apps/web` thin.

### Implementation Focus

- Separate deterministic trend calculations from presentation concerns.
- Document forecast assumptions and confidence boundaries.

### Validation Expectations

- Run `pnpm lint`, `pnpm typecheck`, `pnpm test`, and `pnpm build` before marking done.
- Add deterministic tests for edge cases, rounding, empty periods, and mixed transaction patterns.

### Privacy Boundary

- Never commit real bank statements, account numbers, card numbers, IDs, emails, phone numbers, or raw statement text.
- Logs, telemetry, tests, and issue examples must remain privacy-safe.

## Dependencies

None

## Suggested Labels

release:v1, type:story, area:analytics, priority:medium
