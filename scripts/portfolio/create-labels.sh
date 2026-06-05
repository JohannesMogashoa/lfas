#!/usr/bin/env bash
set -euo pipefail
ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
LABELS_FILE="$ROOT_DIR/planning/portfolio/labels.json"

echo "Creating/updating labels..."

jq -c '.[]' "$LABELS_FILE" | while read -r label; do
  name="$(echo "$label" | jq -r '.name')"
  color="$(echo "$label" | jq -r '.color')"
  description="$(echo "$label" | jq -r '.description')"

  if gh label list --limit 1000 | awk -F'\t' '{print $1}' | grep -Fxq "$name"; then
    gh label edit "$name" --color "$color" --description "$description" >/dev/null
    echo "updated label: $name"
  else
    gh label create "$name" --color "$color" --description "$description" >/dev/null
    echo "created label: $name"
  fi
done
