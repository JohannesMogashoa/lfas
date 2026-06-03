# LFAS GitHub Automation Kit

This kit bootstraps the GitHub backlog for **LFAS — Local Financial Analysis System**.

It is structured as:

```text
MVP  -> Statement Intelligence
MDP  -> Financial Decision Platform
V1   -> Commercial SaaS Platform
```

## Contents

- `scripts/bootstrap.sh` — one-command GitHub bootstrap for macOS/Linux.
- `portfolio/portfolio.json` — authoritative backlog data.
- `portfolio/issues/**` — generated Markdown issue bodies.
- `backlog/LFAS_Backlog.csv` — importable backlog.
- `backlog/LFAS_Backlog.xlsx` — reviewable backlog workbook.
- `.github/ISSUE_TEMPLATE/**` — GitHub issue templates.
- `.github/workflows/ci.yml` — starter CI workflow.
- `docs/**` — roadmap, architecture, execution order, ADRs.

## Backlog Size

- Total items: **234**
- Epics: **19**
- Features: **46**
- Stories: **169**

## Start Here

Read:

1. `docs/00-RUN-SEQUENCE.md`
2. `docs/01-PORTFOLIO-ROADMAP.md`
3. `docs/02-GITHUB-BOOTSTRAP.md`

Then execute:

```bash
chmod +x scripts/*.sh
./scripts/setup-dev.sh
./scripts/dry-run.sh
./scripts/bootstrap.sh
```
