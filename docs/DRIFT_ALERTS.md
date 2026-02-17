# Drift + Regression Alerts

AMC detects maturity/integrity regressions across runs and can freeze EXECUTE for risky action classes until recovery.

## Config

Files:
- `.amc/alerts.yaml`
- `.amc/alerts.yaml.sig`

Webhook secrets are not stored in plaintext YAML. Use `secretRef` values that resolve to vault entries.

## Commands

```bash
amc alerts init
amc alerts verify
amc alerts test

amc drift check --agent <id> --against previous
amc drift report --agent <id> --out .amc/agents/<id>/reports/drift.md

amc freeze status --agent <id>
amc freeze lift --agent <id> --incident <incidentId>
```

## Incidents and Freeze

When regression rules trigger:
- AMC records `DRIFT_REGRESSION_DETECTED`.
- AMC creates signed incident artifacts under:
  - `.amc/agents/<id>/incidents/`
- Freeze can activate for configured action classes.

While frozen:
- Governor denies EXECUTE for frozen classes.
- ToolHub rejects execute requests and allows simulate flow.
- Diagnostic reflects reduced autonomy allowance.

## Alert Payloads

Alert dispatcher sends deterministic JSON to configured local/webhook endpoints, including:
- rule/agent/run identifiers
- summary
- report/dashboard links
- content hashes for verification
