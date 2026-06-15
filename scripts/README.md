# Scripts

Repository automation lives under topic folders. Run scripts from the
repository root so relative paths resolve consistently.

## Development

- `development/setup-dev.sh` validates macOS and Linux prerequisites and can
  start the local PostgreSQL container.
- `development/setup-dev.ps1` provides the same developer bootstrap workflow
  for PowerShell.
- New workspace scaffolding should follow the PNPM/Turborepo structure in
  `apps/` and `packages/`.

## Maintenance

- `maintenance/apply-repo-hygiene.sh` validates local repository hygiene files
  and shell script syntax.

## Portfolio

- `portfolio/summarize-backlog.sh` summarizes the planning portfolio.
- `portfolio/bootstrap-github.sh` creates labels, milestones, and issues from
  `planning/portfolio`.
- `portfolio/sync-issue-content.sh` updates existing GitHub issue titles,
  bodies, milestones, and labels from `planning/portfolio`.
- `portfolio/sync-issue-relationships.sh` syncs native GitHub issue
  Relationships from `planning/portfolio/portfolio.json` and the generated
  `.lfas/issue-map.json`.

Validate content syncs before applying them:

```bash
./scripts/portfolio/sync-issue-content.sh --check
./scripts/portfolio/sync-issue-content.sh --dry-run
./scripts/portfolio/sync-issue-content.sh --apply
```

Validate relationship syncs before applying them:

```bash
./scripts/portfolio/sync-issue-relationships.sh --check
./scripts/portfolio/sync-issue-relationships.sh --dry-run
./scripts/portfolio/sync-issue-relationships.sh --apply
```

The content dry run lists the issue title, milestone, labels, and Markdown body
file that will be applied. The relationship dry run compares the local
relationship plan with remote GitHub sub-issues. Relationship apply creates
missing native sub-issue relationships; it does not remove extra remote
relationships.
