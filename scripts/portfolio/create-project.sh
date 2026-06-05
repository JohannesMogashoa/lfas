#!/usr/bin/env bash
set -euo pipefail

echo "Attempting GitHub Project v2 creation..."
echo "Note: GitHub Project automation can differ between user-owned and org-owned repos."
echo "This script creates a project and gives you the command output; adding items is best done after issues exist."

REPO_JSON="$(gh repo view --json owner,name,nameWithOwner)"
OWNER_LOGIN="$(echo "$REPO_JSON" | jq -r '.owner.login')"
REPO_NAME="$(echo "$REPO_JSON" | jq -r '.name')"
PROJECT_TITLE="LFAS Portfolio Kanban"

if gh project list --owner "$OWNER_LOGIN" --format json | jq -e --arg title "$PROJECT_TITLE" '.projects[]? | select(.title==$title)' >/dev/null; then
  echo "Project already exists: $PROJECT_TITLE"
else
  gh project create --owner "$OWNER_LOGIN" --title "$PROJECT_TITLE"
  echo "Created project: $PROJECT_TITLE"
fi

cat <<'EOF'

Recommended manual Project fields:
- Status: Backlog, Ready, In Progress, Blocked, Review, Testing, Done
- Release: MVP, MDP, V1
- Type: Epic, Feature, Story
- Priority: Critical, High, Medium, Low
- Area
- Estimate
- Parent Key

To add created issues to the project, use the issue map:
  cat .lfas/issue-map.json

EOF
