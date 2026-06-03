# ADR-0003: Use Local-first AI Boundary

## Status
Accepted

## Decision
AI integrations must consume sanitized financial summaries or redacted transaction data only. Raw statements and PII must not be sent to LLMs.
