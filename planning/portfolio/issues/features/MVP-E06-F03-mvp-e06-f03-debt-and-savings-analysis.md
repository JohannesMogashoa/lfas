# Feature: Debt and Savings Analysis

## Parent Epic

MVP-E06 — Financial Engine

## Release

MVP

## Feature Outcome

Deliver the capability required for `Debt and Savings Analysis` as part of `Financial Engine`.

## Acceptance Criteria

- Stories under this feature are completed.
- route handler, server action, and package contracts are documented where applicable.
- Unit or integration tests exist for critical behavior.
- Implementation avoids storing unnecessary personal financial data.

## Stories

- [ ] Detect debt repayments
- [ ] Calculate debt-to-income ratio
- [ ] Calculate savings rate
- [ ] Estimate emergency fund and cash buffer

## Monorepo Enrichment

### Workspace Boundary

- Primary ownership: future `packages/financial-engine` or `packages/domain` financial primitives and calculators.
- Child stories should deliver vertical, testable slices rather than isolated technical artifacts.
- Contracts introduced by this feature must be documented in the owning package or architecture docs.

### Validation Expectations

- Run `pnpm lint`, `pnpm typecheck`, `pnpm test`, and `pnpm build` before marking done.
- Verify every child story has a clear workspace boundary and test expectation.

### Privacy Boundary

- Never commit real bank statements, account numbers, card numbers, IDs, emails, phone numbers, or raw statement text.
- Logs, telemetry, tests, and issue examples must remain privacy-safe.

## Labels

release:mvp, type:feature, area:financial-engine, priority:high
