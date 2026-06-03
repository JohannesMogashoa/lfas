# Story: Configure macOS developer bootstrap

## Parent
- Epic: MVP-E01 — Foundation
- Feature: MVP-E01-F02 — Development Environment

## Release / Milestone
MVP

## User Story
As a product builder of LFAS, I want `Configure macOS developer bootstrap` so that the system can progress toward trusted, private financial analysis.

## Acceptance Criteria
- [ ] Fresh Mac can validate prerequisites using one command

## Implementation Tasks
- [ ] Create setup-dev.sh
- [ ] Check dotnet SDK
- [ ] Check Docker
- [ ] Check gh CLI
- [ ] Check PostgreSQL container

## Engineering Notes
- Prefer deterministic business rules before AI.
- Keep raw bank statement data isolated behind storage and privacy boundaries.
- Add tests for parsing, validation, scoring, or security behavior where applicable.
- Update documentation when behavior or contracts are introduced.

## Dependencies
MVP-E01-F01-S04

## Suggested Labels
release:mvp, type:story, area:devops, priority:high
