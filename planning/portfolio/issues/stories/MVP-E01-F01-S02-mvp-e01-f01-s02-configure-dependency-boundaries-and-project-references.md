# Story: Configure workspace package boundaries and dependencies

## Parent

- Epic: MVP-E01 — Foundation
- Feature: MVP-E01-F01 — Monorepo Architecture

## Release / Milestone

MVP

## User Story

As a product builder of LFAS, I want `Configure workspace package boundaries and dependencies` so that the system can progress toward trusted, private financial analysis.

## Acceptance Criteria

- [ ] Architecture test fails on invalid dependency
- [ ] References documented in README

## Implementation Tasks

- [ ] Reference Domain from Application
- [ ] Reference Application from API
- [ ] Reference Infrastructure from API
- [ ] Prevent Infrastructure references from Domain
- [ ] Add architecture test

## Engineering Notes

- Use Next.js App Router in `apps/web` for pages, route handlers, and server actions.
- Keep deterministic financial rules in workspace packages, especially `packages/bank-statement-parser` or future domain packages.
- Keep raw bank statement data isolated behind storage and privacy boundaries.
- Use PNPM workspace dependencies and Turborepo tasks for build, lint, typecheck, test, and dev workflows.
- Add Vitest, integration, or Playwright coverage for parsing, validation, scoring, upload, or security behavior where applicable.
- Update documentation when behavior, package contracts, or route contracts are introduced.

## Monorepo Enrichment

### Target Workspace

- Primary ownership: `package.json`, `pnpm-workspace.yaml`, `turbo.json`, `packages/typescript-config`, and `packages/eslint-config`.
- Start from the package contract, then wire it into `apps/web` only when needed.
- Keep reusable business behavior in workspace packages and keep `apps/web` thin.

### Implementation Focus

- Keep root scripts aligned with PNPM workspace commands and Turborepo task names.
- Document dependency direction so new packages do not create circular references.

### Validation Expectations

- Run `pnpm lint`, `pnpm typecheck`, `pnpm test`, and `pnpm build` before marking done.
- Add focused unit or integration coverage for the introduced behavior.

### Privacy Boundary

- Never commit real bank statements, account numbers, card numbers, IDs, emails, phone numbers, or raw statement text.
- Logs, telemetry, tests, and issue examples must remain privacy-safe.

## Dependencies

None

## Suggested Labels

release:mvp, type:story, area:architecture, priority:high
