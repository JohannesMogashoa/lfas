#!/usr/bin/env bash
set -euo pipefail
ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
REPO="$(gh repo view --json nameWithOwner -q .nameWithOwner)"

echo "Creating milestones..."

jq -c '.[]' "$ROOT_DIR/portfolio/milestones.json" | while read -r milestone; do
  title="$(echo "$milestone" | jq -r '.title')"
  description="$(echo "$milestone" | jq -r '.description')"

  existing="$(gh api "repos/${REPO}/milestones?state=all" --paginate | jq -r --arg title "$title" '.[] | select(.title==$title) | .number' | head -n1 || true)"
  if [[ -n "$existing" ]]; then
    gh api -X PATCH "repos/${REPO}/milestones/${existing}" -f title="$title" -f description="$description" >/dev/null
    echo "updated milestone: $title"
  else
    gh api -X POST "repos/${REPO}/milestones" -f title="$title" -f description="$description" >/dev/null
    echo "created milestone: $title"
  fi
done
