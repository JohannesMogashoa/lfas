# Portfolio

This directory contains the GitHub portfolio source data used to create and
sync LFAS backlog issues.

## Files

- `portfolio.json` is the canonical issue model.
- `labels.json` defines GitHub labels.
- `milestones.json` defines GitHub milestones.
- `releases/` contains release-specific planning views.
- `issues/` contains Markdown issue bodies grouped by epic, feature, and story.

Run `scripts/portfolio/summarize-backlog.sh` from the repository root to inspect
the model before creating or syncing GitHub issues.
