# ADR-0002: Use PostgreSQL

## Status
Accepted

## Context
LFAS needs a reliable relational datastore for statement metadata,
normalization outputs, validation results, derived financial facts, audit
records, and future commercial platform data. The project also needs a local
development stack that can be orchestrated consistently with .NET Aspire.

The system will handle sensitive financial records, so predictable
transactional behavior, mature indexing, strong constraints, and operational
visibility matter more than schemaless flexibility for the primary store.

## Decision
Use PostgreSQL as the primary relational datastore for LFAS.

PostgreSQL will be the default persistence target for transactional application
data, durable processing state, validation outputs, and audit-oriented records.
Local development should run PostgreSQL through the repository's Aspire and
Docker Compose setup.

## Consequences
- Relational constraints can protect financial data integrity.
- Migrations become part of the delivery workflow for persistence changes.
- Integration tests can target the same database engine used in deployed
  environments.
- Features that need document, vector, or analytical storage must justify that
  additional store with a separate decision.

## Implementation Guidance
- Keep persistence concerns in `LFAS.Infrastructure`.
- Prefer explicit schemas, constraints, and indexes for financial records.
- Treat migrations as reviewable source artifacts.
- Keep raw statement storage and retention boundaries aligned with privacy ADRs
  and future security decisions.
