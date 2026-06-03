[CmdletBinding()]
param(
    [switch]$SkipPostgres
)

$ErrorActionPreference = "Stop"
$RootDir = Resolve-Path (Join-Path $PSScriptRoot "..")
$ComposeFile = Join-Path $RootDir "docker-compose.yml"

function Write-Pass {
    param([string]$Message)
    Write-Host "[OK] $Message"
}

function Write-Warn {
    param([string]$Message)
    Write-Host "[WARN] $Message"
}

function Stop-Fail {
    param([string]$Message)
    Write-Error "[FAIL] $Message"
    exit 1
}

function Require-Command {
    param(
        [string]$CommandName,
        [string]$InstallHint
    )

    if (Get-Command $CommandName -ErrorAction SilentlyContinue) {
        Write-Pass "$CommandName is installed"
    }
    else {
        Stop-Fail "$CommandName is missing. $InstallHint"
    }
}

function Wait-Postgres {
    $containerName = "lfas-postgres"
    $maxAttempts = 30

    for ($attempt = 1; $attempt -le $maxAttempts; $attempt++) {
        $healthStatus = docker inspect --format "{{if .State.Health}}{{.State.Health.Status}}{{else}}{{.State.Status}}{{end}}" $containerName 2>$null

        if ($LASTEXITCODE -ne 0) {
            $healthStatus = ""
        }

        if ($healthStatus -eq "healthy") {
            Write-Pass "PostgreSQL container is healthy"
            return
        }

        if ($healthStatus -eq "exited" -or $healthStatus -eq "dead") {
            docker compose -f $ComposeFile logs postgres
            Stop-Fail "PostgreSQL container stopped before becoming healthy"
        }

        Write-Host "Waiting for PostgreSQL container healthcheck ($attempt/$maxAttempts)..."
        Start-Sleep -Seconds 2
    }

    docker compose -f $ComposeFile ps postgres
    Stop-Fail "PostgreSQL container did not become healthy in time"
}

Write-Host "Validating LFAS developer prerequisites..."
Write-Host "Repository: $RootDir"
Write-Host ""

Require-Command "dotnet" "Install the .NET SDK from https://dotnet.microsoft.com/download."
Require-Command "docker" "Install Docker Desktop from https://www.docker.com/products/docker-desktop/."
Require-Command "gh" "Install GitHub CLI from https://cli.github.com/."

dotnet --version | Out-Null
Write-Pass ".NET SDK can run in this repository"

gh auth status *> $null
if ($LASTEXITCODE -eq 0) {
    Write-Pass "GitHub CLI is authenticated"
}
else {
    Write-Warn "GitHub CLI is installed but not authenticated. Run: gh auth login"
}

docker info *> $null
if ($LASTEXITCODE -ne 0) {
    Stop-Fail "Docker is installed but the Docker daemon is not running"
}
Write-Pass "Docker daemon is running"

docker compose version *> $null
if ($LASTEXITCODE -ne 0) {
    Stop-Fail "Docker Compose v2 is required. Install or update Docker Desktop."
}
Write-Pass "Docker Compose v2 is available"

docker compose -f $ComposeFile config --quiet
if ($LASTEXITCODE -ne 0) {
    Stop-Fail "docker-compose.yml is invalid"
}
Write-Pass "docker-compose.yml is valid"

if ($SkipPostgres) {
    Write-Pass "PostgreSQL container startup skipped"
}
else {
    docker compose -f $ComposeFile up -d postgres
    if ($LASTEXITCODE -ne 0) {
        Stop-Fail "Could not start PostgreSQL container"
    }

    Wait-Postgres
}

Write-Host ""
Write-Host "Developer bootstrap validation complete."
