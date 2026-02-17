# Assurance Waivers

Waivers provide a controlled, time-limited way to keep operations available while remediation is in progress after an assurance threshold breach.

## Governance Model

Waivers are strict controls, not score overrides.

Requirements:
- dual-control approval (OWNER + AUDITOR)
- signed waiver record under `.amc/assurance/waivers/`
- explicit reason
- hard expiry (max 72 hours)
- full transparency/audit trail

Waivers only relax readiness gating temporarily. They do not change assurance findings, scores, or certificate status.

## Commands

```bash
amc assurance waiver request --hours 24 --reason "temporary continuity while remediating"
amc assurance waiver status
amc assurance waiver revoke --waiver <waiverId>
```

## Readiness Behavior

- No waiver + fail-closed breach: workspace readiness returns 503 (`ASSURANCE_THRESHOLD_BREACH`).
- Active waiver: readiness can return 200 with warning `ASSURANCE_WAIVER_ACTIVE` until expiry/revocation.

## Operational Guidance

Use waivers only for bounded continuity windows. Pair every waiver with:
- a remediation plan
- rerun of assurance
- certificate re-issuance once thresholds are restored
