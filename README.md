# LFAS

LFAS is a local-first financial analysis system for turning bank statements into structured, privacy-aware financial data. It is being built as a TypeScript monorepo with a Next.js interface and deterministic packages for statement detection, extraction, normalization, validation, and privacy controls.

> **Current status:** the repository is focused on the ingestion and processing foundation. Bank-statement parsing and statement-processing primitives are implemented and tested; broader financial analysis, reporting, and recommendation features are later layers rather than capabilities claimed as complete today.

## What is implemented

The current codebase includes:

- bank-aware statement detection and parser registration;
- PDF text extraction support;
- deterministic parsing contracts and normalized statement output;
- monetary normalization and validation;
- idempotency utilities for repeatable processing;
- explicit processing states;
- privacy-focused transformation/redaction logic with dedicated tests;
- a Next.js 16 web application consuming the shared processing packages;
- a Convex dependency in the web application for application data/workflows;
- shared UI, domain, TypeScript, and ESLint packages.

## Why this project exists

Bank statements contain valuable financial information, but they are awkward inputs for software: layouts differ between banks, transaction descriptions are noisy, totals must reconcile, and the source material contains sensitive personal information.

LFAS treats statement ingestion as a deterministic engineering problem before adding AI. The goal is to create a trustworthy processing boundary where extracted data can be validated, normalized, minimized, and explained before downstream categorization or analysis depends on it.

## Engineering focus

- **Deterministic before probabilistic** — parsing, money handling, validation, and privacy rules live in normal code and tests.
- **Privacy by design** — sensitive statement data is handled through explicit privacy transformations instead of being casually passed downstream.
- **Idempotent processing** — repeated ingestion should not produce inconsistent financial state.
- **Bank-specific extensibility** — detection and parser registration provide a controlled way to support differing statement formats.
- **Package boundaries** — parsing, processing, domain logic, UI, and tooling are separate workspaces rather than one coupled application.

## Repository structure

```text
apps/
  web/                       Next.js 16 App Router application

packages/
  bank-statement-parser/     Bank detection, PDF extraction and parsers
  statement-processing/      Normalization, validation, privacy and states
  domain/                    Shared financial domain concepts
  ui/                        Shared UI components
  eslint-config/             Shared lint configuration
  typescript-config/         Shared TypeScript configuration

docs/
  architecture/              Architecture documentation
  adr/                       Architecture Decision Records
  testing/                   Test conventions and guidance
```

## Tech stack

| Area | Technology |
| --- | --- |
| Language | TypeScript |
| Web | Next.js 16 + React 19 |
| Monorepo | Turborepo + pnpm workspaces |
| Backend/data dependency | Convex |
| UI | Tailwind CSS + shared UI package |
| Tables | TanStack Table |
| Testing | Vitest |
| Tooling | ESLint + Prettier |

The repository requires Node.js 20+ and pins `pnpm@11.7.0`.

## Getting started

```bash
git clone https://github.com/JohannesMogashoa/lfas.git
cd lfas
corepack enable
pnpm install
pnpm dev
```

The primary web application lives in `apps/web`.

## Development commands

```bash
pnpm format
pnpm lint
pnpm typecheck
pnpm test
pnpm build
```

Use Turborepo filters for focused work:

```bash
pnpm turbo build --filter=@lfas/web
pnpm turbo test --filter=@lfas/bank-statement-parser
```

## Current processing pipeline

Conceptually, the implemented foundation is moving toward this flow:

```text
Bank statement PDF
      |
      v
PDF text extraction
      |
      v
Bank / format detection
      |
      v
Bank-specific parser
      |
      v
Normalized statement data
      |
      +--> validation / reconciliation
      +--> privacy transformation
      +--> idempotent processing state
      |
      v
Trusted input for later financial analysis
```

## Documentation

- [Architecture overview](docs/architecture/overview.md)
- [Architecture decisions](docs/adr/)
- [Testing guidance](docs/testing/unit-testing.md)
- [Contributing](CONTRIBUTING.md)

## Project direction

The next layers build on the ingestion foundation rather than bypassing it: financial categorization, reporting, questionnaires/assessment, recommendations, and selective AI assistance can consume the structured data once the underlying extraction and validation path is trustworthy.
