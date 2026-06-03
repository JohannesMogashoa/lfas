# Story: Create Capitec transaction parser

## Parent
- Epic: MVP-E04 — Transaction Normalization
- Feature: MVP-E04-F03 — Bank Specific Parsers

## Release / Milestone
MVP

## User Story
As a product builder of LFAS, I want `Create Capitec transaction parser` so that the system can progress toward trusted, private financial analysis.

## Acceptance Criteria
- [ ] Capitec fixture extracted

## Implementation Tasks
- [ ] Map columns
- [ ] Handle money-in/money-out
- [ ] Parse balances

## Engineering Notes
- Prefer deterministic business rules before AI.
- Keep raw bank statement data isolated behind storage and privacy boundaries.
- Add tests for parsing, validation, scoring, or security behavior where applicable.
- Update documentation when behavior or contracts are introduced.

## Dependencies
None

## Suggested Labels
release:mvp, type:story, area:parser, priority:high
