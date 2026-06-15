# AGENTS.md

<!-- BEGIN:nextjs-agent-rules -->
## This is NOT the Next.js you know

This version has breaking changes. APIs, conventions, and file structure may
differ from training data. Read the relevant guide in
`node_modules/next/dist/docs/` before writing Next.js code. Heed deprecation
notices.
<!-- END:nextjs-agent-rules -->

## Purpose

This repository contains a local-first financial analysis system built as a
Node.js, TypeScript, Next.js monorepo with PNPM workspaces and Turborepo. All
automated agents, coding assistants, and AI-generated contributions must follow
the rules in this document.

The primary goal of the system is to deliver business capabilities, not
disconnected technical components. Work must align to outcomes such as:

- user uploads statement
- system extracts transactions
- system validates statement
- system calculates financial position
- system generates recommendations

Do not optimize for novelty. Optimize for correctness, maintainability,
traceability, privacy, and testability.

---

## Core Engineering Principles

1. Organize work by business capability slices.
2. Keep financial domain logic framework-independent and deterministic.
3. Keep Next.js routes, pages, and server actions thin.
4. Use PNPM workspace packages for reusable product capabilities.
5. Keep shared packages small, stable, and dependency-conscious.
6. Infrastructure adapters must be replaceable.
7. Code must be production-quality, not illustrative unless explicitly requested.
8. All non-trivial behavior must be covered by tests.
9. Financial calculations must be precise and explicit.
10. Privacy and PII boundaries are mandatory.

---

## Monorepo Structure

Expected top-level structure:

- `apps/web`
- `packages/ui`
- `packages/bank-statement-parser`
- `packages/eslint-config`
- `packages/typescript-config`
- `docs`
- `planning`
- `scripts`

Future packages are allowed only when they represent a stable shared capability,
for example:

- `packages/domain`
- `packages/application`
- `packages/storage`
- `packages/reporting`
- `packages/ai`
- `packages/test-utils`

Agents must place code in the smallest appropriate workspace and must not create
new packages merely to mirror technical layers.

---

## Architecture Rules

### Dependency Direction

Dependencies must point from applications toward reusable packages:

- `apps/web` may depend on product packages and `packages/ui`.
- `packages/ui` must not depend on `apps/web`.
- `packages/bank-statement-parser` must not depend on Next.js or React.
- Domain and financial packages must not depend on UI, route handlers, storage
  adapters, logging implementations, or external AI clients.
- Infrastructure adapters may depend on domain/application contracts, but those
  contracts must not depend on infrastructure adapters.
- Shared configuration packages may be consumed by all workspaces.

Do not introduce circular workspace dependencies.

### Next.js Rules

- Use the App Router in `apps/web/app`.
- Prefer Server Components by default.
- Add `"use client"` only for interactive browser state, effects, or browser-only
  APIs.
- Keep route handlers and server actions thin; delegate business rules to
  workspace packages.
- Validate all request and form inputs at the boundary.
- Do not expose internal domain objects directly from API responses.
- Do not read raw statement data in Client Components.

### Package Rules

- Put reusable UI primitives in `packages/ui`.
- Put statement parsing, normalization, and deterministic extraction rules in
  `packages/bank-statement-parser` unless a narrower package already exists.
- Put shared ESLint rules in `packages/eslint-config`.
- Put shared TypeScript configs in `packages/typescript-config`.
- Keep package entry points explicit and stable.
- Use workspace protocol dependencies where appropriate.

### Domain Rules

Domain code must not depend on:

- Next.js
- React
- browser APIs
- file system APIs
- HTTP clients
- database clients or ORMs
- logging frameworks
- serializer-specific behavior unless explicitly approved

Domain entities and value objects must model business rules, invariants, and
behavior.

---

## TypeScript Coding Standards

### Language and Runtime

- Use the current approved Node.js and PNPM versions for this repo.
- Use TypeScript for production code.
- Keep `strict` TypeScript enabled.
- Prefer ESM unless an existing tool requires otherwise.
- Treat type errors and lint errors as build blockers.

### Type Design

- Prefer explicit domain types over naked primitives where business meaning
  matters.
- Prefer immutable values and readonly object shapes by default.
- Use discriminated unions for state machines and result variants.
- Avoid `any`; use `unknown` at boundaries and narrow intentionally.
- Keep Zod or equivalent schemas at system boundaries, not buried inside pure
  domain logic unless schema validation is the boundary contract.

### Naming

- Use clear, descriptive names.
- Use `PascalCase` for types and React components.
- Use `camelCase` for variables, functions, and object members.
- Prefix interfaces with `I` only when that convention already exists locally.
- Avoid abbreviations unless standard and unambiguous.

### Async

- Use async/await correctly.
- Do not block the event loop with heavy parsing or OCR work inside request paths.
- Pass `AbortSignal` where supported for I/O and long-running workflows.
- Suffix asynchronous functions with `Async` only when it improves clarity or
  matches local convention.

### Comments

- Write self-explanatory code first.
- Add comments only where they provide intent, rationale, or domain context.
- Do not add redundant comments that restate the code.

---

## Financial Domain Rules

This is a financial system. Accuracy is mandatory.

### Money

- Never use binary floating point arithmetic for monetary calculations.
- Use integer minor units, a decimal library, or a dedicated `Money` value object.
- Never pass naked monetary amounts where `Money` should be used.
- Do not mix currencies silently.
- Enforce currency matching in arithmetic operations.

### Dates and Periods

- Use date-only representations where time-of-day is irrelevant.
- Use explicit UTC timestamps for events crossing system boundaries.
- Use a `DateRange` value object for periods instead of unrelated start/end
  values.
- Be explicit about timezone behavior.

### Rounding

- Be explicit about rounding rules.
- Do not rely on implicit JavaScript or database defaults for financial rounding.
- Document rounding intent in code when non-obvious.

---

## API and Persistence Rules

- Next.js route handlers must remain thin.
- No business logic in route handlers or React components.
- Validate inputs at the boundary.
- Return appropriate HTTP status codes and consistent error payloads.
- Include correlation ID propagation where implemented.
- Keep persistence concerns out of the domain model.
- Be explicit about decimal precision and storage format.
- Always define indexes and constraints intentionally.
- Review generated migrations before committing them.

---

## Testing Rules

All non-trivial logic requires tests.

### Unit Tests

Unit tests must cover:

- value object invariants
- domain behavior
- financial calculations
- parsing rules
- validation rules
- state transitions
- edge cases and boundary conditions

### Integration and E2E Tests

Integration and E2E tests must cover:

- database persistence mappings
- route handler request/response behavior
- file upload workflows
- parser integration
- end-to-end statement processing paths where feasible
- critical user workflows in `apps/web`

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
- Never log raw sensitive financial or PII data unless explicitly approved for a
  secure local-only scenario and clearly justified.
- Log intent and outcomes, not noise.

---

## Privacy and Security Rules

This system processes highly sensitive financial data.

### Mandatory Rules

- Do not send raw statement data to external services.
- Do not expose PII in logs, client components, browser storage, analytics, or
  telemetry.
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

- Use PNPM as the only package manager.
- Prefer the smallest viable dependency set.
- Do not add new packages without clear justification.
- Prefer well-maintained, widely used packages.
- Avoid introducing overlapping libraries for the same purpose.
- If adding a package, update documentation and explain why it is needed.
- Commit `pnpm-lock.yaml` when dependency changes are made.

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

Agents modifying Markdown must ensure the result passes linting before
completion.

---

## Formatting and Linting Rules

Before considering work complete, agents must run relevant formatting and
linting tools.

### Node.js / TypeScript

Run:

```bash
pnpm install --frozen-lockfile
pnpm format
pnpm lint
pnpm typecheck
pnpm test
pnpm build
```
