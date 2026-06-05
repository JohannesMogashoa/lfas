# Story: Apply tenant filters to data access

## Parent

- Epic: V1-E02 — Multi-Tenancy
- Feature: V1-E02-F01 — Tenant Isolation

## Release / Milestone

V1

## User Story

As a product builder of LFAS, I want `Apply tenant filters to data access` so that the system can progress toward trusted, private financial analysis.

## Acceptance Criteria

- [ ] Tenant data isolated

## Implementation Tasks

- [ ] EF global query filters
- [ ] TenantId
- [ ] Bypass prevention

## Engineering Notes

- Prefer deterministic business rules before AI.
- Keep raw bank statement data isolated behind storage and privacy boundaries.
- Add tests for parsing, validation, scoring, or security behavior where applicable.
- Update documentation when behavior or contracts are introduced.

## Dependencies

None

## Suggested Labels

release:v1, type:story, area:security, priority:medium
