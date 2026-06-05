# Story: Create money and currency value objects

## Parent

- Epic: MVP-E04 — Transaction Normalization
- Feature: MVP-E04-F01 — Canonical Financial Model

## Release / Milestone

MVP

## User Story

As a product builder of LFAS, I want `Create money and currency value objects` so that the system can progress toward trusted, private financial analysis.

## Acceptance Criteria

- [ ] Money calculations are safe

## Implementation Tasks

- [ ] Amount
- [ ] Currency
- [ ] Rounding rules
- [ ] ZAR default

## Engineering Notes

- Prefer deterministic business rules before AI.
- Keep raw bank statement data isolated behind storage and privacy boundaries.
- Add tests for parsing, validation, scoring, or security behavior where applicable.
- Update documentation when behavior or contracts are introduced.

## Dependencies

None

## Suggested Labels

release:mvp, type:story, area:financial-engine, priority:high
