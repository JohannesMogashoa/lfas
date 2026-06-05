#!/usr/bin/env bash
set -euo pipefail
ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
PLANNING_DIR="$ROOT_DIR/planning"
PORTFOLIO_FILE="$PLANNING_DIR/portfolio/portfolio.json"

mkdir -p "$ROOT_DIR/.lfas"
MAP_FILE="$ROOT_DIR/.lfas/issue-map.json"
TMP_FILE="$ROOT_DIR/.lfas/issue-map.tmp.json"

if [[ ! -f "$MAP_FILE" ]]; then
  echo "{}" > "$MAP_FILE"
fi

echo "Creating issues from planning/portfolio/portfolio.json..."

create_issue() {
  local key="$1"
  local title="$2"
  local body_file="$3"
  local milestone="$4"
  local labels_csv="$5"
  local parent="$6"
  local depends_on="$7"

  local existing
  existing="$(jq -r --arg key "$key" '.[$key].number // empty' "$MAP_FILE")"

  if [[ -n "$existing" ]]; then
    echo "skipping existing issue: $key (#$existing)"
    return
  fi

  local full_body
  full_body="$(cat "$PLANNING_DIR/$body_file")"

  if [[ -n "$parent" ]]; then
    local parent_num
    parent_num="$(jq -r --arg parent "$parent" '.[$parent].number // empty' "$MAP_FILE")"
    if [[ -n "$parent_num" ]]; then
      full_body="${full_body}

---
Parent issue: #${parent_num}"
    fi
  fi

  if [[ -n "$depends_on" ]]; then
    local dep_num
    dep_num="$(jq -r --arg dep "$depends_on" '.[$dep].number // empty' "$MAP_FILE")"
    if [[ -n "$dep_num" ]]; then
      full_body="${full_body}

Depends on: #${dep_num}"
    fi
  fi

  local created_url
  created_url="$(gh issue create \
    --title "$title" \
    --body "$full_body" \
    --milestone "$milestone" \
    --label "$labels_csv")"

  local number
  number="$(echo "$created_url" | awk -F/ '{print $NF}')"

  jq --arg key "$key" --argjson number "$number" --arg url "$created_url" \
    '. + {($key): {"number": $number, "url": $url}}' "$MAP_FILE" > "$TMP_FILE"
  mv "$TMP_FILE" "$MAP_FILE"

  echo "created issue: $key (#$number)"
}

# Create epics first, then features, then stories.
for type in epic feature story; do
  jq -c --arg type "$type" '.records[] | select(.type==$type)' "$PORTFOLIO_FILE" | while read -r item; do
    key="$(echo "$item" | jq -r '.key')"
    title="$(echo "$item" | jq -r '.title')"
    body_file="$(echo "$item" | jq -r '.body_file')"
    milestone="$(echo "$item" | jq -r '.milestone')"
    parent="$(echo "$item" | jq -r '.parent // ""')"
    depends_on="$(echo "$item" | jq -r '.depends_on // ""')"
    release="$(echo "$item" | jq -r '.release | ascii_downcase')"
    area="$(echo "$item" | jq -r '.area')"
    priority="$(echo "$item" | jq -r '.priority')"
    labels_csv="release:${release},type:${type},area:${area},priority:${priority}"
    create_issue "$key" "$title" "$body_file" "$milestone" "$labels_csv" "$parent" "$depends_on"
  done
done
