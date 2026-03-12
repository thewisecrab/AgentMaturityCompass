#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/../.." && pwd)"
cd "$ROOT"

echo "== OpenClaw + AMC baseline =="
echo "Repo: $ROOT"
echo

echo "1) Start AMC services if needed"
echo "   amc up"
echo

echo "2) Run the OpenClaw example through AMC wrapping"
echo "   amc wrap openclaw-cli -- openclaw run --config examples/openclaw/config.yaml"
echo

echo "3) Generate score + trace + observability"
echo "   amc quickscore"
echo "   amc trace list"
echo "   amc observe timeline"
echo "   amc assurance run --scope full"
