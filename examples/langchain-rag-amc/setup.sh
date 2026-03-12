#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/../.." && pwd)"
cd "$ROOT/examples/langchain-python"

python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt

echo "LangChain Python example environment ready."
echo "Next: ../langchain-rag-amc/run-python.sh"
