# Epic: AI Platform

## Release

V1

## Goal

Add local/private AI assistance only after deterministic engines are reliable.

## Business Capability

This epic contributes to the LFAS portfolio roadmap by enabling the product to move from raw financial data to trusted financial decisions.

## Acceptance Criteria

- Features under this epic are defined and sequenced.
- All stories have acceptance criteria and implementation tasks.
- Work can be tracked in the Kanban board.
- Security, privacy, and testability concerns are considered.

## Features

- [ ] Local AI Infrastructure
- [ ] AI Assisted Categorization
- [ ] AI Financial Advisor

## Monorepo Enrichment

### Delivery Shape

- Anchor this epic in future `packages/ai` with local provider adapters and redacted contracts.
- Sequence child features so deterministic local analysis comes before provider, AI, or commercial expansion.
- Keep GitHub issue content aligned with `planning/portfolio/portfolio.json` and the Markdown body files.

### Validation Expectations

- Run `pnpm lint`, `pnpm typecheck`, `pnpm test`, and `pnpm build` before marking done.
- Verify child features are sequenced around deterministic engines before AI or commercial expansion.

### Privacy Boundary

- Never commit real bank statements, account numbers, card numbers, IDs, emails, phone numbers, or raw statement text.
- No model prompt may include raw statement content unless a future explicit approval changes the boundary.

## Labels

release:v1, type:epic, area:ai, priority:medium
