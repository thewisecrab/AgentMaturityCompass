#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/../.." && pwd)"
cd "$ROOT"

echo "== OpenAI-compatible app + AMC lite-score =="
echo "Suggested flow:"
echo "  amc lite-score"
echo "  amc dataset create app-baseline"
echo "  amc dataset add-case app-baseline --prompt 'Summarize this support ticket' --expected 'Should summarize accurately'"
echo "  amc dataset run app-baseline"
echo "  amc business report"
