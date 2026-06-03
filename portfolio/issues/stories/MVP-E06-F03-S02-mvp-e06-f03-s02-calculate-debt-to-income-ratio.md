# Story: Calculate debt-to-income ratio

## Parent
- Epic: MVP-E06 — Financial Engine
- Feature: MVP-E06-F03 — Debt and Savings Analysis

## Release / Milestone
MVP

## User Story
As a product builder of LFAS, I want `Calculate debt-to-income ratio` so that the system can progress toward trusted, private financial analysis.

## Acceptance Criteria
- [ ] DTI metric produced

## Implementation Tasks
- [ ] Debt payments
- [ ] Net income
- [ ] Ratio bands

## Engineering Notes
- Prefer deterministic business rules before AI.
- Keep raw bank statement data isolated behind storage and privacy boundaries.
- Add tests for parsing, validation, scoring, or security behavior where applicable.
- Update documentation when behavior or contracts are introduced.

## Dependencies
None

## Suggested Labels
release:mvp, type:story, area:financial-engine, priority:medium
