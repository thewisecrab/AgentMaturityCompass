#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/../.." && pwd)"
cd "$ROOT/examples/crewai"

python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt

echo "CrewAI example environment ready."
echo "Next: ../crewai-amc-github-actions/run.sh"
