# Run Sequence

## 1. Install macOS prerequisites

```bash
brew install gh jq git
brew install node pnpm
brew install --cask docker
gh auth login
```

## 2. Create or clone your GitHub repo

```bash
gh repo create LFAS --private --clone
cd LFAS
```

## 3. Confirm the repo layout

The source-controlled workspace should look like:

```text
LFAS/
├── apps/
├── packages/
├── docs/
├── planning/
│   ├── backlog/
│   └── portfolio/
├── scripts/
└── .github/
```

## 4. Make scripts executable

```bash
find scripts -name "*.sh" -exec chmod +x {} +
```

## 5. Validate generated backlog

```bash
./scripts/portfolio/summarize-backlog.sh
```

## 6. Bootstrap GitHub labels, milestones, and issues

```bash
./scripts/portfolio/bootstrap-github.sh
```

## 7. Optional: create GitHub Project too

This step has been removed. If you want a GitHub Project board, create it in
the GitHub UI after bootstrap.

## 8. Optional: validate the Node.js workspace

```bash
pnpm install
pnpm lint
pnpm typecheck
pnpm test
pnpm build
```

## 9. Commit the kit

```bash
git add .
git commit -m "Bootstrap LFAS portfolio backlog"
git push
```

## Recommended Kanban Columns

```text
Backlog
Ready
In Progress
Blocked
Review
Testing
Done
```

## Workspace Notes

Use `pnpm lint`, `pnpm typecheck`, `pnpm test`, and `pnpm build` from the
repository root during normal development. Prefer Turborepo filters for
focused work when iterating on a single package or app.
