#!/usr/bin/env bash
set -euo pipefail

echo "Checking macOS development prerequisites..."

check() {
  if command -v "$1" >/dev/null 2>&1; then
    echo "OK: $1"
  else
    echo "MISSING: $1"
  fi
}

check brew
check gh
check jq
check git
check dotnet
check docker

echo ""
echo "Install missing basics:"
echo "  brew install gh jq git"
echo "  brew install --cask docker"
echo "  brew install --cask dotnet-sdk"
echo ""
echo "Authenticate GitHub:"
echo "  gh auth login"
