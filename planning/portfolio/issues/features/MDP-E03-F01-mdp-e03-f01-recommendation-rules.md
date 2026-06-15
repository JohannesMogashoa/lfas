# Feature: Recommendation Rules

## Parent Epic

MDP-E03 — Recommendations

## Release

MDP

## Feature Outcome

Deliver the capability required for `Recommendation Rules` as part of `Recommendations`.

## Acceptance Criteria

- Stories under this feature are completed.
- route handler, server action, and package contracts are documented where applicable.
- Unit or integration tests exist for critical behavior.
- Implementation avoids storing unnecessary personal financial data.

## Stories

- [ ] Create recommendation rule framework
- [ ] Create budget recommendations
- [ ] Create debt recommendations
- [ ] Create savings recommendations
- [ ] Create risk recommendations

## Monorepo Enrichment

### Workspace Boundary

- Primary ownership: future `packages/recommendations` deterministic rule engines.
- Child stories should deliver vertical, testable slices rather than isolated technical artifacts.
- Contracts introduced by this feature must be documented in the owning package or architecture docs.

### Validation Expectations

- Run `pnpm lint`, `pnpm typecheck`, `pnpm test`, and `pnpm build` before marking done.
- Verify every child story has a clear workspace boundary and test expectation.

### Privacy Boundary

- Never commit real bank statements, account numbers, card numbers, IDs, emails, phone numbers, or raw statement text.
- Logs, telemetry, tests, and issue examples must remain privacy-safe.

## Labels

release:mdp, type:feature, area:recommendations, priority:medium
