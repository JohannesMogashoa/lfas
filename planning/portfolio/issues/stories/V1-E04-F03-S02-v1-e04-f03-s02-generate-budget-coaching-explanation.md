# Story: Generate budget coaching explanation

## Parent

- Epic: V1-E04 — AI Platform
- Feature: V1-E04-F03 — AI Financial Advisor

## Release / Milestone

V1

## User Story

As a product builder of LFAS, I want `Generate budget coaching explanation` so that the system can progress toward trusted, private financial analysis.

## Acceptance Criteria

- [ ] Advice is grounded in rules

## Implementation Tasks

- [ ] Category overspend
- [ ] Savings goal
- [ ] Debt risk

## Engineering Notes

- Use Next.js App Router in `apps/web` for pages, route handlers, and server actions.
- Keep deterministic financial rules in workspace packages, especially `packages/bank-statement-parser` or future domain packages.
- Keep raw bank statement data isolated behind storage and privacy boundaries.
- Use PNPM workspace dependencies and Turborepo tasks for build, lint, typecheck, test, and dev workflows.
- Add Vitest, integration, or Playwright coverage for parsing, validation, scoring, upload, or security behavior where applicable.
- Update documentation when behavior, package contracts, or route contracts are introduced.

## Monorepo Enrichment

### Target Workspace

- Primary ownership: future `packages/ai` with local provider adapters and redacted contracts.
- Start with sanitized prompt/response contracts before any provider integration.
- Keep reusable business behavior in workspace packages and keep `apps/web` thin.

### Implementation Focus

- Route all model inputs through a redaction and prompt-inspection boundary.
- Treat AI output as advisory and validate it against deterministic metrics before use.

### Validation Expectations

- Run `pnpm lint`, `pnpm typecheck`, `pnpm test`, and `pnpm build` before marking done.
- Add focused unit or integration coverage for the introduced behavior.

### Privacy Boundary

- Never commit real bank statements, account numbers, card numbers, IDs, emails, phone numbers, or raw statement text.
- No model prompt may include raw statement content unless a future explicit approval changes the boundary.

## Dependencies

None

## Suggested Labels

release:v1, type:story, area:ai, priority:medium
