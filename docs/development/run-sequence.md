# Run Sequence

## 1. Install macOS prerequisites

```bash
brew install gh jq git
brew install --cask docker
brew install --cask dotnet-sdk
gh auth login
```

## 2. Create or clone your GitHub repo

```bash
gh repo create LFAS --private --clone
cd LFAS
```

## 3. Confirm the repo layout

The source-controlled planning and automation folders should look like:

```text
LFAS/
├── docs/
├── planning/
│   ├── backlog/
│   └── portfolio/
├── scripts/
│   ├── development/
│   ├── maintenance/
│   └── portfolio/
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

```bash
CREATE_PROJECT=true ./scripts/portfolio/bootstrap-github.sh
```

## 8. Optional: scaffold .NET solution

```bash
./scripts/development/scaffold-dotnet-solution.sh LFAS
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

## Execution Order

```text
MVP-01 Foundation
MVP-02 Statement Ingestion
MVP-03 PDF Extraction
MVP-04 Transaction Normalization
MVP-05 Validation and Privacy
MVP-06 Financial Engine
MVP-07 Categorization
MVP-08 Reporting

MDP-01 Questionnaire Engine
MDP-02 Scoring Engine
MDP-03 Recommendations
MDP-04 Financial Personas

V1-01 Identity and Access
V1-02 Multi-Tenancy
V1-03 Billing
V1-04 AI Platform
V1-05 Open Banking
V1-06 Predictive Analytics
V1-07 Fraud and Risk Detection
```
