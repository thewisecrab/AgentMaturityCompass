# STUDIO

AMC Studio is the local control plane for operating AMC as an always-on app.

## Start / Stop

```bash
amc up
amc status
amc logs
amc down
```

`amc up` ensures workspace + vault readiness, then starts:
- gateway (`.amc/gateway.yaml` routes)
- proxy (if enabled in gateway config)
- dashboard server
- studio API server

State file:
- `.amc/studio/state.json`

Logs:
- `.amc/studio/logs/*.log`

## Local API

Studio host/port come from runtime config (`AMC_BIND`, `AMC_STUDIO_PORT`).
`amc up` defaults to localhost in local workflows.

Token file:
- `.amc/studio/admin.token`

Header required for protected endpoints:
- `x-amc-admin-token: <token>`

API surface boundaries:
- Lightweight module API: `/api/v1/*` (operational surface, not RBAC-gated today)
- Studio control plane API: `/*` (session/admin-token auth with RBAC on protected routes)
- Public bridge surface: `/bridge/*` (lease-auth integration surface)
- Reference: [API_SURFACES.md](./API_SURFACES.md)

Security note:
- Keep Studio network-restricted; do not expose `/api/v1/*` to untrusted networks.

CLI helper:

```bash
amc studio ping
```

## Typical Workflow

```bash
amc up
amc connect --agent <agentId>
amc supervise --agent <agentId> --route http://127.0.0.1:3210/openai -- <cmd...>
amc run --agent <agentId> --window 14d --target default
```
