# ADR-0003: Use a Local-first AI Boundary

## Status

Accepted

## Context

LFAS may use AI to assist with categorization, explanations, recommendations,
and narrative reporting. The source material includes bank statements and other
financial records that can contain account numbers, card numbers, names,
addresses, employers, merchants, references, and behavioral financial patterns.

The product goal is trusted, private financial analysis. AI must therefore be
bounded by privacy controls, deterministic preprocessing, and clear data
contracts.

## Decision

Adopt a local-first AI boundary.

AI integrations must consume only sanitized financial summaries, derived
metrics, or redacted transaction data. Raw bank statements, original uploads,
and direct PII must not be sent to external LLMs.

Local models and local processing are preferred where AI is needed. Any future
external AI provider integration requires an explicit ADR that documents data
classification, redaction guarantees, retention behavior, provider controls,
and user consent requirements.

## Consequences

- AI features depend on deterministic extraction, validation, redaction, and
  summarization steps before prompts are built.
- Prompt contracts must be inspectable and testable.
- Some AI features may be slower or less capable until local model support is
  mature enough.
- Privacy and audit requirements shape the AI architecture from the start.

## Implementation Guidance

- Keep AI adapters and model clients outside the domain layer.
- Build prompts from sanitized contracts rather than raw entities or files.
- Store enough prompt/audit metadata to explain what data class was used.
- Prefer deterministic rules before asking AI to classify, explain, or
  recommend.
