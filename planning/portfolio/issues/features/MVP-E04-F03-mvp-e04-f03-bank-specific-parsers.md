# Feature: Bank Specific Parsers

## Parent Epic

MVP-E04 — Transaction Normalization

## Release

MVP

## Feature Outcome

Deliver the capability required for `Bank Specific Parsers` as part of `Transaction Normalization`.

## Acceptance Criteria

- Stories under this feature are completed.
- route handler, server action, and package contracts are documented where applicable.
- Unit or integration tests exist for critical behavior.
- Implementation avoids storing unnecessary personal financial data.

## Stories

- [ ] Create FNB transaction parser
- [ ] Create Standard Bank transaction parser
- [ ] Create ABSA transaction parser
- [ ] Create Nedbank transaction parser
- [ ] Create Capitec transaction parser
- [ ] Create generic fallback parser

## Monorepo Enrichment

### Workspace Boundary

- Primary ownership: `packages/bank-statement-parser` and deterministic parser fixtures.
- Child stories should deliver vertical, testable slices rather than isolated technical artifacts.
- Contracts introduced by this feature must be documented in the owning package or architecture docs.

### Validation Expectations

- Run `pnpm lint`, `pnpm typecheck`, `pnpm test`, and `pnpm build` before marking done.
- Verify every child story has a clear workspace boundary and test expectation.

### Privacy Boundary

- Never commit real bank statements, account numbers, card numbers, IDs, emails, phone numbers, or raw statement text.
- Fixtures must be synthetic or redacted while preserving layout and parsing edge cases.

## Labels

release:mvp, type:feature, area:parser, priority:high
