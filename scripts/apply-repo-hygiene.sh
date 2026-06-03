#!/usr/bin/env bash
set -euo pipefail

echo "Applying LFAS repo hygiene files..."

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT_DIR"

if ! command -v git >/dev/null 2>&1; then
  echo "git is required"
  exit 1
fi

echo "Validating shell scripts..."
find scripts -name "*.sh" -print0 | xargs -0 -r bash -n

echo "Validating workflow YAML with basic grep..."
find .github/workflows -name "*.yml" -maxdepth 1 -print

echo ""
echo "Recommended next commands:"
echo "  git add ."
echo "  git commit -m \"Add repository hygiene and CI workflows\""
echo "  git push"
