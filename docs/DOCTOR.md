# DOCTOR

`amc doctor` is AMC’s deterministic local troubleshooting command.

## Commands

```bash
amc doctor
amc doctor --json
```

## What doctor checks

1. Node runtime version (`>=20`)
2. Studio running status
3. Vault lock status
4. Signature status:
   - `action-policy.yaml`
   - `tools.yaml`
   - `budgets.yaml`
   - `approval-policy.yaml`
   - `adapters.yaml`
5. Gateway route mount checks:
   - `/openai`, `/anthropic`, `/gemini`, `/grok`, `/openrouter`, `/local`
6. ToolHub denylist sanity (`.amc` path access must be denied)
7. Lease carrier live checks (when Studio is running):
   - `Authorization: Bearer <lease>`
   - `x-api-key: <lease>`
8. Built-in adapter detection (`amc adapters detect`)

Doctor prints PASS/FAIL/WARN plus direct fix hints.

## Security guarantees

- Doctor never prints vault passphrases.
- Doctor never prints lease tokens.
- Doctor never prints provider secrets.

## Common fix flow

```bash
amc up
amc vault unlock
amc fix-signatures
amc adapters init
amc adapters verify
```
