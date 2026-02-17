# Realtime Org Updates (SSE)

AMC Studio exposes org realtime events over SSE:

- endpoint: `GET /events/org`
- auth: console session cookie (RBAC `VIEWER+`) or admin token
- content type: `text/event-stream`

## Event Types

- `ORG_SCORECARD_UPDATED`
- `AGENT_RUN_COMPLETED`
- `ASSURANCE_RUN_COMPLETED`
- `OUTCOMES_UPDATED`
- `INCIDENT_CREATED`
- `FREEZE_APPLIED`
- `FREEZE_LIFTED`
- `POLICY_PACK_APPLIED`
- `BENCHMARK_INGESTED`
- `FEDERATION_IMPORTED`

Payload shape:

```json
{
  "type": "ORG_SCORECARD_UPDATED",
  "nodeIds": ["enterprise", "team-platform"],
  "ts": 1730000000000,
  "summaryHash": "<sha256>",
  "version": 1
}
```

## Privacy Rules

SSE payloads intentionally exclude:
- secrets
- tokens
- raw transcripts
- raw tool output

Only structural metadata needed for live UI refresh is emitted.

## Recompute Behavior

On key write paths (runs, assurance, outcomes ingest, incidents/freeze changes, policy-pack apply, benchmark ingest, federation import), Studio recomputes org scorecards and emits update events.

