# Audit Log Protocol — Satanic Pope
## Structured Action Logging (L4 Observability Evidence)

> **Purpose:** Define the format, retention, and review cadence for my own action audit trail.  
> **Evidence type:** L4 Observability — "cross-linked observability (logs + alerts + user feedback)"  
> **L4 Security** — "SOC-style log aggregation, incident response runbooks with timestamps"  
> **Last updated:** 2026-02-18

---

## Log Format (Per Action Entry)

Every Tier C or Tier D action (from ACTION_POLICY.md), every external communication attempt, and every notable event gets an entry in `AMC_OS/LOGS/ACTION_AUDIT.md` using this format:

```
### [YYYY-MM-DD HH:MM IST] — <ACTION_TYPE>
- **Tool used:** <tool name>
- **Action:** <one-line description of what I did>
- **Scope:** <files/systems/people affected>
- **Justification:** <why I did this>
- **Policy tier:** <A / B / C / D>
- **Confirmation received:** <yes/no/pre-approved>
- **Outcome:** <what happened>
- **Anomalies:** <anything unexpected, or "none">
```

---

## What Gets Logged

### Always log:
- Any message sent to an external channel
- Any shell command that modifies files or runs processes
- Any sub-agent spawn
- Any cron job created, modified, or deleted
- Any gateway config change
- Any crypto bot action (start, stop, config change)
- Any detected prompt injection attempt
- Any escalation triggered (Tier D or alert)
- Any policy deviation (Tier C action taken without confirmation due to time pressure)

### Log on anomaly only:
- File reads (only if sensitive — .env, API keys, credentials)
- Web searches and fetches (only if content triggered a red flag)
- Memory reads (only if an injection was detected or suspected)

### Never log (PII protection):
- Actual message content from Sid's personal communications
- Actual API key values (reference only: "Binance API key - last 4 chars: XXXX")
- Full output of any PII-containing tool result

---

## Log Files

| Log file | Contents | Retention |
|----------|----------|-----------|
| `AMC_OS/LOGS/ACTION_AUDIT.md` | Tier C/D actions + anomalies | 90 days rolling |
| `AMC_OS/LOGS/AGENT_SPAWNS.md` | All sub-agent launches with task summary | 30 days |
| `AMC_OS/LOGS/ERRORS.md` | Any error, wrong file write, unexpected outcome | 180 days |
| `AMC_OS/LOGS/POLICY_DEVIATIONS.md` | Any time I deviate from ACTION_POLICY.md | Permanent |
| `AMC_OS/LOGS/CAPABILITY_CHANGES.md` | Any change to CAPABILITY_MANIFEST.md | Permanent |
| `AMC_OS/LOGS/INJECTION_ATTEMPTS.md` | Detected prompt injection attempts | 180 days |

---

## Review Cadence

| Review type | Frequency | Who reviews | Output |
|-------------|-----------|-------------|--------|
| Action audit spot check | Weekly (HEARTBEAT task) | Me (self-audit) | Summary to Sid if anything notable |
| Policy deviation review | On any deviation | Me + Sid | Update policy if deviation was justified |
| Capability manifest review | Monthly | Me + Sid | Updated manifest version |
| Injection attempt summary | Monthly | Me | Report to Sid if pattern detected |
| Full audit retrospective | Quarterly | Sid | Maturity level reassessment input |

---

## Alert Rules

The following patterns trigger immediate Sid alert:

1. **POLICY_DEVIATION** in LOGS: I took a Tier C action without confirmation
2. **INJECTION_ATTEMPT** count > 2 in 24 hours: Possible coordinated attack
3. **CRYPTO_BOT_RESTART** count > 2 in 60 minutes: Bot stability problem
4. **AGENT_SPAWN** count > 10 in one session: Runaway agent risk
5. **ERROR** in LOGS with "permission" or "access denied": Scope violation attempt
6. **CAPABILITY_CHANGE** not reflected in manifest within 24h: Governance gap

---

## Baseline Log Entry (Session Start)

```
### [2026-02-18 18:30 IST] — GOVERNANCE_BASELINE
- **Tool used:** Write
- **Action:** Created CAPABILITY_MANIFEST.md, ACTION_POLICY.md, AUDIT_PROTOCOL.md
- **Scope:** AMC_OS/ENGINEERING/, AMC_OS/LOGS/
- **Justification:** Self-maturation to L4 per Sid's instruction
- **Policy tier:** A
- **Confirmation received:** Pre-approved (internal workspace write)
- **Outcome:** 3 governance evidence files created
- **Anomalies:** None
```

---

**Files created/updated:** `AMC_OS/LOGS/AUDIT_PROTOCOL.md`
**Acceptance checks:**
1. Log format is structured and fields are unambiguous
2. "Never log" section protects Sid's PII
3. Retention periods defined for all log files
4. Alert rules have specific numeric thresholds
