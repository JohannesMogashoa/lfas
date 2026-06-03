# Architecture Decision Records

This directory contains Architecture Decision Records (ADRs) for LFAS.

ADRs document decisions that shape the system architecture, privacy posture,
operational model, or long-term product constraints. They should be short,
specific, and updated by creating a new ADR when a decision is superseded.

## Index

| ADR | Title | Status |
| --- | --- | --- |
| [0001](0001-clean-architecture.md) | Use Clean Architecture | Accepted |
| [0002](0002-postgresql.md) | Use PostgreSQL | Accepted |
| [0003](0003-local-first-ai.md) | Use a Local-first AI Boundary | Accepted |

## Naming

Use four-digit sequence numbers and kebab-case titles:

```text
0004-short-decision-title.md
```

## Process

1. Copy [template.md](template.md).
2. Assign the next sequence number.
3. Keep the decision focused on one architectural concern.
4. Link related ADRs when a decision depends on, amends, or supersedes another.
