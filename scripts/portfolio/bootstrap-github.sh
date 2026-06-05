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

if [[ "${CREATE_PROJECT:-false}" == "true" ]]; then
  "${SCRIPT_DIR}/create-project.sh"
else
  echo ""
  echo "Skipping GitHub Project creation."
  echo "To attempt GitHub Projects v2 creation too, run:"
  echo "  CREATE_PROJECT=true ./scripts/portfolio/bootstrap-github.sh"
fi

echo ""
echo "Bootstrap complete."
echo "Issue map written to: .lfas/issue-map.json"
echo ""
echo "Recommended next step:"
echo "  Open your GitHub repo Issues tab and create a Kanban Project with columns:"
echo "  Backlog, Ready, In Progress, Blocked, Review, Testing, Done"
