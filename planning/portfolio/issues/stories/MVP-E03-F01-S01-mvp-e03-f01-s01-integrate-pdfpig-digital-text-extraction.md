# Story: Integrate PdfPig digital text extraction

## Parent

- Epic: MVP-E03 — PDF Extraction
- Feature: MVP-E03-F01 — Digital PDF Extraction

## Release / Milestone

MVP

## User Story

As a product builder of LFAS, I want `Integrate PdfPig digital text extraction` so that the system can progress toward trusted, private financial analysis.

## Acceptance Criteria

- [ ] Digital PDFs produce page text
- [ ] Page numbers preserved

## Implementation Tasks

- [ ] Install package
- [ ] PDF reader service
- [ ] Extract pages
- [ ] Extract words with coordinates

## Engineering Notes

- Prefer deterministic business rules before AI.
- Keep raw bank statement data isolated behind storage and privacy boundaries.
- Add tests for parsing, validation, scoring, or security behavior where applicable.
- Update documentation when behavior or contracts are introduced.

## Dependencies

None

## Suggested Labels

release:mvp, type:story, area:parser, priority:high
