#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT_DIR="$(cd "${SCRIPT_DIR}/../.." && pwd)"

echo "LFAS GitHub Bootstrap"
echo "====================="
echo ""

if ! command -v gh >/dev/null 2>&1; then
  echo "ERROR: GitHub CLI (gh) is not installed."
  echo "Install on macOS: brew install gh"
  exit 1
fi

if ! command -v jq >/dev/null 2>&1; then
  echo "ERROR: jq is not installed."
  echo "Install on macOS: brew install jq"
  exit 1
fi

gh auth status >/dev/null

REPO="$(gh repo view --json nameWithOwner -q .nameWithOwner 2>/dev/null || true)"
if [[ -z "$REPO" ]]; then
  echo "ERROR: Run this script inside a cloned GitHub repository."
  echo "Example:"
  echo "  gh repo create LFAS --private --clone"
  echo "  cd LFAS"
  echo "  ./scripts/portfolio/bootstrap-github.sh"
  exit 1
fi

echo "Repository detected: $REPO"
echo ""

"${SCRIPT_DIR}/create-labels.sh"
"${SCRIPT_DIR}/create-milestones.sh"
"${SCRIPT_DIR}/create-issues.sh"

echo ""
echo "Bootstrap complete."
echo "Issue map written to: .lfas/issue-map.json"
