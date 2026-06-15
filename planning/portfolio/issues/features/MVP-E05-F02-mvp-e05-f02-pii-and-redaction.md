# Feature: PII and Redaction

## Parent Epic

MVP-E05 — Validation and Privacy

## Release

MVP

## Feature Outcome

Deliver the capability required for `PII and Redaction` as part of `Validation and Privacy`.

## Acceptance Criteria

- Stories under this feature are completed.
- route handler, server action, and package contracts are documented where applicable.
- Unit or integration tests exist for critical behavior.
- Implementation avoids storing unnecessary personal financial data.

## Stories

- [ ] Detect account numbers and card numbers
- [ ] Detect ID numbers, emails and phone numbers
- [ ] Implement masking and tokenization
- [ ] Create sanitized data contract for AI
- [ ] Create prompt inspection pipeline

## Monorepo Enrichment

### Workspace Boundary

- Primary ownership: privacy/storage workspace packages and boundary code in `apps/web`.
- Child stories should deliver vertical, testable slices rather than isolated technical artifacts.
- Contracts introduced by this feature must be documented in the owning package or architecture docs.

### Validation Expectations

- Run `pnpm lint`, `pnpm typecheck`, `pnpm test`, and `pnpm build` before marking done.
- Verify every child story has a clear workspace boundary and test expectation.

### Privacy Boundary

- Never commit real bank statements, account numbers, card numbers, IDs, emails, phone numbers, or raw statement text.
- Logs, telemetry, tests, and issue examples must remain privacy-safe.

## Labels

release:mvp, type:feature, area:security, priority:high
