# Story: Detect password-protected or image-only PDFs

## Parent
- Epic: MVP-E03 — PDF Extraction
- Feature: MVP-E03-F01 — Digital PDF Extraction

## Release / Milestone
MVP

## User Story
As a product builder of LFAS, I want `Detect password-protected or image-only PDFs` so that the system can progress toward trusted, private financial analysis.

## Acceptance Criteria
- [ ] System routes scanned PDFs to OCR

## Implementation Tasks
- [ ] PDF metadata inspection
- [ ] Text density check
- [ ] Image-only detection

## Engineering Notes
- Prefer deterministic business rules before AI.
- Keep raw bank statement data isolated behind storage and privacy boundaries.
- Add tests for parsing, validation, scoring, or security behavior where applicable.
- Update documentation when behavior or contracts are introduced.

## Dependencies
None

## Suggested Labels
release:mvp, type:story, area:parser, priority:high
