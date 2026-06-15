# LFAS

LFAS is a local-first **Local Financial Analysis System** built as a Next.js,
TypeScript, PNPM, and Turborepo monorepo. The workspace shape follows the
prototype in `/Users/johannesmogashoa/dev/sandbox/lfas`.

## Monorepo Shape

```text
apps/
  web/                       Next.js App Router application
packages/
  ui/                        Shared shadcn/ui-based component package
  bank-statement-parser/     Deterministic statement parsing package
  eslint-config/             Shared ESLint configuration
  typescript-config/         Shared TypeScript configuration
docs/
  architecture/              Architecture overview and diagrams
  adr/                       Architecture Decision Records
  development/               Developer bootstrap and workflow documentation
  planning/                  Roadmap, labels, and delivery definitions
  testing/                   Test conventions and commands
planning/
  backlog/                   Backlog source spreadsheets
  portfolio/                 GitHub issue, label, milestone, and release data
scripts/
  development/               Developer bootstrap scripts
  maintenance/               Repository maintenance scripts
  portfolio/                 GitHub portfolio automation
```

## Run Locally

Install dependencies and start the web app:

```bash
pnpm install
pnpm dev
```

The primary app is expected at `apps/web`. Shared UI components should be
imported from `@lfas/ui`, for example:

```tsx
import { Button } from "@lfas/ui/components/button";
```

## Development

Useful commands:

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

See [Architecture](docs/architecture/overview.md) for workspace boundaries.
See [Testing](docs/testing/unit-testing.md) for test conventions.
See [Planning](planning/README.md) for backlog and portfolio source data.
