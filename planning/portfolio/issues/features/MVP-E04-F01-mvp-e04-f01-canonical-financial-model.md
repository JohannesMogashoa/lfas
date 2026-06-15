# Feature: Canonical Financial Model

## Parent Epic

MVP-E04 — Transaction Normalization

## Release

MVP

## Feature Outcome

Deliver the capability required for `Canonical Financial Model` as part of `Transaction Normalization`.

## Acceptance Criteria

- Stories under this feature are completed.
- route handler, server action, and package contracts are documented where applicable.
- Unit or integration tests exist for critical behavior.
- Implementation avoids storing unnecessary personal financial data.

## Stories

- [ ] Create Statement aggregate
- [ ] Create Transaction entity
- [ ] Create Account and Merchant entities
- [ ] Create money and currency value objects

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
