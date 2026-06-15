# Feature: Bank and Statement Detection

## Parent Epic

MVP-E03 — PDF Extraction

## Release

MVP

## Feature Outcome

Deliver the capability required for `Bank and Statement Detection` as part of `PDF Extraction`.

## Acceptance Criteria

- Stories under this feature are completed.
- route handler, server action, and package contracts are documented where applicable.
- Unit or integration tests exist for critical behavior.
- Implementation avoids storing unnecessary personal financial data.

## Stories

- [ ] Create bank detection engine
- [ ] Detect FNB statement format
- [ ] Detect Standard Bank statement format
- [ ] Detect ABSA statement format
- [ ] Detect Nedbank statement format
- [ ] Detect Capitec statement format
- [ ] Detect Discovery Bank and TymeBank formats

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
