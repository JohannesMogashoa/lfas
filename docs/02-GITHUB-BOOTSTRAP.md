# GitHub Bootstrap Notes

The bootstrap process creates:

1. Labels from `portfolio/labels.json`
2. Milestones from `portfolio/milestones.json`
3. Issues from `portfolio/portfolio.json`
4. Parent links in issue bodies where possible
5. Dependency links in issue bodies where possible
6. `.lfas/issue-map.json` to remember created issue numbers

## Idempotency

The script will skip issues already listed in `.lfas/issue-map.json`.

If you want to recreate everything in a fresh repo, delete `.lfas/issue-map.json`.

## GitHub Project V2

GitHub Projects are more restrictive from CLI than issues/labels/milestones. The script includes `create-project.sh`, but the most reliable workflow is:

1. Run `./scripts/bootstrap.sh`
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
