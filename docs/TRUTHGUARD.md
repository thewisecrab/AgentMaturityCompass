# Truthguard

Truthguard is a deterministic linter for agent output contracts.

It validates structured output:

```json
{
  "v": 1,
  "answer": "string",
  "claims": [{ "text": "string", "evidenceRefs": ["..."] }],
  "unknowns": [{ "text": "string" }],
  "nextActions": [{ "actionId": "string", "requiresApproval": true }]
}
```

Checks:
- claim inflation guard: action-like claims must include evidence refs
- evidence binding: refs must exist in AMC evidence ledger when workspace validation is used
- allowlist guard: tagged `tool:<name>` and `model:<name>` must match policy allowlists
- secret guard: detects key/token/private-key patterns and redacts snippets

Commands:

```bash
amc truthguard validate --file ./output.json
```

API:
- `POST /api/truthguard/validate`

Trust labels:
- lease-auth validation is `SELF_REPORTED` by default
- if claims are fully bound to existing AMC evidence refs, result can be elevated to observed binding
- owner/operator validation is treated as attested operator action

What Truthguard does not prove:
- it does not prove business correctness
- it does not replace domain review or approvals
- it does not grant execution rights by itself
