# Story: Implement date extraction rules

## Parent

- Epic: MVP-E04 — Transaction Normalization
- Feature: MVP-E04-F02 — Extraction Rules

## Release / Milestone

MVP

## User Story

As a product builder of LFAS, I want `Implement date extraction rules` so that the system can progress toward trusted, private financial analysis.

## Acceptance Criteria

- [ ] Dates parsed consistently

## Implementation Tasks

- [ ] SA date formats
- [ ] Month name formats
- [ ] Year inference

## Engineering Notes

- Use Next.js App Router in `apps/web` for pages, route handlers, and server actions.
- Keep deterministic financial rules in workspace packages, especially `packages/bank-statement-parser` or future domain packages.
- Keep raw bank statement data isolated behind storage and privacy boundaries.
- Use PNPM workspace dependencies and Turborepo tasks for build, lint, typecheck, test, and dev workflows.
- Add Vitest, integration, or Playwright coverage for parsing, validation, scoring, upload, or security behavior where applicable.
- Update documentation when behavior, package contracts, or route contracts are introduced.

## Monorepo Enrichment

### Target Workspace

- Primary ownership: `packages/bank-statement-parser` and deterministic parser fixtures.
- Start with pure parser functions and typed fixtures before wiring any route handler.
- Keep reusable business behavior in workspace packages and keep `apps/web` thin.

### Implementation Focus

- Prefer deterministic text extraction, normalization, and confidence scoring before AI assistance.
- Use synthetic or redacted fixtures that preserve structure without exposing real financial data.

### Validation Expectations

- Run `pnpm lint`, `pnpm typecheck`, `pnpm test`, and `pnpm build` before marking done.
- Add parser fixture tests for successful extraction, ambiguous input, and failure paths.

### Privacy Boundary

- Never commit real bank statements, account numbers, card numbers, IDs, emails, phone numbers, or raw statement text.
- Fixtures must be synthetic or redacted while preserving layout and parsing edge cases.

## Dependencies

MVP-E04-F01-S04

## Suggested Labels

release:mvp, type:story, area:parser, priority:high
