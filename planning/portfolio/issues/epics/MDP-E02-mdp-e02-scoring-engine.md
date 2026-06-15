# Epic: Scoring Engine

## Release

MDP

## Goal

Combine statement analysis and questionnaire responses into financial decision scores.

## Business Capability

This epic contributes to the LFAS portfolio roadmap by enabling the product to move from raw financial data to trusted financial decisions.

## Acceptance Criteria

- Features under this epic are defined and sequenced.
- All stories have acceptance criteria and implementation tasks.
- Work can be tracked in the Kanban board.
- Security, privacy, and testability concerns are considered.

## Features

- [ ] Score Models
- [ ] Scoring Governance

## Monorepo Enrichment

### Delivery Shape

- Anchor this epic in future `packages/financial-engine` or `packages/domain` financial primitives and calculators.
- Sequence child features so deterministic local analysis comes before provider, AI, or commercial expansion.
- Keep GitHub issue content aligned with `planning/portfolio/portfolio.json` and the Markdown body files.

### Validation Expectations

- Run `pnpm lint`, `pnpm typecheck`, `pnpm test`, and `pnpm build` before marking done.
- Verify child features are sequenced around deterministic engines before AI or commercial expansion.

### Privacy Boundary

- Never commit real bank statements, account numbers, card numbers, IDs, emails, phone numbers, or raw statement text.
- Logs, telemetry, tests, and issue examples must remain privacy-safe.

## Labels

release:mdp, type:epic, area:financial-engine, priority:medium
