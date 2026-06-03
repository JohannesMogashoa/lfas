# Story: Create categorization confidence score

## Parent
- Epic: MVP-E07 — Categorization
- Feature: MVP-E07-F03 — Confidence and Review

## Release / Milestone
MVP

## User Story
As a product builder of LFAS, I want `Create categorization confidence score` so that the system can progress toward trusted, private financial analysis.

## Acceptance Criteria
- [ ] Every category has confidence

## Implementation Tasks
- [ ] Exact merchant
- [ ] Keyword
- [ ] Regex
- [ ] Fallback

## Engineering Notes
- Prefer deterministic business rules before AI.
- Keep raw bank statement data isolated behind storage and privacy boundaries.
- Add tests for parsing, validation, scoring, or security behavior where applicable.
- Update documentation when behavior or contracts are introduced.

## Dependencies
MVP-E07-F02-S04

## Suggested Labels
release:mvp, type:story, area:financial-engine, priority:medium
