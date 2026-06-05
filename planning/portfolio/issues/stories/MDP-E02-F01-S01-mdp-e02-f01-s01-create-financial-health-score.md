# Story: Create financial health score

## Parent

- Epic: MDP-E02 — Scoring Engine
- Feature: MDP-E02-F01 — Score Models

## Release / Milestone

MDP

## User Story

As a product builder of LFAS, I want `Create financial health score` so that the system can progress toward trusted, private financial analysis.

## Acceptance Criteria

- [ ] Score generated with components

## Implementation Tasks

- [ ] Income
- [ ] Expenses
- [ ] Debt
- [ ] Savings
- [ ] Risk inputs

## Engineering Notes

- Prefer deterministic business rules before AI.
- Keep raw bank statement data isolated behind storage and privacy boundaries.
- Add tests for parsing, validation, scoring, or security behavior where applicable.
- Update documentation when behavior or contracts are introduced.

## Dependencies

None

## Suggested Labels

release:mdp, type:story, area:financial-engine, priority:medium
