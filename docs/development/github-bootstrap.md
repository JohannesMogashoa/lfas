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

After labels, milestones, and issues exist, validate and apply parent-child
relationships to GitHub's native Relationships field:

```bash
./scripts/portfolio/sync-issue-relationships.sh --check
./scripts/portfolio/sync-issue-relationships.sh --dry-run
./scripts/portfolio/sync-issue-relationships.sh --apply
```

The `--check` mode is local-only. The `--dry-run` mode reads the remote
sub-issue state and reports missing relationships without changing GitHub. The
`--apply` mode creates missing native sub-issue relationships by using
`planning/portfolio/portfolio.json` as the parent-child source of truth.

Remote sync requires an authenticated GitHub CLI session. Use
`gh auth login -h github.com` or set `GH_TOKEN`/`GITHUB_TOKEN` with issue
permissions before running `--dry-run` or `--apply`.

## GitHub Project V2

GitHub Projects are more restrictive from CLI than issues/labels/milestones.
The script includes `scripts/portfolio/create-project.sh`, but the most
reliable workflow is:

1. Run `./scripts/portfolio/bootstrap-github.sh`
2. Create a GitHub Project board in the UI
3. Add issues by filtering labels:
   - `release:mvp`
   - `release:mdp`
   - `release:v1`

## Recommended Views

- MVP Board
- MDP Board
- V1 Board
- By Area
- By Priority
- Blocked Items
