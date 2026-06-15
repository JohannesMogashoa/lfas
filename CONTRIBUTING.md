# Contributing

LFAS is organized as a PNPM and Turborepo workspace.

## Before You Start

Install dependencies at the repository root:

```bash
pnpm install
```

## Local Development

Run the workspace locally:

```bash
pnpm dev
```

Useful validation commands:

```bash
pnpm format
pnpm lint
pnpm typecheck
pnpm test
pnpm build
```

Use Turborepo filters when working on a single package or app:

```bash
pnpm turbo build --filter=@lfas/web
pnpm turbo test --filter=@lfas/bank-statement-parser
```

## Repository Layout

```text
apps/
packages/
docs/
```

## Notes

- Keep financial logic deterministic and framework-independent.
- Keep route handlers and UI thin.
- Avoid committing private statements or sensitive financial data.
