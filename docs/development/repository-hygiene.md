# GitHub Actions and Repository Hygiene

This documentation captures the repository hygiene and automation used by the
current PNPM/Turborepo workspace.

## Added files

```text
.gitignore
.editorconfig
.gitattributes
.env.example
.npmrc
package.json
pnpm-workspace.yaml
pnpm-lock.yaml
turbo.json
.markdownlint.yml
.github/workflows/*
.github/dependabot.yml
.github/release-drafter.yml
.github/ISSUE_TEMPLATE/*
.github/pull_request_template.md
scripts/maintenance/apply-repo-hygiene.sh
docs/development/configure-branch-protection.md
```

## Workflow purpose

| Workflow | Purpose |
| --- | --- |
| `ci.yml` | Install, lint, typecheck, test, and build the PNPM workspace |
| `pr-validation.yml` | Prevent private financial sample files, validate scripts/JSON/YAML |
| `codeql.yml` | Static security analysis for JavaScript and TypeScript |
| `dependency-review.yml` | Blocks high severity dependency changes |
| `markdown.yml` | Markdown linting |
| `release-drafter.yml` | Maintains draft release notes |

## Local execution

```bash
find scripts -name "*.sh" -exec chmod +x {} +
./scripts/maintenance/apply-repo-hygiene.sh
pnpm install
pnpm lint
pnpm typecheck
pnpm build
pnpm test
```

## Security rule

Never commit real bank statements or sensitive financial data. The `.gitignore`
intentionally blocks common local paths and file patterns for uploaded
statements and private samples.
