# AGENTS.md

## Purpose

This repository contains a local-first financial analysis system built with .NET and
Clean Architecture principles. All automated agents, coding assistants, and
AI-generated contributions must follow the rules in this document.

The primary goal of the system is to deliver business capabilities, not disconnected
technical components. Work must align to business outcomes such as:

- user uploads statement
- system extracts transactions
- system validates statement
- system calculates financial position
- system generates recommendations

Do not optimize for novelty. Optimize for correctness, maintainability, traceability,
privacy, and testability.

---

## Core Engineering Principles

1. Follow Clean Architecture strictly.
2. Prefer business capability slices over technical-layer-first design.
3. Keep the Shared Kernel small, stable, and dependency-free.
4. Domain logic must remain pure and deterministic.
5. Infrastructure is replaceable.
6. Code must be production-quality, not illustrative unless explicitly requested.
7. All non-trivial behavior must be covered by tests.
8. Financial calculations must be precise and explicit.
9. Privacy and PII boundaries are mandatory.
10. Generated output must be minimal, clear, and consistent with repo conventions.

---

## Solution Structure

Expected top-level structure:

- `src/FinanceAI.SharedKernel`
- `src/FinanceAI.Domain`
- `src/FinanceAI.Application`
- `src/FinanceAI.Infrastructure`
- `src/FinanceAI.API`
- `src/FinanceAI.StatementParser`
- `src/FinanceAI.AI`
- `src/FinanceAI.Reporting`
- `tests/FinanceAI.UnitTests`
- `tests/FinanceAI.IntegrationTests`
- `docs`
- `scripts`

Agents must place code in the correct project and must not introduce unnecessary new
projects.

---

## Architecture Rules

### Dependency Direction

Dependencies must flow inward only.

- `SharedKernel`: depends on nothing in this repository
- `Domain`: may depend on `SharedKernel`
- `Application`: may depend on `Domain` and `SharedKernel`
- `Infrastructure`: may depend on `Application`, `Domain`, and `SharedKernel`
- `API`: may depend on `Application`, `Infrastructure`, and `SharedKernel`
- `StatementParser`: may depend on `Application`, `Domain`, and `SharedKernel`
- `AI`: may depend on `Application` and `SharedKernel`
- `Reporting`: may depend on `Application` and `SharedKernel`

Do not introduce reverse dependencies.

### Domain Rules

Domain code must not depend on:

- ASP.NET Core
- Entity Framework Core
- logging frameworks
- MediatR directly unless already approved in the architecture
- file system APIs
- HTTP clients
- database concerns
- serializer-specific attributes unless explicitly approved

Domain entities and value objects must model business rules, invariants, and behavior.

### Application Rules

Application contains:

- use cases
- commands and queries
- interfaces/ports
- validation orchestration
- DTOs only where appropriate
- domain event handlers if that is the chosen pattern

Application must not contain infrastructure implementation details.

### Infrastructure Rules

Infrastructure contains implementations for:

- persistence
- file storage
- OCR/PDF libraries
- external/local AI integrations
- reporting engine integrations
- background processing adapters

Infrastructure must implement application contracts, not redefine them.

---

## Shared Kernel Rules

The Shared Kernel is reserved for highly stable, cross-cutting primitives only.

Allowed examples:

- `Money`
- `DateRange`
- `CorrelationId`
- `BaseEntity`
- domain event abstractions
- guard clauses
- result/error primitives if approved

Do not place feature-specific logic in the Shared Kernel.

### Shared Kernel Constraints

- no dependency on other solution projects
- no dependency on web frameworks
- no dependency on persistence frameworks
- no dependency on UI concerns
- must remain small and stable

---

## C# Coding Standards

### Language and Runtime

- Use the current approved .NET SDK for this repo.
- Use nullable reference types.
- Treat warnings as errors where practical.
- Use implicit usings only if already enabled consistently across the solution.

### Type Design

- Prefer `record struct` or `readonly record struct` for small immutable value objects.
- Prefer `sealed` classes when inheritance is not intended.
- Prefer explicit constructors that enforce invariants.
- Avoid primitive obsession. Use value objects where business meaning matters.
- Avoid anemic domain models when behavior belongs to the domain.

### Naming

- Use clear, descriptive names.
- Use `PascalCase` for public members and types.
- Use `_camelCase` for private readonly fields.
- Interfaces must start with `I`.
- Avoid abbreviations unless standard and unambiguous.

### Immutability

- Prefer immutability by default.
- Use `init` setters only when appropriate and safe.
- Avoid public mutable collections.
- Expose read-only collections from aggregates and entities.

### Exceptions

- Throw exceptions only for truly exceptional situations.
- Use domain-specific exceptions where clarity matters.
- Do not use exceptions for normal control flow.
- Validate invariants at construction and mutation boundaries.

### Async

- Use async/await correctly.
- Do not block on async code.
- Pass `CancellationToken` in all I/O and application workflows where appropriate.
- Suffix asynchronous methods with `Async`.

### Collections and LINQ

- Prefer clarity over cleverness.
- Avoid multiple enumeration of `IEnumerable`.
- Materialize collections intentionally.
- Avoid complex nested LINQ where imperative code is clearer.

### Pattern Matching

- Prefer modern C# pattern matching when it improves readability.
- Do not use advanced language features purely for cleverness.

### Comments

- Write self-explanatory code first.
- Add comments only where they provide intent, rationale, or domain context.
- Do not add redundant comments that restate the code.

---

## Financial Domain Rules

This is a financial system. Accuracy is mandatory.

### Money

- Never use `double` or `float` for monetary values.
- Use `decimal` within the `Money` value object.
- Never pass naked monetary amounts where `Money` should be used.
- Do not mix currencies silently.
- Enforce currency matching in arithmetic operations.

### Dates and Periods

- Use `DateOnly` where time-of-day is irrelevant and supported by the architecture.
- Use `DateTimeOffset` for timestamps crossing system boundaries.
- Use `DateRange` for periods instead of separate start/end pairs.
- Be explicit about timezone and UTC behavior.

### Rounding

- Be explicit about rounding rules.
- Do not rely on implicit framework defaults for financial rounding in business logic.
- Document rounding intent in code when non-obvious.

---

## Domain Modeling Rules

### Entities

- Entities must have identity.
- Entities must protect invariants.
- Entities should expose behavior, not just data.
- Inheritance from `BaseEntity` must be intentional and minimal.

### Value Objects

- Value objects must be immutable.
- Value objects must validate themselves on creation.
- Value objects should encapsulate domain meaning and related operations.

### Domain Events

- Use domain events for important business occurrences.
- Domain events should be named in past tense, e.g. `StatementValidated`.
- Domain events should represent facts, not commands.
- Do not publish meaningless or overly granular events.

---

## API Rules

- Controllers/endpoints must remain thin.
- No business logic in controllers.
- Validate inputs at the boundary.
- Return appropriate HTTP status codes.
- Use problem details or a consistent error contract.
- Include correlation ID propagation in request/response behavior where implemented.

Do not expose internal domain entities directly from API endpoints unless explicitly
approved. Prefer response contracts.

---

## Persistence Rules

- Keep persistence concerns out of the domain model where possible.
- Entity Framework configuration belongs in Infrastructure.
- Prefer explicit entity type configuration over giant `OnModelCreating` methods.
- Be explicit about precision for decimal columns.
- Always define indexes and constraints intentionally.
- Use migrations responsibly; generated migrations must be reviewed.

---

## Testing Rules

All non-trivial logic requires tests.

### Unit Tests

Unit tests must cover:

- value object invariants
- domain entity behavior
- financial calculations
- parsing rules
- validation rules
- domain event emission
- edge cases and boundary conditions

### Integration Tests

Integration tests must cover:

- database persistence mappings
- API request/response behavior
- file upload workflows
- parser integration
- end-to-end statement processing paths where feasible

### Test Quality

- Use clear Arrange/Act/Assert structure.
- Prefer deterministic tests.
- Avoid brittle timing-dependent tests.
- Do not use real external services in unit tests.
- Use test data builders/factories where useful.
- Name tests clearly using business behavior language.

---

## Logging and Observability Rules

- Use structured logging.
- Include correlation ID in relevant logs.
- Never log raw sensitive financial or PII data unless explicitly approved for a secure
  local-only scenario and clearly justified.
- Log intent and outcomes, not noise.

---

## Privacy and Security Rules

This system processes highly sensitive financial data.

### Mandatory Rules

- Do not send raw statement data to external services.
- Do not expose PII in logs.
- Do not store secrets in source control.
- Use environment variables or approved local secret mechanisms.
- Redact sensitive data before AI prompt construction.
- Treat account numbers, ID numbers, phone numbers, emails, and references as
  sensitive by default.

### AI Boundaries

- Assume no raw statement should reach an LLM unless explicitly approved.
- Prefer local AI integrations only, according to project architecture.
- Prompt construction must pass through a privacy/redaction boundary.

---

## Dependency Management Rules

- Prefer the smallest viable dependency set.
- Do not add new packages without clear justification.
- Prefer well-maintained, widely used packages.
- Avoid introducing overlapping libraries for the same purpose.
- If adding a package, update documentation and explain why it is needed.

---

## Markdown and Documentation Rules

All Markdown must pass markdownlint.

### Required Tooling

Use:

- `markdownlint-cli`
- rules compatible with `DavidAnson/markdownlint`

### Markdown Requirements

- Use ATX headings (`#`, `##`, etc.)
- Use consistent ordered/unordered list formatting
- No trailing spaces
- Fenced code blocks must include a language where possible
- Line length should follow repo markdownlint configuration
- Blank lines around headings/lists/code blocks as required by lint rules

Agents modifying Markdown must ensure the result passes linting before completion.

---

## Formatting and Linting Rules

Before considering work complete, agents must run relevant formatting and linting tools.

### .NET

Run:

```bash
dotnet format
dotnet build
dotnet test
