# Feature: AI Assisted Categorization

## Parent Epic

V1-E04 — AI Platform

## Release

V1

## Feature Outcome

Deliver the capability required for `AI Assisted Categorization` as part of `AI Platform`.

## Acceptance Criteria

- Stories under this feature are completed.
- route handler, server action, and package contracts are documented where applicable.
- Unit or integration tests exist for critical behavior.
- Implementation avoids storing unnecessary personal financial data.

## Stories

- [ ] Suggest category for unknown merchants
- [ ] Suggest merchant normalization

## Monorepo Enrichment

### Workspace Boundary

- Primary ownership: future `packages/ai` with local provider adapters and redacted contracts.
- Child stories should deliver vertical, testable slices rather than isolated technical artifacts.
- Contracts introduced by this feature must be documented in the owning package or architecture docs.

### Validation Expectations

- Run `pnpm lint`, `pnpm typecheck`, `pnpm test`, and `pnpm build` before marking done.
- Verify every child story has a clear workspace boundary and test expectation.

### Privacy Boundary

- Never commit real bank statements, account numbers, card numbers, IDs, emails, phone numbers, or raw statement text.
- No model prompt may include raw statement content unless a future explicit approval changes the boundary.

## Labels

release:v1, type:feature, area:ai, priority:medium
