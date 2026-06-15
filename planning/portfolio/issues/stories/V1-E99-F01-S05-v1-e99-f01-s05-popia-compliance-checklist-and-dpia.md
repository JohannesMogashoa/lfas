# Enhancement Story: POPIA compliance checklist and DPIA

## Release

V1

## Goal

Nice-to-have capability for later product maturity.

## Acceptance Criteria

- [ ] Compliance checklist exists

## Implementation Tasks

- [ ] Create DPIA template
- [ ] Data inventory
- [ ] Retention justification

## Suggested Labels

release:v1, type:story, area:security, priority:low

## Monorepo Enrichment

### Target Workspace

- Primary ownership: privacy/storage workspace packages and boundary code in `apps/web`.
- Start from the package contract, then wire it into `apps/web` only when needed.
- Keep reusable business behavior in workspace packages and keep `apps/web` thin.

### Implementation Focus

- Default to redaction, encryption, retention limits, and least-privilege data access.
- Do not expose raw PII in logs, client components, telemetry, or fixtures.

### Validation Expectations

- Run `pnpm lint`, `pnpm typecheck`, `pnpm test`, and `pnpm build` before marking done.
- Add negative tests proving sensitive data is rejected, redacted, isolated, or unauthorized.

### Privacy Boundary

- Never commit real bank statements, account numbers, card numbers, IDs, emails, phone numbers, or raw statement text.
- Logs, telemetry, tests, and issue examples must remain privacy-safe.
