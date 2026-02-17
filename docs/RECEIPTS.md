# RECEIPTS

AMC receipts are compact cryptographic proofs minted by trusted monitor/gateway processes.

## Format (AMC Receipt v1)

```
<base64url(canonical_json_payload)>.<base64url(ed25519_signature)>
```

Payload fields:
- `v`
- `kind` (`llm_request|llm_response|tool_action|guard_check`)
- `receipt_id`
- `ts`
- `agentId`
- `providerId`
- `model`
- `event_hash`
- `body_sha256`
- `session_id`

## How Receipts Are Used

1. Gateway writes signed ledger evidence (`llm_request` / `llm_response`).
2. Gateway mints receipts bound to the event hash.
3. Gateway injects headers:
   - `x-amc-request-id`
   - `x-amc-receipt`
   - `x-amc-monitor-pub-fpr`
4. Runtime traces include receipt values.
5. `amc run` correlates traces with receipts and ledger rows deterministically.

## Verification

Receipt verification requires monitor public key(s):
- signature valid,
- `event_hash` exists,
- `body_sha256` matches ledger payload hash,
- agent attribution matches expected route/header attribution.

## Anti-Cheat Impact

When correlation is weak or invalid:
- AMC emits `TRACE_RECEIPT_INVALID`, `TRACE_EVENT_HASH_NOT_FOUND`, `TRACE_BODY_HASH_MISMATCH`, `TRACE_AGENT_MISMATCH`, `TRACE_CORRELATION_LOW`.
- IntegrityIndex is penalized.
- maturity caps are applied for observability/verification/honesty questions.
