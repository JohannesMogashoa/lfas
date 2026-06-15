# Testing

LFAS uses the PNPM/Turborepo test pipeline for workspace tests. The intended
stack is Vitest for fast unit tests, Testing Library for React component tests,
and Playwright for critical browser workflows.

## Unit Test Naming

Use business-readable names that describe the subject, scenario, and expected
outcome.

- Test files use `{subject}.test.ts` or `{subject}.test.tsx`.
- Test names describe observable business behavior.
- Names must be deterministic and privacy-safe.
- Avoid raw statement data, account numbers, identity numbers, phone numbers,
  emails, or references in test names.

## Running Tests

Run the full suite from the repository root:

```bash
pnpm test
```

Run focused tests through Turborepo filters:

```bash
pnpm turbo test --filter=@lfas/bank-statement-parser
pnpm turbo test --filter=@lfas/web
```

## Coverage Expectations

All non-trivial parsing, validation, scoring, privacy, and financial calculation
logic needs deterministic unit coverage. Upload flows, route handlers, and
critical UI paths need integration or Playwright coverage once those workflows
exist.
