#!/usr/bin/env bash
set -euo pipefail

export AMC_WORKSPACE_DIR="${AMC_WORKSPACE_DIR:-/data/amc}"
export AMC_BIND="${AMC_BIND:-0.0.0.0}"
export AMC_STUDIO_PORT="${AMC_STUDIO_PORT:-3212}"
export AMC_GATEWAY_PORT="${AMC_GATEWAY_PORT:-3210}"
export AMC_PROXY_PORT="${AMC_PROXY_PORT:-3211}"
export AMC_TOOLHUB_PORT="${AMC_TOOLHUB_PORT:-3213}"
export AMC_LAN_MODE="${AMC_LAN_MODE:-true}"

mkdir -p "${AMC_WORKSPACE_DIR}"

if [[ "${AMC_BOOTSTRAP:-0}" == "1" ]]; then
  node /app/dist/cli.js bootstrap --workspace "${AMC_WORKSPACE_DIR}"
fi

exec node /app/dist/cli.js studio start \
  --workspace "${AMC_WORKSPACE_DIR}" \
  --bind "${AMC_BIND}" \
  --port "${AMC_STUDIO_PORT}"
