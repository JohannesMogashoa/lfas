#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
COMPOSE_FILE="$ROOT_DIR/docker-compose.yml"
START_POSTGRES=true

usage() {
  cat <<'USAGE'
Usage: scripts/development/setup-dev.sh [--skip-postgres]

Validates LFAS developer prerequisites on macOS and Linux.

Options:
  --skip-postgres   Check Docker and Compose, but do not start PostgreSQL.
  -h, --help        Show this help text.
USAGE
}

while [[ $# -gt 0 ]]; do
  case "$1" in
    --skip-postgres)
      START_POSTGRES=false
      shift
      ;;
    -h|--help)
      usage
      exit 0
      ;;
    *)
      echo "Unknown option: $1" >&2
      usage
      exit 2
      ;;
  esac
done

pass() {
  echo "[OK] $1"
}

fail() {
  echo "[FAIL] $1" >&2
  exit 1
}

warn() {
  echo "[WARN] $1"
}

require_command() {
  local command_name="$1"
  local install_hint="$2"

  if command -v "$command_name" >/dev/null 2>&1; then
    pass "$command_name is installed"
  else
    fail "$command_name is missing. $install_hint"
  fi
}

wait_for_postgres() {
  local container_name="lfas-postgres"
  local max_attempts=30

  for attempt in $(seq 1 "$max_attempts"); do
    local health_status
    health_status="$(docker inspect --format '{{if .State.Health}}{{.State.Health.Status}}{{else}}{{.State.Status}}{{end}}' "$container_name" 2>/dev/null || true)"

    if [[ "$health_status" == "healthy" ]]; then
      pass "PostgreSQL container is healthy"
      return 0
    fi

    if [[ "$health_status" == "exited" || "$health_status" == "dead" ]]; then
      docker compose -f "$COMPOSE_FILE" logs postgres
      fail "PostgreSQL container stopped before becoming healthy"
    fi

    echo "Waiting for PostgreSQL container healthcheck ($attempt/$max_attempts)..."
    sleep 2
  done

  docker compose -f "$COMPOSE_FILE" ps postgres
  fail "PostgreSQL container did not become healthy in time"
}

echo "Validating LFAS developer prerequisites..."
echo "Repository: $ROOT_DIR"
echo ""

require_command "dotnet" "Install the .NET SDK from https://dotnet.microsoft.com/download."
require_command "docker" "Install Docker Desktop from https://www.docker.com/products/docker-desktop/."
require_command "gh" "Install GitHub CLI from https://cli.github.com/."

dotnet --version >/dev/null
pass ".NET SDK can run in this repository"

if gh auth status >/dev/null 2>&1; then
  pass "GitHub CLI is authenticated"
else
  warn "GitHub CLI is installed but not authenticated. Run: gh auth login"
fi

docker info >/dev/null 2>&1 || fail "Docker is installed but the Docker daemon is not running"
pass "Docker daemon is running"

docker compose version >/dev/null 2>&1 || fail "Docker Compose v2 is required. Install or update Docker Desktop."
pass "Docker Compose v2 is available"

docker compose -f "$COMPOSE_FILE" config --quiet
pass "docker-compose.yml is valid"

if [[ "$START_POSTGRES" == true ]]; then
  docker compose -f "$COMPOSE_FILE" up -d postgres
  wait_for_postgres
else
  pass "PostgreSQL container startup skipped"
fi

echo ""
echo "Developer bootstrap validation complete."
