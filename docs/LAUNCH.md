# LAUNCH RUNBOOK

This runbook is the final go-live flow after all AMC packs are integrated.

## 1) Local Deployment

```bash
npm i -g agent-maturity-compass
amc setup --demo
amc up
amc doctor --json
amc verify all --json
```

Use the console URL printed by `amc up` (pair LAN devices when enabled).

## 2) Docker Compose Deployment

```bash
cd /Users/thewisecrab/AMC/deploy/compose
cp .env.example .env
docker compose up -d --build
docker compose ps
curl -fsS http://127.0.0.1:3212/readyz
```

For TLS, use `docker-compose.tls.yml` and follow `/Users/thewisecrab/AMC/deploy/compose/README.md`.

## 3) Kubernetes Helm Deployment

```bash
helm lint /Users/thewisecrab/AMC/deploy/helm/amc
helm template amc /Users/thewisecrab/AMC/deploy/helm/amc > /tmp/amc-rendered.yaml
helm upgrade --install amc /Users/thewisecrab/AMC/deploy/helm/amc
```

Validate:
- `/healthz` and `/readyz`
- ingress TLS
- PVC binding
- NetworkPolicy and hardened securityContext

## 4) Notary Enablement (Anti-Cheat Boundary)

```bash
amc notary init
amc notary start
amc trust enable-notary --base-url http://127.0.0.1:4343 --pin /path/to/notary.pub --require SOFTWARE
amc trust status
```

If NOTARY mode is required and notary is unavailable, readiness must fail closed.

## 5) SSO/SCIM Enablement

```bash
amc identity init --host-dir /path/to/host
amc identity provider add oidc --host-dir /path/to/host --id okta --issuer <issuer> --client-id <id> --client-secret-file <file> --redirect-uri <uri>
amc identity mapping add --host-dir /path/to/host --group amc-ws-default-owner --workspace default --roles OWNER,AUDITOR
amc scim token create --host-dir /path/to/host --name idp-scim --out /secure/scim-token.txt
```

## 6) Backup + Restore Drill

```bash
amc backup create --out .amc/backups/drill.amcbackup
amc backup verify .amc/backups/drill.amcbackup
amc backup restore .amc/backups/drill.amcbackup --to /tmp/amc-restore --force
```

Post-restore:

```bash
AMC_WORKSPACE_DIR=/tmp/amc-restore amc verify all --json
```

## 7) Routine Maintenance + Retention

```bash
amc retention status
amc retention run --dry-run
amc retention run
amc maintenance stats
amc maintenance vacuum
amc maintenance rotate-logs
amc maintenance prune-cache
```

## 8) Monitoring + Metrics

```bash
amc metrics status
curl -fsS http://127.0.0.1:9464/metrics
```

Track at minimum:
- HTTP request rate/latency
- lease issuance
- toolhub intents/exec outcomes
- retention/blob/db size metrics
- transparency root changes
- integrity gauges

## Day 0 / Day 7 / Day 30 Cadence

### Day 0
- Run setup/bootstrap.
- Validate `amc doctor --json`, `amc verify all --json`, and `amc e2e smoke --mode local --json`.
- Enable backup schedule and metrics scraping.

### Day 7
- Run retention + maintenance pass.
- Verify latest backup age and restore drill.
- Review advisories/forecast drift and regenerate transform plans.

### Day 30
- Perform full verify-all gate and release verification.
- Re-run docker/helm smoke checks.
- Rotate signing/SCIM/notary credentials per policy.
- Review ecosystem benchmark percentile movement and systemic risk deltas.
