#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
MAP_FILE="$ROOT_DIR/.lfas/issue-map.json"
PORTFOLIO_FILE="$ROOT_DIR/planning/portfolio/portfolio.json"
MODE="apply"
GITHUB_API_VERSION="${GITHUB_API_VERSION:-2026-03-10}"
GITHUB_SYNC_SLEEP_SECONDS="${GITHUB_SYNC_SLEEP_SECONDS:-0.2}"

usage() {
  cat <<'USAGE'
Usage: scripts/portfolio/sync-issue-relationships.sh [--check|--dry-run|--apply]

Syncs parent-child issue relationships from planning/portfolio/portfolio.json
and .lfas/issue-map.json into GitHub's native Relationships field.

Options:
  --check     Validate local files and issue-map coverage only.
  --dry-run   Compare the local relationship plan with remote GitHub state.
  --apply     Create missing native GitHub sub-issue relationships. Default.
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
    echo "Error: GitHub CLI authentication is required for remote relationship sync." >&2
    echo "Run 'gh auth login -h github.com' or set GH_TOKEN/GITHUB_TOKEN with Issues permissions." >&2
    gh auth status >&2 || true
    exit 1
  fi
}

gh_api() {
  gh api \
    -H "Accept: application/vnd.github+json" \
    -H "X-GitHub-Api-Version: ${GITHUB_API_VERSION}" \
    "$@"
}

issue_id_for_number() {
  local issue_number="$1"
  local cached_id
  local issue_id

  cached_id="$(
    awk -F $'\t' -v issue_number="$issue_number" \
      '$1 == issue_number { print $2; exit }' "$ISSUE_ID_CACHE"
  )"

  if [[ -n "$cached_id" ]]; then
    printf '%s\n' "$cached_id"
    return
  fi

  issue_id="$(gh_api "repos/${REPO}/issues/${issue_number}" --jq '.id')"

  if [[ -z "$issue_id" || "$issue_id" == "null" ]]; then
    echo "Error: could not resolve GitHub database id for issue #${issue_number}." >&2
    exit 1
  fi

  printf '%s\t%s\n' "$issue_number" "$issue_id" >> "$ISSUE_ID_CACHE"
  printf '%s\n' "$issue_id"
}

remote_sub_issue_numbers() {
  local parent_number="$1"

  gh_api --paginate \
    "repos/${REPO}/issues/${parent_number}/sub_issues?per_page=100" \
    --jq '.[].number'
}

sleep_after_write() {
  if [[ "$GITHUB_SYNC_SLEEP_SECONDS" != "0" ]]; then
    sleep "$GITHUB_SYNC_SLEEP_SECONDS"
  fi
}

require_command jq
require_file "$MAP_FILE"
require_file "$PORTFOLIO_FILE"

jq empty "$MAP_FILE"
jq empty "$PORTFOLIO_FILE"

TMP_DIR="$(mktemp -d)"
trap 'rm -rf "$TMP_DIR"' EXIT

missing_file="$TMP_DIR/missing.txt"
relationships_file="$TMP_DIR/relationships.tsv"
duplicate_file="$TMP_DIR/duplicates.txt"
limit_file="$TMP_DIR/limits.txt"
ISSUE_ID_CACHE="$TMP_DIR/issue-ids.tsv"
touch "$missing_file"
touch "$relationships_file"
touch "$ISSUE_ID_CACHE"

relationship_count=0

while IFS=$'\t' read -r child_key parent_key child_title; do
  relationship_count=$((relationship_count + 1))

  if ! jq -e --arg key "$parent_key" '.records[] | select(.key == $key)' "$PORTFOLIO_FILE" >/dev/null; then
    echo "Missing parent portfolio record: $parent_key (referenced by $child_key)" >> "$missing_file"
    continue
  fi

  parent_num="$(issue_number_for_key "$parent_key")"
  child_num="$(issue_number_for_key "$child_key")"

  if [[ -z "$parent_num" ]]; then
    echo "Missing issue-map entry for parent: $parent_key" >> "$missing_file"
    continue
  fi

  if [[ -z "$child_num" ]]; then
    echo "Missing issue-map entry for child: $child_key" >> "$missing_file"
    continue
  fi

  printf '%s\t%s\t%s\t%s\t%s\n' \
    "$parent_num" "$child_num" "$child_key" "$parent_key" "$child_title" \
    >> "$relationships_file"

  printf '%s\t%s\t%s\n' "$child_num" "$child_key" "$child_title" \
    >> "$TMP_DIR/parent_${parent_num}.tsv"
done < <(jq -r '.records[] | select((.parent // "") != "") | [.key, .parent, .title] | @tsv' "$PORTFOLIO_FILE")

if [[ -s "$missing_file" ]]; then
  echo "Relationship validation failed:" >&2
  cat "$missing_file" >&2
  exit 1
fi

cut -f1,2 "$relationships_file" | sort | uniq -d > "$duplicate_file"

if [[ -s "$duplicate_file" ]]; then
  echo "Relationship validation failed: duplicate parent-child pairs found:" >&2
  cat "$duplicate_file" >&2
  exit 1
fi

find "$TMP_DIR" -name 'parent_*.tsv' -type f | sort | while read -r filepath; do
  child_count="$(wc -l < "$filepath" | tr -d ' ')"

  if [[ "$child_count" -gt 100 ]]; then
    parent_num="$(basename "$filepath" | sed 's/parent_//;s/\.tsv//')"
    echo "Parent issue #${parent_num} has ${child_count} desired child issues." >> "$limit_file"
  fi
done

if [[ -s "$limit_file" ]]; then
  echo "Relationship validation failed: GitHub supports up to 100 sub-issues per parent issue." >&2
  cat "$limit_file" >&2
  exit 1
fi

parent_count="$(find "$TMP_DIR" -name 'parent_*.tsv' -type f | wc -l | tr -d ' ')"

echo "Validated $relationship_count relationships across $parent_count parent issues."

if [[ "$MODE" == "check" ]]; then
  echo "Check complete. No GitHub calls were made."
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

missing_remote_count=0
created_remote_count=0
extra_remote_count=0

while read -r filepath; do
  parent_num="$(basename "$filepath" | sed 's/parent_//;s/\.tsv//')"
  desired_file="$TMP_DIR/desired_${parent_num}.txt"
  existing_file="$TMP_DIR/existing_${parent_num}.txt"
  missing_remote_file="$TMP_DIR/missing_remote_${parent_num}.txt"
  extra_remote_file="$TMP_DIR/extra_remote_${parent_num}.txt"

  cut -f1 "$filepath" | sort > "$desired_file"
  remote_sub_issue_numbers "$parent_num" | sort > "$existing_file"

  comm -23 "$desired_file" "$existing_file" > "$missing_remote_file"
  comm -13 "$desired_file" "$existing_file" > "$extra_remote_file"

  while read -r child_num; do
    if [[ -z "$child_num" ]]; then
      continue
    fi

    child_key="$(
      awk -F $'\t' -v child_num="$child_num" \
        '$1 == child_num { print $2; exit }' "$filepath"
    )"

    if [[ "$MODE" == "dry-run" ]]; then
      echo "Would add #${child_num} (${child_key}) as a native sub-issue of #${parent_num}."
      missing_remote_count=$((missing_remote_count + 1))
      continue
    fi

    child_id="$(issue_id_for_number "$child_num")"
    echo "Adding #${child_num} (${child_key}) as a native sub-issue of #${parent_num}..."

    gh_api \
      -X POST \
      "repos/${REPO}/issues/${parent_num}/sub_issues" \
      -F "sub_issue_id=${child_id}" \
      -F replace_parent=true \
      >/dev/null

    created_remote_count=$((created_remote_count + 1))
    sleep_after_write
  done < "$missing_remote_file"

  while read -r child_num; do
    if [[ -z "$child_num" ]]; then
      continue
    fi

    echo "Remote parent issue #${parent_num} also has sub-issue #${child_num}, which is not in planning/portfolio/portfolio.json."
    extra_remote_count=$((extra_remote_count + 1))
  done < "$extra_remote_file"
done < <(find "$TMP_DIR" -name 'parent_*.tsv' -type f | sort)

if [[ "$MODE" == "dry-run" ]]; then
  echo "Dry run complete. Missing native relationships: ${missing_remote_count}. Extra remote relationships reported only: ${extra_remote_count}."
  exit 0
fi

echo "GitHub issue relationship synchronization finished successfully. Created native relationships: ${created_remote_count}. Extra remote relationships reported only: ${extra_remote_count}."
