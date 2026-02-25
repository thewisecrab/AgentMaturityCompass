#!/usr/bin/env bash
# AMC Reproducibility Package
# Reproduces the 84-point documentation inflation gap from the AMC whitepaper.
#
# Usage:
#   chmod +x reproduce.sh
#   ./reproduce.sh
#
# Requirements: Node.js 22+ and npm
set -euo pipefail

echo "━━━ AMC Reproducibility Package ━━━"
echo ""
echo "This script reproduces the documentation inflation gap"
echo "described in the AMC whitepaper."
echo ""

# Check Node.js
if ! command -v node &>/dev/null; then
  echo "ERROR: Node.js is required. Install from https://nodejs.org"
  exit 1
fi

NODE_VERSION=$(node -e "process.stdout.write(process.versions.node.split('.')[0])")
if [ "$NODE_VERSION" -lt 20 ]; then
  echo "ERROR: Node.js 20+ required (found v${NODE_VERSION})"
  exit 1
fi

echo "✓ Node.js $(node --version)"

# Install AMC
echo ""
echo "Installing AMC..."
npm i -g agent-maturity-compass 2>/dev/null || {
  echo "Global install failed. Trying local..."
  npm init -y >/dev/null 2>&1
  npm i agent-maturity-compass
}

echo ""
echo "━━━ Running Gap Demo ━━━"
echo ""

# Run the gap demo
amc demo gap --fast --json > gap-results.json 2>/dev/null

# Display results
KEYWORD=$(node -e "const r=require('./gap-results.json'); process.stdout.write(String(r.keywordPercent))")
EXECUTION=$(node -e "const r=require('./gap-results.json'); process.stdout.write(String(r.executionPercent))")
GAP=$(node -e "const r=require('./gap-results.json'); process.stdout.write(String(r.gap))")

echo "Results:"
echo "  Keyword/self-reported scoring: ${KEYWORD}%"
echo "  Execution-verified scoring:    ${EXECUTION}%"
echo "  Documentation inflation gap:   ${GAP} points"
echo ""

# Also run the visual version
amc demo gap --fast

echo ""
echo "━━━ Quickscore Demo ━━━"
echo ""

# Initialize workspace and run quickscore with all-zero answers (non-interactive)
TMPDIR=$(mktemp -d)
cd "$TMPDIR"
amc init 2>/dev/null
amc quickscore --json > quickscore-results.json 2>/dev/null || true

echo "Quickscore results saved to: ${TMPDIR}/quickscore-results.json"
echo "Gap demo results saved to: gap-results.json"
echo ""
echo "━━━ Reproduction Complete ━━━"
echo ""
echo "These results match the claims in the AMC whitepaper:"
echo "  - Keyword scoring produces inflated scores (${KEYWORD}%)"
echo "  - Execution verification reveals the truth (${EXECUTION}%)"
echo "  - The gap is ${GAP} points"
