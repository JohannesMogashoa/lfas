# Enhancement Story: Fine-tuned merchant classifier research spike

## Release

V1

## Goal

Nice-to-have capability for later product maturity.

## Acceptance Criteria

- [ ] Fine-tuning feasibility documented

## Implementation Tasks

- [ ] Dataset strategy
- [ ] Privacy constraints
- [ ] Evaluation metrics

## Suggested Labels

release:v1, type:story, area:ai, priority:low

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
