# Story: Create questionnaire versioning

## Parent

- Epic: MDP-E01 — Questionnaire Engine
- Feature: MDP-E01-F02 — Response Capture

## Release / Milestone

MDP

## User Story

As a product builder of LFAS, I want `Create questionnaire versioning` so that the system can progress toward trusted, private financial analysis.

## Acceptance Criteria

- [ ] Historical responses remain valid

## Implementation Tasks

- [ ] Version id
- [ ] Effective dates
- [ ] Immutable completed responses

## Engineering Notes

- Prefer deterministic business rules before AI.
- Keep raw bank statement data isolated behind storage and privacy boundaries.
- Add tests for parsing, validation, scoring, or security behavior where applicable.
- Update documentation when behavior or contracts are introduced.

## Dependencies

None

## Suggested Labels

release:mdp, type:story, area:questionnaire, priority:medium
