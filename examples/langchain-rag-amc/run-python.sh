#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/../.." && pwd)"
cd "$ROOT"

echo "== LangChain Python + AMC baseline =="
echo "Suggested flow:"
echo "  amc up"
echo "  amc wrap langchain-python -- python examples/langchain-python/main.py"
echo "  amc quickscore"
echo "  amc dataset create rag-baseline"
echo "  amc dataset add-case rag-baseline --prompt 'What does the policy say about refunds?' --expected 'Should mention refund policy'"
echo "  amc dataset run rag-baseline"
echo "  amc trace list"
