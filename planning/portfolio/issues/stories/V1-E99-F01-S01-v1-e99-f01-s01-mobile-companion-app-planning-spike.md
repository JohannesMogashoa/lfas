# Enhancement Story: Mobile companion app planning spike

## Release

V1

## Goal

Nice-to-have capability for later product maturity.

## Acceptance Criteria

- [ ] Mobile scope documented

## Implementation Tasks

- [ ] Define mobile use cases
- [ ] Assess offline statement upload
- [ ] Define API gaps

## Suggested Labels

release:v1, type:story, area:analytics, priority:low

## Monorepo Enrichment

### Target Workspace

- Primary ownership: future `packages/analytics` deterministic trend and forecast engines.
- Start from the package contract, then wire it into `apps/web` only when needed.
- Keep reusable business behavior in workspace packages and keep `apps/web` thin.

### Implementation Focus

- Separate deterministic trend calculations from presentation concerns.
- Document forecast assumptions and confidence boundaries.

### Validation Expectations

- Run `pnpm lint`, `pnpm typecheck`, `pnpm test`, and `pnpm build` before marking done.
- Add deterministic tests for edge cases, rounding, empty periods, and mixed transaction patterns.

### Privacy Boundary

- Never commit real bank statements, account numbers, card numbers, IDs, emails, phone numbers, or raw statement text.
- Logs, telemetry, tests, and issue examples must remain privacy-safe.
