# Story: Detect Capitec statement format

## Parent
- Epic: MVP-E03 — PDF Extraction
- Feature: MVP-E03-F03 — Bank and Statement Detection

## Release / Milestone
MVP

## User Story
As a product builder of LFAS, I want `Detect Capitec statement format` so that the system can progress toward trusted, private financial analysis.

## Acceptance Criteria
- [ ] Capitec fixtures detected

## Implementation Tasks
- [ ] Header markers
- [ ] Layout markers
- [ ] Transaction table markers

## Engineering Notes
- Prefer deterministic business rules before AI.
- Keep raw bank statement data isolated behind storage and privacy boundaries.
- Add tests for parsing, validation, scoring, or security behavior where applicable.
- Update documentation when behavior or contracts are introduced.

## Dependencies
None

## Suggested Labels
release:mvp, type:story, area:parser, priority:high
