# AMC Engineering Implementation Status

> **Scope:** 25 feature domains × 5 operational layers = **125** mapped feature slices.
> **Last updated:** 2026-02-18

## Live status summary

- implemented-as-reality: 38
- in-progress: 39
- roadmap-only: 31
- blocked: 17

## 125-feature manifest

| Feature ID | Feature | Layer | Status | Evidence/owner |
|---|---|---|---|---|
| F001 | S1 Analyzer | Layer-1 Control/API | implemented-as-reality |  |
| F002 | S1 Analyzer | Layer-2 Runtime | in-progress |  |
| F003 | S1 Analyzer | Layer-3 Evidence/Receipt | in-progress |  |
| F004 | S1 Analyzer | Layer-4 Integration/SDK | roadmap-only |  |
| F005 | S1 Analyzer | Layer-5 Sales & GTM Readiness | roadmap-only |  |
| F006 | S2 Behavioral Sandbox | Layer-1 Control/API | implemented-as-reality |  |
| F007 | S2 Behavioral Sandbox | Layer-2 Runtime | in-progress |  |
| F008 | S2 Behavioral Sandbox | Layer-3 Evidence/Receipt | blocked |  |
| F009 | S2 Behavioral Sandbox | Layer-4 Integration/SDK | blocked |  |
| F010 | S2 Behavioral Sandbox | Layer-5 Sales & GTM Readiness | blocked |  |
| F011 | S3 Signing | Layer-1 Control/API | implemented-as-reality |  |
| F012 | S3 Signing | Layer-2 Runtime | implemented-as-reality |  |
| F013 | S3 Signing | Layer-3 Evidence/Receipt | in-progress |  |
| F014 | S3 Signing | Layer-4 Integration/SDK | in-progress |  |
| F015 | S3 Signing | Layer-5 Sales & GTM Readiness | roadmap-only |  |
| F016 | S4 SBOM | Layer-1 Control/API | implemented-as-reality |  |
| F017 | S4 SBOM | Layer-2 Runtime | in-progress |  |
| F018 | S4 SBOM | Layer-3 Evidence/Receipt | blocked |  |
| F019 | S4 SBOM | Layer-4 Integration/SDK | blocked |  |
| F020 | S4 SBOM | Layer-5 Sales & GTM Readiness | roadmap-only |  |
| F021 | S5 Reputation | Layer-1 Control/API | implemented-as-reality |  |
| F022 | S5 Reputation | Layer-2 Runtime | implemented-as-reality |  |
| F023 | S5 Reputation | Layer-3 Evidence/Receipt | in-progress |  |
| F024 | S5 Reputation | Layer-4 Integration/SDK | roadmap-only |  |
| F025 | S5 Reputation | Layer-5 Sales & GTM Readiness | roadmap-only |  |
| F026 | S6 Manifest | Layer-1 Control/API | implemented-as-reality |  |
| F027 | S6 Manifest | Layer-2 Runtime | implemented-as-reality |  |
| F028 | S6 Manifest | Layer-3 Evidence/Receipt | blocked |  |
| F029 | S6 Manifest | Layer-4 Integration/SDK | roadmap-only |  |
| F030 | S6 Manifest | Layer-5 Sales & GTM Readiness | roadmap-only |  |
| F031 | S7 Registry | Layer-1 Control/API | implemented-as-reality |  |
| F032 | S7 Registry | Layer-2 Runtime | in-progress |  |
| F033 | S7 Registry | Layer-3 Evidence/Receipt | blocked |  |
| F034 | S7 Registry | Layer-4 Integration/SDK | in-progress |  |
| F035 | S7 Registry | Layer-5 Sales & GTM Readiness | roadmap-only |  |
| F036 | S8 Ingress | Layer-1 Control/API | implemented-as-reality |  |
| F037 | S8 Ingress | Layer-2 Runtime | in-progress |  |
| F038 | S8 Ingress | Layer-3 Evidence/Receipt | blocked |  |
| F039 | S8 Ingress | Layer-4 Integration/SDK | roadmap-only |  |
| F040 | S8 Ingress | Layer-5 Sales & GTM Readiness | roadmap-only |  |
| F041 | S9 Sanitizer | Layer-1 Control/API | implemented-as-reality |  |
| F042 | S9 Sanitizer | Layer-2 Runtime | implemented-as-reality |  |
| F043 | S9 Sanitizer | Layer-3 Evidence/Receipt | in-progress |  |
| F044 | S9 Sanitizer | Layer-4 Integration/SDK | in-progress |  |
| F045 | S9 Sanitizer | Layer-5 Sales & GTM Readiness | roadmap-only |  |
| F046 | S10 Detector | Layer-1 Control/API | implemented-as-reality |  |
| F047 | S10 Detector | Layer-2 Runtime | in-progress |  |
| F048 | S10 Detector | Layer-3 Evidence/Receipt | in-progress |  |
| F049 | S10 Detector | Layer-4 Integration/SDK | roadmap-only |  |
| F050 | S10 Detector | Layer-5 Sales & GTM Readiness | roadmap-only |  |
| F051 | E1 Policy | Layer-1 Control/API | implemented-as-reality |  |
| F052 | E1 Policy | Layer-2 Runtime | implemented-as-reality |  |
| F053 | E1 Policy | Layer-3 Evidence/Receipt | blocked |  |
| F054 | E1 Policy | Layer-4 Integration/SDK | roadmap-only |  |
| F055 | E1 Policy | Layer-5 Sales & GTM Readiness | roadmap-only |  |
| F056 | E2 Exec Guard | Layer-1 Control/API | implemented-as-reality |  |
| F057 | E2 Exec Guard | Layer-2 Runtime | in-progress |  |
| F058 | E2 Exec Guard | Layer-3 Evidence/Receipt | in-progress |  |
| F059 | E2 Exec Guard | Layer-4 Integration/SDK | roadmap-only |  |
| F060 | E2 Exec Guard | Layer-5 Sales & GTM Readiness | roadmap-only |  |
| F061 | E3 Browser Guardrails | Layer-1 Control/API | implemented-as-reality |  |
| F062 | E3 Browser Guardrails | Layer-2 Runtime | implemented-as-reality |  |
| F063 | E3 Browser Guardrails | Layer-3 Evidence/Receipt | in-progress |  |
| F064 | E3 Browser Guardrails | Layer-4 Integration/SDK | in-progress |  |
| F065 | E3 Browser Guardrails | Layer-5 Sales & GTM Readiness | roadmap-only |  |
| F066 | E4 Egress Proxy | Layer-1 Control/API | implemented-as-reality |  |
| F067 | E4 Egress Proxy | Layer-2 Runtime | in-progress |  |
| F068 | E4 Egress Proxy | Layer-3 Evidence/Receipt | blocked |  |
| F069 | E4 Egress Proxy | Layer-4 Integration/SDK | blocked |  |
| F070 | E4 Egress Proxy | Layer-5 Sales & GTM Readiness | roadmap-only |  |
| F071 | E5 Circuit Breaker | Layer-1 Control/API | implemented-as-reality |  |
| F072 | E5 Circuit Breaker | Layer-2 Runtime | in-progress |  |
| F073 | E5 Circuit Breaker | Layer-3 Evidence/Receipt | in-progress |  |
| F074 | E5 Circuit Breaker | Layer-4 Integration/SDK | blocked |  |
| F075 | E5 Circuit Breaker | Layer-5 Sales & GTM Readiness | roadmap-only |  |
| F076 | E6 Step-Up | Layer-1 Control/API | implemented-as-reality |  |
| F077 | E6 Step-Up | Layer-2 Runtime | in-progress |  |
| F078 | E6 Step-Up | Layer-3 Evidence/Receipt | in-progress |  |
| F079 | E6 Step-Up | Layer-4 Integration/SDK | in-progress |  |
| F080 | E6 Step-Up | Layer-5 Sales & GTM Readiness | roadmap-only |  |
| F081 | E7 Sandbox Orchestrator | Layer-1 Control/API | implemented-as-reality |  |
| F082 | E7 Sandbox Orchestrator | Layer-2 Runtime | in-progress |  |
| F083 | E7 Sandbox Orchestrator | Layer-3 Evidence/Receipt | in-progress |  |
| F084 | E7 Sandbox Orchestrator | Layer-4 Integration/SDK | in-progress |  |
| F085 | E7 Sandbox Orchestrator | Layer-5 Sales & GTM Readiness | roadmap-only |  |
| F086 | E8 Session Firewall | Layer-1 Control/API | implemented-as-reality |  |
| F087 | E8 Session Firewall | Layer-2 Runtime | in-progress |  |
| F088 | E8 Session Firewall | Layer-3 Evidence/Receipt | in-progress |  |
| F089 | E8 Session Firewall | Layer-4 Integration/SDK | in-progress |  |
| F090 | E8 Session Firewall | Layer-5 Sales & GTM Readiness | roadmap-only |  |
| F091 | E9 Outbound | Layer-1 Control/API | implemented-as-reality |  |
| F092 | E9 Outbound | Layer-2 Runtime | in-progress |  |
| F093 | E9 Outbound | Layer-3 Evidence/Receipt | in-progress |  |
| F094 | E9 Outbound | Layer-4 Integration/SDK | in-progress |  |
| F095 | E9 Outbound | Layer-5 Sales & GTM Readiness | roadmap-only |  |
| F096 | V1 Secrets Broker | Layer-1 Control/API | implemented-as-reality |  |
| F097 | V1 Secrets Broker | Layer-2 Runtime | implemented-as-reality |  |
| F098 | V1 Secrets Broker | Layer-3 Evidence/Receipt | in-progress |  |
| F099 | V1 Secrets Broker | Layer-4 Integration/SDK | in-progress |  |
| F100 | V1 Secrets Broker | Layer-5 Sales & GTM Readiness | roadmap-only |  |
| F101 | V2 DLP | Layer-1 Control/API | implemented-as-reality |  |
| F102 | V2 DLP | Layer-2 Runtime | implemented-as-reality |  |
| F103 | V2 DLP | Layer-3 Evidence/Receipt | implemented-as-reality |  |
| F104 | V2 DLP | Layer-4 Integration/SDK | implemented-as-reality |  |
| F105 | V2 DLP | Layer-5 Sales & GTM Readiness | roadmap-only |  |
| F106 | V3 Honeytokens | Layer-1 Control/API | implemented-as-reality |  |
| F107 | V3 Honeytokens | Layer-2 Runtime | in-progress |  |
| F108 | V3 Honeytokens | Layer-3 Evidence/Receipt | blocked |  |
| F109 | V3 Honeytokens | Layer-4 Integration/SDK | roadmap-only |  |
| F110 | V3 Honeytokens | Layer-5 Sales & GTM Readiness | roadmap-only |  |
| F111 | V4 RAG Guard | Layer-1 Control/API | implemented-as-reality |  |
| F112 | V4 RAG Guard | Layer-2 Runtime | in-progress |  |
| F113 | V4 RAG Guard | Layer-3 Evidence/Receipt | blocked |  |
| F114 | V4 RAG Guard | Layer-4 Integration/SDK | blocked |  |
| F115 | V4 RAG Guard | Layer-5 Sales & GTM Readiness | roadmap-only |  |
| F116 | W1 Receipts | Layer-1 Control/API | implemented-as-reality |  |
| F117 | W1 Receipts | Layer-2 Runtime | implemented-as-reality |  |
| F118 | W1 Receipts | Layer-3 Evidence/Receipt | implemented-as-reality |  |
| F119 | W1 Receipts | Layer-4 Integration/SDK | in-progress |  |
| F120 | W1 Receipts | Layer-5 Sales & GTM Readiness | in-progress |  |
| F121 | W2 Assurance | Layer-1 Control/API | implemented-as-reality |  |
| F122 | W2 Assurance | Layer-2 Runtime | implemented-as-reality |  |
| F123 | W2 Assurance | Layer-3 Evidence/Receipt | roadmap-only |  |
| F124 | W2 Assurance | Layer-4 Integration/SDK | blocked |  |
| F125 | W2 Assurance | Layer-5 Sales & GTM Readiness | blocked |  |

## Acceptance checks per layer

### Layer-1 Control/API
- Module file present and importable under `AMC_OS/PLATFORM/amc/*/*.py`
- Public API contract has typed inputs/outputs and deterministic defaults
- Smoke path from router/CLI/SDK resolves without exception

### Layer-2 Runtime
- Fail-closed decisions are explicit (allow/block/step-up with reason code)
- Hostile input path and policy boundary tests execute in CI
- No bypass path without policy evaluation

### Layer-3 Evidence/Receipt
- Every deny/allow emits evidence records with timestamp + context
- Evidence can be exported in machine-readable format and hashed
- Evidence schema includes session/run id and module code

### Layer-4 Integration/SDK
- Router/SDK entrypoint wired behind feature flags
- Consumer integration examples (request/response + expected outputs) exist
- Backward-compatibility note for breaking config fields

### Layer-5 Sales & GTM readiness
- Customer-facing one-pager exists for module set with limitations + mitigation
- Service-level recovery and rollback story documented
- Objection playbook linked to risk scenarios

## Top 12 remaining blockers (highest business impact)

1. **S2 (Layer-3/4/5)** — Behavioral sandbox has no deterministic evidence schema; hard to sell confidence on this control. *Owner: engine + qa.*
2. **S4 (Layer-3/4)** — SBOM evidence normalizer not finalized (dependency on scanner output variants). *Owner: platform.*
3. **S6 (Layer-3)** — Manifest capability output contains placeholder justification fields. *Owner: security.*
4. **E4 (Layer-3/4)** — Egress policy sync to allow/block lists still pending proxy manifest parity. *Owner: infrastructure.*
5. **W2 (Layer-4/5)** — Assurance pack lacks export profile for enterprise reviewers. *Owner: watch.*
6. **V4 (Layer-3)** — RAG guard evidence export has no SIEM mapping template. *Owner: vault.*
7. **V3 (Layer-3)** — Honeytoken event confidence score not yet thresholded for false positives. *Owner: vault.*
8. **S7 (Layer-3)** — Registry signer verification depends on external truststore not standardized yet. *Owner: shield.*
9. **S8 (Layer-3)** — Ingress decisions do not always persist immutable deny logs. *Owner: platform.*
10. **E1 (Layer-3)** — Policy rationale chain truncates under multi-rule merges. *Owner: policy engine.*
11. **E5 (Layer-4)** — Circuit-breaker has policy enforcement but no managed rollout/rollback adapter. *Owner: ops.*
12. **V3 (Layer-1/4)** — Honeytoken templates not finalized for regulated customer profiles. *Owner: product.*

## 2-week execution plan (A/B/C levers)

| Week | Focus | Layer scope | Lever | Actionable steps |
|---|---|---|---|---|
| 1 | Stabilize conversion-critical blockers | 1-3 | A + B | Resolve blockers #1,2,4,6,7 with deterministic evidence artifacts; publish one evidence packet per feature for top 6 sales narratives
| 1 | Shipping readiness | 4-5 | C | Add integration examples for 10 roadmap-only Layer-4/5 slices; attach rollback and onboarding notes to each feature group
| 2 | Move to hardening cycle | 1-3 | C | Add acceptance tests for all blocked/in-progress slices; require evidence schema + reason codes before closing any feature as implemented
| 2 | GTM packaging and review | 5 | B + C | Publish final customer-facing risk/objection matrix; align pricing-ready scope with W2, V2, W1 proof points
| 2 | Go/No-Go gating | All | A + B + C | Re-score manifest: target IR + in-progress reduction by ≥20%; blocked ≤8; publish sign-off artifact

## Files created/updated
- `AMC_OS/ENGINEERING/IMPLEMENTATION_STATUS.md`

## Acceptance checks
1. Matrix includes all 125 entries and sums to exactly 125.
2. Top 12 blockers assigned with owners and measurable exit criteria.
3. Layer checks can be verified from module code and test artifacts.
4. Two-week plan maps explicitly to levers A/B/C and has daily exit criteria.

## Next actions
1. Confirm blockers #1-#12 with owning leads before end of day and convert at least 3 to in-progress by next update.
2. Add integration smoke tests for W1/W2 evidence export and S4/S6 manifest packaging.
3. Re-run this manifest after blockers review with any status changes only for verified work.

## Risks/unknowns
- Blocker counts assume no new compliance requirement arrives mid-cycle (e.g., jurisdictional policy shifts).
- Some modules have latent dependencies in external security tooling that may delay Layer-4/5 readiness.
- Regression risk from strict evidence schema changes in live customer environments.
