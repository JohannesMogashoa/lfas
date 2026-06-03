#!/usr/bin/env bash
set -euo pipefail
ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
echo "Backlog summary:"
jq -r '
  .records
  | group_by(.release)
  | .[]
  | "\(.[0].release): total=\(length), epics=\([.[]|select(.type=="epic")]|length), features=\([.[]|select(.type=="feature")]|length), stories=\([.[]|select(.type=="story")]|length)"
' "$ROOT_DIR/portfolio/portfolio.json"
echo ""
echo "First 10 issues:"
jq -r '.records[0:10][] | "\(.key) | \(.type) | \(.title)"' "$ROOT_DIR/portfolio/portfolio.json"
