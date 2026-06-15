# Story: Create behavior baseline model

## Parent

- Epic: V1-E07 — Fraud and Risk Detection
- Feature: V1-E07-F01 — Anomaly Detection

## Release / Milestone

V1

## User Story

As a product builder of LFAS, I want `Create behavior baseline model` so that the system can progress toward trusted, private financial analysis.

## Acceptance Criteria

- [ ] Baseline established

## Implementation Tasks

- [ ] Typical merchants
- [ ] Typical amounts
- [ ] Typical timing

## Engineering Notes

- Use Next.js App Router in `apps/web` for pages, route handlers, and server actions.
- Keep deterministic financial rules in workspace packages, especially `packages/bank-statement-parser` or future domain packages.
- Keep raw bank statement data isolated behind storage and privacy boundaries.
- Use PNPM workspace dependencies and Turborepo tasks for build, lint, typecheck, test, and dev workflows.
- Add Vitest, integration, or Playwright coverage for parsing, validation, scoring, upload, or security behavior where applicable.
- Update documentation when behavior, package contracts, or route contracts are introduced.

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

## Dependencies

None

## Suggested Labels

release:v1, type:story, area:analytics, priority:medium
