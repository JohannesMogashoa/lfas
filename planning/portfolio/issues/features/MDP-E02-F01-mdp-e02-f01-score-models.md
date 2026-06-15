# Feature: Score Models

## Parent Epic

MDP-E02 — Scoring Engine

## Release

MDP

## Feature Outcome

Deliver the capability required for `Score Models` as part of `Scoring Engine`.

## Acceptance Criteria

- Stories under this feature are completed.
- route handler, server action, and package contracts are documented where applicable.
- Unit or integration tests exist for critical behavior.
- Implementation avoids storing unnecessary personal financial data.

## Stories

- [ ] Create financial health score
- [ ] Create affordability score
- [ ] Create debt risk score
- [ ] Create savings resilience score

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

release:mdp, type:feature, area:financial-engine, priority:medium
