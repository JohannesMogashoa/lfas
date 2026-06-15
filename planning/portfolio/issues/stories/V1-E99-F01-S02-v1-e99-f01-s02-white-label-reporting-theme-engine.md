# Enhancement Story: White-label reporting theme engine

## Release

V1

## Goal

Nice-to-have capability for later product maturity.

## Acceptance Criteria

- [ ] Reports can be themed

## Implementation Tasks

- [ ] Theme model
- [ ] Logo upload design
- [ ] PDF theme tokens

## Suggested Labels

release:v1, type:story, area:reporting, priority:low

## Monorepo Enrichment

### Target Workspace

- Primary ownership: future `packages/reporting` plus `apps/web` report route handlers.
- Start from the package contract, then wire it into `apps/web` only when needed.
- Keep reusable business behavior in workspace packages and keep `apps/web` thin.

### Implementation Focus

- Generate reports from sanitized summary models, not raw statements.
- Keep export format code behind replaceable reporting adapters.

### Validation Expectations

- Run `pnpm lint`, `pnpm typecheck`, `pnpm test`, and `pnpm build` before marking done.
- Add focused unit or integration coverage for the introduced behavior.

### Privacy Boundary

- Never commit real bank statements, account numbers, card numbers, IDs, emails, phone numbers, or raw statement text.
- Exports must use sanitized report models and avoid unnecessary transaction-level PII.
