# Story: Create CSV and JSON exports

## Parent
- Epic: MVP-E08 — Reporting
- Feature: MVP-E08-F02 — PDF and Excel Exports

## Release / Milestone
MVP

## User Story
As a product builder of LFAS, I want `Create CSV and JSON exports` so that the system can progress toward trusted, private financial analysis.

## Acceptance Criteria
- [ ] Exports contain no raw PII

## Implementation Tasks
- [ ] Sanitized transaction export
- [ ] Metrics export

## Engineering Notes
- Prefer deterministic business rules before AI.
- Keep raw bank statement data isolated behind storage and privacy boundaries.
- Add tests for parsing, validation, scoring, or security behavior where applicable.
- Update documentation when behavior or contracts are introduced.

## Dependencies
None

## Suggested Labels
release:mvp, type:story, area:reporting, priority:medium
