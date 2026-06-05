# Story: Preserve reading order

## Parent

- Epic: MVP-E03 — PDF Extraction
- Feature: MVP-E03-F01 — Digital PDF Extraction

## Release / Milestone

MVP

## User Story

As a product builder of LFAS, I want `Preserve reading order` so that the system can progress toward trusted, private financial analysis.

## Acceptance Criteria

- [ ] Transactions appear in expected statement order

## Implementation Tasks

- [ ] Sort by Y then X
- [ ] Handle columns
- [ ] Configurable tolerance

## Engineering Notes

- Prefer deterministic business rules before AI.
- Keep raw bank statement data isolated behind storage and privacy boundaries.
- Add tests for parsing, validation, scoring, or security behavior where applicable.
- Update documentation when behavior or contracts are introduced.

## Dependencies

None

## Suggested Labels

release:mvp, type:story, area:parser, priority:high
