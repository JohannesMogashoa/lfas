# GitHub Bootstrap Notes

The bootstrap process creates:

1. Labels from `planning/portfolio/labels.json`
2. Milestones from `planning/portfolio/milestones.json`
3. Issues from `planning/portfolio/portfolio.json`
4. Native parent-child issue relationships after relationship sync is run
5. Dependency links in issue bodies where possible
6. `.lfas/issue-map.json` to remember created issue numbers

## Idempotency

The script will skip issues already listed in `.lfas/issue-map.json`.

If you want to recreate everything in a fresh repo, delete `.lfas/issue-map.json`.

## Relationship Sync

After editing local portfolio issue bodies, validate and apply content updates
to existing GitHub issues:

```bash
./scripts/portfolio/sync-issue-content.sh --check
./scripts/portfolio/sync-issue-content.sh --dry-run
./scripts/portfolio/sync-issue-content.sh --apply
```

After labels, milestones, and issues exist, validate and apply parent-child
relationships to GitHub's native Relationships field:

```bash
./scripts/portfolio/sync-issue-relationships.sh --check
./scripts/portfolio/sync-issue-relationships.sh --dry-run
./scripts/portfolio/sync-issue-relationships.sh --apply
```

The `--check` mode is local-only. For content sync, `--dry-run` lists the
planned title, body, milestone, and label updates. For relationship sync,
`--dry-run` reads the remote sub-issue state and reports missing relationships
without changing GitHub. The relationship `--apply` mode creates missing native
sub-issue relationships by using `planning/portfolio/portfolio.json` as the
parent-child source of truth.

Remote sync requires an authenticated GitHub CLI session. Use
`gh auth login -h github.com` or set `GH_TOKEN`/`GITHUB_TOKEN` with issue
permissions before running `--dry-run` or `--apply`.

## What This Does Not Do

This bootstrap flow does not create a GitHub Project board. If you want a
board, create one in the GitHub UI after labels, milestones, and issues are in
place.
