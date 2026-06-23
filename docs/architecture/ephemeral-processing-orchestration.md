# Ephemeral Processing Orchestration

## Purpose

Ephemeral processing lets the system accept a bank statement, extract
transactions, validate the result, and create a report-ready processing record
without storing the original statement file or raw extracted statement text.

## Repo Structure

- `packages/bank-statement-parser` owns PDF parsing and bank-specific extraction.
- `packages/statement-processing` owns source-safe workflow types, state
  transitions, idempotency, and normalization helpers.
- `apps/web/actions/statement-upload.ts` is the temporary source boundary. It
  reads the uploaded file, computes a keyed fingerprint, parses the statement,
  sends only sanitized records to Convex, and then drops the in-memory source.
- `apps/web/convex` stores durable processing state, audit events, sanitized
  transactions, and report metadata.

## Processing States

The statement processing state machine is:

```text
intake_received
extracting
normalized
validated
source_disposed
report_ready
failed
```

`report_ready` is only reachable after `source_disposed`. This keeps source-file
disposal as an explicit successful milestone instead of an implied cleanup step.

## Durable Data

Convex tables are intentionally source-safe:

- `statementSubmissions` stores user scope, correlation ID, HMAC source
  fingerprint, idempotency key, file size, MIME type, and current state.
- `statementJobs` stores attempts, current step, milestone timestamps, and safe
  failure metadata.
- `statementEvents` stores state transitions and safe counters.
- `statementTransactions` stores normalized structured transactions.
- Validation completion events store only validation report summaries: outcome,
  finding count, warning count, failure count, and transaction count. Detailed
  findings must remain bounded to stable validation codes, counts, dates,
  minor-unit deltas, and source line references.
- Privacy and redaction boundaries store only detector categories, counts, safe
  offsets, masked text, and secret-backed local tokens. Public privacy contracts
  must not return original account numbers, card numbers, identity numbers,
  emails, phone numbers, or raw statement text.
- `statementReports` stores report metadata and optional generated report
  storage IDs.
- `statementAuditEvents` stores upload acceptance and source disposal audit
  events.

## Privacy Boundary

The following must not be stored in Convex jobs, events, queues, logs, browser
storage, or analytics:

- Raw PDF bytes.
- Raw extracted PDF text.
- Account numbers or statement headers.
- Unredacted identity, contact, or reference values.

The browser only initiates uploads and receives display data. It is not trusted
to strip, redact, or normalize statement content.

## AI Boundary

AI prompt construction must use the sanitized statement contract from
`packages/statement-processing`. The contract contains approved transaction
fields, validation summaries, and redaction metadata only. Future AI
orchestration must inspect prompt candidates before model invocation and block
unsafe prompts with safe failure codes and detector counts rather than logging
prompt text.

## Convex Setup

The backend source lives in `apps/web/convex`. To connect it to a real Convex
deployment, run:

```bash
pnpm --filter @lfas/web exec convex dev
```

Then set the web runtime environment values:

```bash
CONVEX_URL=<deployment-url>
NEXT_PUBLIC_CONVEX_URL=<deployment-url>
STATEMENT_FINGERPRINT_SECRET=<long-random-secret>
```

`STATEMENT_FINGERPRINT_SECRET` is required in production. It prevents source
fingerprints from becoming plain hashes that can be compared across systems.
