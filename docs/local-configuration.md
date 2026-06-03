# Local Configuration and Secrets

LFAS keeps committed configuration safe by separating non-secret defaults from
developer-specific values.

## Committed Configuration

The following files may be committed:

- `appsettings.json` for non-secret defaults.
- `appsettings.Development.json` for development-safe defaults.
- `.env.example` for documented placeholder values.

Do not commit real credentials, connection strings, API keys, bank data paths,
or production settings.

## Ignored Local Files

The repository ignores these local override files:

- `.env`
- `.env.*`
- `appsettings.Local.json`
- `appsettings.*.Local.json`
- `appsettings.Production.json`
- `secrets.json`

Use those only for local experimentation. Prefer .NET user secrets for
application secrets.

## User Secrets

The API, Web, and AppHost projects are configured with stable user-secrets IDs:

- `src/LFAS.Api` uses `lfas-api`.
- `src/LFAS.Web` uses `lfas-web`.
- `src/LFAS.AppHost` uses `lfas-apphost`.

Set local secrets from the repository root:

```bash
dotnet user-secrets set "ConnectionStrings:lfasdb" "Host=localhost;Port=5432;Database=lfas;Username=lfas;Password=replace-me" --project src/LFAS.Api
dotnet user-secrets set "LFAS:AI:OllamaBaseUrl" "http://localhost:11434" --project src/LFAS.Api
```

PowerShell uses the same `dotnet` commands:

```powershell
dotnet user-secrets set "ConnectionStrings:lfasdb" "Host=localhost;Port=5432;Database=lfas;Username=lfas;Password=replace-me" --project src/LFAS.Api
dotnet user-secrets set "LFAS:AI:OllamaBaseUrl" "http://localhost:11434" --project src/LFAS.Api
```

List local secrets:

```bash
dotnet user-secrets list --project src/LFAS.Api
```

Remove a local secret:

```bash
dotnet user-secrets remove "ConnectionStrings:lfasdb" --project src/LFAS.Api
```

## Environment Variables

Environment variables override appsettings using double underscores:

```bash
ConnectionStrings__lfasdb="Host=localhost;Port=5432;Database=lfas;Username=lfas;Password=replace-me"
LFAS__Storage__RootPath="./storage"
LFAS__AI__OllamaBaseUrl="http://localhost:11434"
```

Use `.env.example` as a template only. Copy it to `.env` for local Docker or
shell workflows and replace placeholders there.

## Configuration Keys

| Key | Purpose | Secret |
| --- | --- | --- |
| `ConnectionStrings:lfasdb` | Local PostgreSQL connection string | Yes |
| `LFAS:Storage:RootPath` | Local document/storage root | No |
| `LFAS:Privacy:RetainRawStatements` | Whether raw statements may be retained | No |
| `LFAS:AI:Provider` | AI provider mode, currently `Local` | No |
| `LFAS:AI:OllamaBaseUrl` | Local Ollama endpoint | No |
| `LFAS:Api:BaseUrl` | Web app API endpoint | No |
