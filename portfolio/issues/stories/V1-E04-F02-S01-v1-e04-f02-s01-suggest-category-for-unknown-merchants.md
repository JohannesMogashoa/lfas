# Story: Suggest category for unknown merchants

## Parent
- Epic: V1-E04 — AI Platform
- Feature: V1-E04-F02 — AI Assisted Categorization

## Release / Milestone
V1

## User Story
As a product builder of LFAS, I want `Suggest category for unknown merchants` so that the system can progress toward trusted, private financial analysis.

## Acceptance Criteria
- [ ] Suggestions generated safely

## Implementation Tasks
- [ ] Sanitized transaction only
- [ ] Confidence
- [ ] Reason

## Engineering Notes
- Prefer deterministic business rules before AI.
- Keep raw bank statement data isolated behind storage and privacy boundaries.
- Add tests for parsing, validation, scoring, or security behavior where applicable.
- Update documentation when behavior or contracts are introduced.

## Dependencies
None

## Suggested Labels
release:v1, type:story, area:ai, priority:medium
