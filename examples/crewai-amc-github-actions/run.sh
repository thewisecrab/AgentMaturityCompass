#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/../.." && pwd)"
cd "$ROOT"

echo "== CrewAI + AMC + GitHub Actions baseline =="
echo "Suggested local flow:"
echo "  amc up"
echo "  amc wrap crewai-cli -- python examples/crewai/main.py"
echo "  amc quickscore"
echo "  amc assurance run --scope full"
echo "  amc leaderboard show"
echo

echo "Then wire CI using: docs/integrations/ci-cd.md"
