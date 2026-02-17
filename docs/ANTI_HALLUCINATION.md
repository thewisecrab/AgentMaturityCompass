# Anti-Hallucination Controls

AMC enforces deterministic claim discipline through Northstar prompt constraints plus Truthguard validation.

## Deterministic Rules

- strong action claims require `evidenceRefs`
- unknown state must be reported as `UNKNOWN`
- disallowed model/tool mentions are flagged
- secret/token/private-key patterns are blocked/redacted
- output must match allowed structured contract when enforced

Truthguard input contract (`amc.output.v1` style):

```json
{
  "v": 1,
  "answer": "string",
  "claims": [{ "text": "string", "evidenceRefs": ["ev_..."] }],
  "unknowns": [{ "text": "string" }],
  "nextActions": [{ "actionId": "string", "requiresApproval": true }]
}
```

## Bridge Integration

When model calls go through Bridge:
- response is validated by Truthguard
- `output_validated` evidence event is written
- in enforce mode, invalid outputs return `422 OUTPUT_CONTRACT_VIOLATION`

## What This Guarantees

- prevents easy claim inflation without bound evidence references
- creates a verifiable audit trail for output quality/compliance
- keeps behavior deterministic and reproducible offline

## What This Does Not Guarantee

- domain correctness of every answer
- business/legal suitability without human review
- completeness of evidence when instrumentation is missing

Use this as an honesty boundary, not a substitute for approvals, governance, or expert oversight.
