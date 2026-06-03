# Story: Create retention policy service

## Parent
- Epic: MVP-E02 — Statement Ingestion
- Feature: MVP-E02-F02 — Document Storage

## Release / Milestone
MVP

## User Story
As a product builder of LFAS, I want `Create retention policy service` so that the system can progress toward trusted, private financial analysis.

## Acceptance Criteria
- [ ] Expired documents can be cleaned up

## Implementation Tasks
- [ ] Configurable retention days
- [ ] Mark expired
- [ ] Delete expired files

## Engineering Notes
- Prefer deterministic business rules before AI.
- Keep raw bank statement data isolated behind storage and privacy boundaries.
- Add tests for parsing, validation, scoring, or security behavior where applicable.
- Update documentation when behavior or contracts are introduced.

## Dependencies
None

## Suggested Labels
release:mvp, type:story, area:security, priority:high
