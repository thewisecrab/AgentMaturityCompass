# Autonomy Budgets

AMC budgets enforce hard limits on LLM and tool activity per agent.

## Config

File:
- `.amc/budgets.yaml`
- `.amc/budgets.yaml.sig` (auditor-signed)

Unsigned/invalid budgets config is treated as untrusted and restricts execute behavior.

## What Is Enforced

- Per-minute LLM request/token limits.
- Per-day LLM request/token/cost limits.
- Per-day tool execute limits by `ActionClass`.

Budget checks run in:
- Gateway (LLM path/rate/budget)
- ToolHub (execute budget guard)
- Governor decisions (mode downgrades for exceeded budgets)

## Commands

```bash
amc budgets init
amc budgets verify
amc budgets status --agent <id>
amc budgets reset --agent <id> --day 2026-02-11
```

## Audit Signals

- `BUDGET_EXCEEDED`
- `LEASE_RATE_LIMITED`

These audits feed diagnostic caps (for example Q24/Q25 caps when execute-related budgets are exceeded).
