# Developer Bootstrap

LFAS includes one-command prerequisite checks for macOS, Linux, and Windows.
The checks validate the required local tooling and, by default, start the local
PostgreSQL container from `docker-compose.yml`.

## Prerequisites

- .NET SDK compatible with `global.json`
- Docker Desktop or Docker Engine with Compose v2
- GitHub CLI

## macOS and Linux

Run from the repository root:

```bash
./setup-dev.sh
```

To validate tools and Docker Compose without starting PostgreSQL:

```bash
./setup-dev.sh --skip-postgres
```

## Windows

Run from the repository root in PowerShell:

```powershell
.\setup-dev.ps1
```

To validate tools and Docker Compose without starting PostgreSQL:

```powershell
.\setup-dev.ps1 -SkipPostgres
```

If script execution is blocked on Windows, run this in the current PowerShell
session and retry:

```powershell
Set-ExecutionPolicy -Scope Process -ExecutionPolicy Bypass
```

## What Gets Checked

- `dotnet` is installed and can run in this repository.
- `docker` is installed and the Docker daemon is running.
- Docker Compose v2 is available.
- `gh` is installed, with authentication reported when available.
- `docker-compose.yml` is valid.
- The `lfas-postgres` container can start and become healthy.
