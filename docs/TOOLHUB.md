# TOOLHUB

ToolHub is the trusted host tool proxy inside AMC Studio.

It executes real tools outside the evaluated agent process, enforces deny-by-default policy, records observed evidence, and mints monitor-signed receipts.

## Signed Config

ToolHub policy files:

- `.amc/tools.yaml`
- `.amc/tools.yaml.sig`

If signature verification fails, ToolHub denies execution and writes `CONFIG_SIGNATURE_INVALID` audit evidence.

## Threat Model

- ToolHub runs in the trusted Studio boundary.
- Agent processes do not get signing keys.
- ToolHub rejects unsafe paths and commands before execution.
- All inputs/outputs are redacted before evidence storage.

## Commands

```bash
amc tools init
amc tools verify
amc tools list
```

## Intent -> Execute Flow

1. Agent (or operator) requests an intent:

```http
POST /toolhub/intent
```

2. Studio runs Governor checks and returns:

- `intentId`
- `effectiveMode` (`SIMULATE` or `EXECUTE`)
- `requiredExecTicket`
- guard-check receipt

3. Agent submits execute request:

```http
POST /toolhub/execute
```

4. ToolHub validates:

- signed config status
- intent expiry
- tool allowlist constraints
- governor mode decision
- execution ticket (when required)

5. ToolHub emits evidence:

- `tool_action`
- `tool_result`
- audit events for denials

Both action/result events include receipts.

## Default Safety Controls

- deny by default
- no access to `.amc/**` or vault paths
- argv denylist for dangerous patterns (`rm`, `sudo`, `chmod`, `chown`)
- host allowlist for external HTTP fetches
- optional per-tool execution ticket requirement

## Agent Tokens and Scopes

Use agent-scoped tokens for ToolHub API access:

- `toolhub:intent`
- `toolhub:execute`
- `governor:check`
- `receipt:verify`

Agent tokens cannot perform admin actions (service lifecycle, signing, target updates, bundle/cert export).

## Limitations

- ToolHub only governs actions routed through ToolHub.
- Direct host actions outside ToolHub are treated as bypass attempts and reduce maturity ceilings when detected.
