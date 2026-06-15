#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
MAP_FILE="$ROOT_DIR/.lfas/issue-map.json"
PORTFOLIO_FILE="$ROOT_DIR/planning/portfolio/portfolio.json"
MODE="apply"
GITHUB_SYNC_SLEEP_SECONDS="${GITHUB_SYNC_SLEEP_SECONDS:-0.2}"

usage() {
  cat <<'USAGE'
Usage: scripts/portfolio/sync-issue-content.sh [--check|--dry-run|--apply]

Updates existing GitHub issues from planning/portfolio/portfolio.json and the
Markdown body files referenced by each portfolio record.

Options:
  --check     Validate local files and issue-map coverage only.
  --dry-run   Print the GitHub issue edits that would be applied.
  --apply     Update GitHub issue titles, bodies, milestones, and labels.
  -h, --help  Show this help text.
USAGE
}

while [[ $# -gt 0 ]]; do
  case "$1" in
    --check)
      MODE="check"
      shift
      ;;
    --dry-run)
      MODE="dry-run"
      shift
      ;;
    --apply)
      MODE="apply"
      shift
      ;;
    -h|--help)
      usage
      exit 0
      ;;
    *)
      echo "Unknown option: $1" >&2
      usage >&2
      exit 2
      ;;
  esac
done

require_command() {
  local command_name="$1"

  if ! command -v "$command_name" >/dev/null 2>&1; then
    echo "Error: required command '$command_name' is not installed." >&2
    exit 1
  fi
}

require_file() {
  local file_path="$1"

  if [[ ! -f "$file_path" ]]; then
    echo "Error: required file not found at $file_path" >&2
    exit 1
  fi
}

issue_number_for_key() {
  local key="$1"

  jq -r --arg key "$key" '.[$key].number // empty' "$MAP_FILE"
}

repo_from_issue_map() {
  jq -r '
    to_entries[]
    | .value.url // empty
    | select(test("github[.]com/[^/]+/[^/]+/issues/[0-9]+"))
    | capture("github[.]com/(?<owner>[^/]+)/(?<repo>[^/]+)/issues/[0-9]+")
    | "\(.owner)/\(.repo)"
  ' "$MAP_FILE" | head -n 1
}

require_github() {
  require_command gh

  if ! gh auth status >/dev/null 2>&1; then
    echo "Error: GitHub CLI authentication is required for remote issue sync." >&2
    echo "Run 'gh auth login -h github.com' or set GH_TOKEN/GITHUB_TOKEN with issue permissions." >&2
    gh auth status >&2 || true
    exit 1
  fi
}

sleep_after_write() {
  if [[ "$GITHUB_SYNC_SLEEP_SECONDS" != "0" ]]; then
    sleep "$GITHUB_SYNC_SLEEP_SECONDS"
  fi
}

labels_for_record() {
  local release="$1"
  local type="$2"
  local area="$3"
  local priority="$4"

  printf 'release:%s,type:%s,area:%s,priority:%s' \
    "$(tr '[:upper:]' '[:lower:]' <<< "$release")" \
    "$type" \
    "$area" \
    "$priority"
}

require_command jq
require_file "$MAP_FILE"
require_file "$PORTFOLIO_FILE"

jq empty "$MAP_FILE"
jq empty "$PORTFOLIO_FILE"

TMP_DIR="$(mktemp -d)"
trap 'rm -rf "$TMP_DIR"' EXIT

missing_file="$TMP_DIR/missing.txt"
plan_file="$TMP_DIR/plan.tsv"
touch "$missing_file"
touch "$plan_file"

while IFS=$'\t' read -r key type release milestone area priority title body_file; do
  issue_number="$(issue_number_for_key "$key")"
  body_path="$ROOT_DIR/planning/$body_file"

  if [[ -z "$issue_number" ]]; then
    echo "Missing issue-map entry for $key" >> "$missing_file"
    continue
  fi

  if [[ ! -f "$body_path" ]]; then
    echo "Missing body file for $key: planning/$body_file" >> "$missing_file"
    continue
  fi

  labels="$(labels_for_record "$release" "$type" "$area" "$priority")"
  printf '%s\t%s\t%s\t%s\t%s\t%s\t%s\n' \
    "$key" "$issue_number" "$title" "$body_path" "$milestone" "$labels" "$body_file" \
    >> "$plan_file"
done < <(
  jq -r '
    .records[]
    | [
        .key,
        .type,
        .release,
        .milestone,
        .area,
        .priority,
        .title,
        .body_file
      ]
    | @tsv
  ' "$PORTFOLIO_FILE"
)

if [[ -s "$missing_file" ]]; then
  echo "Issue content sync validation failed:" >&2
  cat "$missing_file" >&2
  exit 1
fi

issue_count="$(wc -l < "$plan_file" | tr -d ' ')"
echo "Validated $issue_count issue content updates."

if [[ "$MODE" == "check" ]]; then
  echo "Check complete. No GitHub calls were made."
  exit 0
fi

if [[ "$MODE" == "dry-run" ]]; then
  echo "Dry run issue updates:"
  while IFS=$'\t' read -r key issue_number title body_path milestone labels body_file; do
    echo "- $key -> #$issue_number"
    echo "  title: $title"
    echo "  milestone: $milestone"
    echo "  labels: $labels"
    echo "  body: planning/$body_file"
  done < "$plan_file"
  exit 0
fi

require_github

REPO="${GH_REPO:-$(repo_from_issue_map)}"

if [[ -z "$REPO" ]]; then
  REPO="$(gh repo view --json nameWithOwner -q '.nameWithOwner')"
fi

if [[ -z "$REPO" ]]; then
  echo "Error: could not determine GitHub repository. Set GH_REPO=OWNER/REPO." >&2
  exit 1
fi

echo "Using GitHub repository ${REPO}."

updated_count=0

while IFS=$'\t' read -r key issue_number title body_path milestone labels body_file; do
  gh issue edit "$issue_number" \
    --repo "$REPO" \
    --title "$title" \
    --body-file "$body_path" \
    --milestone "$milestone" \
    --add-label "$labels" \
    >/dev/null

  updated_count=$((updated_count + 1))
  echo "updated issue: $key (#$issue_number)"
  sleep_after_write
done < "$plan_file"

echo "Issue content sync complete. Updated $updated_count issues."
