# GitHub Actions and Repository Hygiene

This package adds the repository hygiene needed for LFAS foundation work.

## Added files

```text
.gitignore
.editorconfig
.gitattributes
.env.example
global.json
NuGet.config
docker-compose.yml
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
| `ci.yml` | Restore, build, test, upload test/coverage artifacts |
| `pr-validation.yml` | Prevent private financial sample files, validate scripts/JSON/YAML |
| `codeql.yml` | Static security analysis for C# |
| `dependency-review.yml` | Blocks high severity dependency changes |
| `docker-validate.yml` | Validates Docker Compose and PostgreSQL startup |
| `markdown.yml` | Markdown linting |
| `release-drafter.yml` | Maintains draft release notes |

## Local execution

```bash
find scripts -name "*.sh" -exec chmod +x {} +
./scripts/maintenance/apply-repo-hygiene.sh
docker compose config
docker compose up -d postgres
dotnet restore
dotnet build
dotnet test
```

## Security rule

Never commit real bank statements or sensitive financial data. The `.gitignore`
intentionally blocks common local paths and file patterns for uploaded
statements and private samples.
