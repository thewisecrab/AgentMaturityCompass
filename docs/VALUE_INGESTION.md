# Value Ingestion

AMC supports three deterministic ingestion paths for value evidence.

## 1) OBSERVED (Automatic)

AMC derives observed value signals from internal receipts/events:

- Bridge receipts
- ToolHub receipts
- Approval cycle and governance events

These are trust-tiered as `OBSERVED`.

## 2) Webhook Ingest (Owner Systems)

Endpoint:

- `POST /w/:workspaceId/value/ingest/webhook`

Auth:

- OWNER/OPERATOR session, or
- signed webhook token from vault (`x-amc-webhook-token`)

Payload rules:

- Numeric/categorical allowlist only
- No free text, email, URL, file paths, tokens, or secrets
- Suspicious payloads are rejected with `400`

Trust labeling:

- Signed/attested webhook flow => `ATTESTED`
- Unsigned flow => `SELF_REPORTED`

## 3) CSV Import (Offline)

```bash
amc value import --csv ./kpi.csv --scope agent --id agent-1 --kpi cycle_time_hours
```

CSV must be numeric (`ts,value`) rows only. Suspicious strings are rejected.

## Security Model

- All ingested events are normalized and hashed.
- Transparency entries are appended (`VALUE_EVENT_INGESTED`).
- Self-reported events are clearly labeled and excluded from strong-claim math by policy gates.
- No raw prompts/model I/O are accepted in value ingest flows.
