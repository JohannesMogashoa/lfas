# Story: Detect ID numbers, emails and phone numbers

## Parent
- Epic: MVP-E05 — Validation and Privacy
- Feature: MVP-E05-F02 — PII and Redaction

## Release / Milestone
MVP

## User Story
As a product builder of LFAS, I want `Detect ID numbers, emails and phone numbers` so that the system can progress toward trusted, private financial analysis.

## Acceptance Criteria
- [ ] Common PII detected

## Implementation Tasks
- [ ] SA ID regex
- [ ] Email regex
- [ ] Phone regex

## Engineering Notes
- Prefer deterministic business rules before AI.
- Keep raw bank statement data isolated behind storage and privacy boundaries.
- Add tests for parsing, validation, scoring, or security behavior where applicable.
- Update documentation when behavior or contracts are introduced.

## Dependencies
None

## Suggested Labels
release:mvp, type:story, area:security, priority:high
