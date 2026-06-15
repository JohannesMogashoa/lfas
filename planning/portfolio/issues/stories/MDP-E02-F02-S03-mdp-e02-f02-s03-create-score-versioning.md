# Story: Create score versioning

## Parent

- Epic: MDP-E02 — Scoring Engine
- Feature: MDP-E02-F02 — Scoring Governance

## Release / Milestone

MDP

## User Story

As a product builder of LFAS, I want `Create score versioning` so that the system can progress toward trusted, private financial analysis.

## Acceptance Criteria

- [ ] Scores reproducible by version

## Implementation Tasks

- [ ] Rule version
- [ ] CalculatedAt
- [ ] Input snapshot id

## Engineering Notes

- Use Next.js App Router in `apps/web` for pages, route handlers, and server actions.
- Keep deterministic financial rules in workspace packages, especially `packages/bank-statement-parser` or future domain packages.
- Keep raw bank statement data isolated behind storage and privacy boundaries.
- Use PNPM workspace dependencies and Turborepo tasks for build, lint, typecheck, test, and dev workflows.
- Add Vitest, integration, or Playwright coverage for parsing, validation, scoring, upload, or security behavior where applicable.
- Update documentation when behavior, package contracts, or route contracts are introduced.

## Monorepo Enrichment

### Target Workspace

- Primary ownership: future `packages/financial-engine` or `packages/domain` financial primitives and calculators.
- Start with pure calculators that use explicit money, date-range, and rounding types.
- Keep reusable business behavior in workspace packages and keep `apps/web` thin.

### Implementation Focus

- Use explicit money/currency/date-range types and document rounding rules in code.
- Keep calculations pure, repeatable, and covered by boundary-value tests.

### Validation Expectations

- Run `pnpm lint`, `pnpm typecheck`, `pnpm test`, and `pnpm build` before marking done.
- Add deterministic tests for edge cases, rounding, empty periods, and mixed transaction patterns.

### Privacy Boundary

- Never commit real bank statements, account numbers, card numbers, IDs, emails, phone numbers, or raw statement text.
- Logs, telemetry, tests, and issue examples must remain privacy-safe.

## Dependencies

None

## Suggested Labels

release:mdp, type:story, area:financial-engine, priority:medium
