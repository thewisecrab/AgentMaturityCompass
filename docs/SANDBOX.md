# Sandbox Mode

Sandbox mode executes agent commands in Docker and writes explicit sandbox attestation evidence.

## Command

```bash
amc sandbox run --agent salesbot --route http://127.0.0.1:3210/openai -- node agent.js
```

Optional proxy:

```bash
amc sandbox run --agent salesbot \
  --route http://127.0.0.1:3210/openai \
  --proxy http://127.0.0.1:3211 \
  -- python app.py
```

## What It Records

`SANDBOX_EXECUTION_ENABLED` audit evidence includes:

- agentId
- image name/hash (best effort)
- command and args

## Network Behavior

- Sandbox creates a per-run Docker `--internal` bridge network (internet egress blocked by Docker network policy).
- The agent container is attached only to that internal network and receives gateway route env vars.
- When `--route`/`--proxy` points to localhost, AMC rewrites to `host.docker.internal` for container access.
- Direct internet egress is blocked; network intent outside policy is captured as audit evidence when proxy mode is used.
- With gateway proxy allowlist enabled, blocked outbound attempts produce `NETWORK_EGRESS_BLOCKED` audits.

## Why It Matters for Scoring

For high-risk agents/questions, level 5 support requires sandbox attestation evidence in the selected window (otherwise capped).
