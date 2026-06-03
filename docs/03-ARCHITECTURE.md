# Architecture

## Clean Architecture Projects

```text
src/
├── LFAS.Domain
├── LFAS.Application
├── LFAS.Infrastructure
├── LFAS.Api
├── LFAS.StatementParser
├── LFAS.Reporting
├── LFAS.AI
└── LFAS.SharedKernel

tests/
├── LFAS.UnitTests
└── LFAS.IntegrationTests
```

## Dependency Direction

```text
Api → Application → Domain → SharedKernel
Infrastructure → Application
StatementParser → Application
Reporting → Application
AI → Application
```

## Product Boundaries

- Statement ingestion
- Extraction
- Normalization
- Validation
- Privacy
- Financial engine
- Categorization
- Reporting
- Questionnaire
- Scoring
- Recommendations
- AI
- Commercial platform
