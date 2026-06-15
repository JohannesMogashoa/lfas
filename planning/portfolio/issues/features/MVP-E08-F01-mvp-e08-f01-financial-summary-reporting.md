# Feature: Financial Summary Reporting

## Parent Epic

MVP-E08 — Reporting

## Release

MVP

## Feature Outcome

Deliver the capability required for `Financial Summary Reporting` as part of `Reporting`.

## Acceptance Criteria

- Stories under this feature are completed.
- route handler, server action, and package contracts are documented where applicable.
- Unit or integration tests exist for critical behavior.
- Implementation avoids storing unnecessary personal financial data.

## Stories

- [ ] Create financial summary model
- [ ] Create executive insight generator
- [ ] Create report data route handler

## Monorepo Enrichment

### Workspace Boundary

- Primary ownership: future `packages/reporting` plus `apps/web` report route handlers.
- Child stories should deliver vertical, testable slices rather than isolated technical artifacts.
- Contracts introduced by this feature must be documented in the owning package or architecture docs.

### Validation Expectations

- Run `pnpm lint`, `pnpm typecheck`, `pnpm test`, and `pnpm build` before marking done.
- Verify every child story has a clear workspace boundary and test expectation.

### Privacy Boundary

- Never commit real bank statements, account numbers, card numbers, IDs, emails, phone numbers, or raw statement text.
- Exports must use sanitized report models and avoid unnecessary transaction-level PII.

## Labels

release:mvp, type:feature, area:reporting, priority:high
