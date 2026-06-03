# Story: Implement balance extraction rules

## Parent
- Epic: MVP-E04 — Transaction Normalization
- Feature: MVP-E04-F02 — Extraction Rules

## Release / Milestone
MVP

## User Story
As a product builder of LFAS, I want `Implement balance extraction rules` so that the system can progress toward trusted, private financial analysis.

## Acceptance Criteria
- [ ] Balances mapped when available

## Implementation Tasks
- [ ] Running balance
- [ ] Opening/closing balance
- [ ] Missing balance handling

## Engineering Notes
- Prefer deterministic business rules before AI.
- Keep raw bank statement data isolated behind storage and privacy boundaries.
- Add tests for parsing, validation, scoring, or security behavior where applicable.
- Update documentation when behavior or contracts are introduced.

## Dependencies
None

## Suggested Labels
release:mvp, type:story, area:parser, priority:high
