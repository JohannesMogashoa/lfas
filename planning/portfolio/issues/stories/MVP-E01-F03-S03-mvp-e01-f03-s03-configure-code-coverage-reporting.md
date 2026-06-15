# Story: Configure code coverage reporting

## Parent

- Epic: MVP-E01 — Foundation
- Feature: MVP-E01-F03 — CI/CD and Quality Gates

## Release / Milestone

MVP

## User Story

As a product builder of LFAS, I want `Configure code coverage reporting` so that the system can progress toward trusted, private financial analysis.

## Acceptance Criteria

- [ ] Coverage output is available in workflow artifacts

## Implementation Tasks

- [ ] Collect coverage
- [ ] Generate coverage report
- [ ] Document threshold

## Engineering Notes

- Use Next.js App Router in `apps/web` for pages, route handlers, and server actions.
- Keep deterministic financial rules in workspace packages, especially `packages/bank-statement-parser` or future domain packages.
- Keep raw bank statement data isolated behind storage and privacy boundaries.
- Use PNPM workspace dependencies and Turborepo tasks for build, lint, typecheck, test, and dev workflows.
- Add Vitest, integration, or Playwright coverage for parsing, validation, scoring, upload, or security behavior where applicable.
- Update documentation when behavior, package contracts, or route contracts are introduced.

## Monorepo Enrichment

### Target Workspace

- Primary ownership: workspace root automation, `.github/workflows`, and `scripts/`.
- Start with root PNPM/Turbo scripts and GitHub Actions parity.
- Keep reusable business behavior in workspace packages and keep `apps/web` thin.

### Implementation Focus

- Generate reports from sanitized summary models, not raw statements.
- Keep export format code behind replaceable reporting adapters.

### Validation Expectations

- Run `pnpm lint`, `pnpm typecheck`, `pnpm test`, and `pnpm build` before marking done.
- Add focused unit or integration coverage for the introduced behavior.

### Privacy Boundary

- Never commit real bank statements, account numbers, card numbers, IDs, emails, phone numbers, or raw statement text.
- Logs, telemetry, tests, and issue examples must remain privacy-safe.

## Dependencies

None

## Suggested Labels

release:mvp, type:story, area:devops, priority:high
