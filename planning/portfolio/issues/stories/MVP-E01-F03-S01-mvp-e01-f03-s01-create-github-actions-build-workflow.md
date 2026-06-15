# Story: Create GitHub Actions build workflow

## Parent

- Epic: MVP-E01 — Foundation
- Feature: MVP-E01-F03 — CI/CD and Quality Gates

## Release / Milestone

MVP

## User Story

As a product builder of LFAS, I want `Create GitHub Actions build workflow` so that the system can progress toward trusted, private financial analysis.

## Acceptance Criteria

- [ ] PR build runs automatically
- [ ] Main branch build succeeds

## Implementation Tasks

- [ ] Restore
- [ ] Build
- [ ] Test
- [ ] Publish test results

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

- Keep root scripts aligned with PNPM workspace commands and Turborepo task names.
- Document dependency direction so new packages do not create circular references.

### Validation Expectations

- Run `pnpm lint`, `pnpm typecheck`, `pnpm test`, and `pnpm build` before marking done.
- Add route handler/server action tests or Playwright coverage for the user-facing path.

### Privacy Boundary

- Never commit real bank statements, account numbers, card numbers, IDs, emails, phone numbers, or raw statement text.
- Logs, telemetry, tests, and issue examples must remain privacy-safe.

## Dependencies

MVP-E01-F02-S04

## Suggested Labels

release:mvp, type:story, area:devops, priority:high
