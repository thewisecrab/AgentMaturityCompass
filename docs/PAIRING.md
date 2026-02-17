# Pairing Flow (Universal Agent Onboarding)

Pairing provides a simple, least-privilege path to connect an agent machine without giving it owner credentials.

## CLI Flow

```bash
# Owner / Operator
amc pair create --agent-name "my-agent" --ttl-min 10

# Agent machine
amc pair redeem AMC-XXXX-XXXX --out ./agent.token --bridge-url http://127.0.0.1:3212
amc connect --token-file ./agent.token --bridge-url http://127.0.0.1:3212
```

## Security Properties

- Pairing codes are single-use and expire strictly.
- Redeem is rate-limited and audited.
- Redeem returns a signed lease token with bounded scopes/TTL.
- Agents cannot create pairing codes.

Relevant audit events:

- `PAIR_CREATED`
- `PAIR_REDEEMED`
- `PAIR_REDEEM_FAILED`
- `PAIR_REDEEM_RATE_LIMITED`
