# Story: Validate opening and closing balances

## Parent
- Epic: MVP-E05 — Validation and Privacy
- Feature: MVP-E05-F01 — Statement Validation

## Release / Milestone
MVP

## User Story
As a product builder of LFAS, I want `Validate opening and closing balances` so that the system can progress toward trusted, private financial analysis.

## Acceptance Criteria
- [ ] Valid statements reconcile

## Implementation Tasks
- [ ] Opening balance rule
- [ ] Closing balance rule
- [ ] Tolerance config

## Engineering Notes
- Prefer deterministic business rules before AI.
- Keep raw bank statement data isolated behind storage and privacy boundaries.
- Add tests for parsing, validation, scoring, or security behavior where applicable.
- Update documentation when behavior or contracts are introduced.

## Dependencies
None

## Suggested Labels
release:mvp, type:story, area:financial-engine, priority:high
