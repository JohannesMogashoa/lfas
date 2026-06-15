# Story: Create recommendation rule framework

## Parent

- Epic: MDP-E03 — Recommendations
- Feature: MDP-E03-F01 — Recommendation Rules

## Release / Milestone

MDP

## User Story

As a product builder of LFAS, I want `Create recommendation rule framework` so that the system can progress toward trusted, private financial analysis.

## Acceptance Criteria

- [ ] Rules can produce recommendations

## Implementation Tasks

- [ ] Trigger
- [ ] Eligibility
- [ ] Priority
- [ ] Template

## Engineering Notes

- Use Next.js App Router in `apps/web` for pages, route handlers, and server actions.
- Keep deterministic financial rules in workspace packages, especially `packages/bank-statement-parser` or future domain packages.
- Keep raw bank statement data isolated behind storage and privacy boundaries.
- Use PNPM workspace dependencies and Turborepo tasks for build, lint, typecheck, test, and dev workflows.
- Add Vitest, integration, or Playwright coverage for parsing, validation, scoring, upload, or security behavior where applicable.
- Update documentation when behavior, package contracts, or route contracts are introduced.

## Monorepo Enrichment

### Target Workspace

- Primary ownership: future `packages/recommendations` deterministic rule engines.
- Start from the package contract, then wire it into `apps/web` only when needed.
- Keep reusable business behavior in workspace packages and keep `apps/web` thin.

### Implementation Focus

- Base recommendations on deterministic rules, ranked evidence, and explainable tradeoffs.
- Keep persona or AI narrative generation downstream from validated recommendations.

### Validation Expectations

- Run `pnpm lint`, `pnpm typecheck`, `pnpm test`, and `pnpm build` before marking done.
- Add focused unit or integration coverage for the introduced behavior.

### Privacy Boundary

- Never commit real bank statements, account numbers, card numbers, IDs, emails, phone numbers, or raw statement text.
- Logs, telemetry, tests, and issue examples must remain privacy-safe.

## Dependencies

None

## Suggested Labels

release:mdp, type:story, area:recommendations, priority:medium
