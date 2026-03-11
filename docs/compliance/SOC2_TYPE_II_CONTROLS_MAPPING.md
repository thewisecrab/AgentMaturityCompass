# SOC 2 Type II Controls Mapping for AI Agents

> **Framework**: AICPA SOC 2 Type II (Trust Services Criteria 2017, updated 2022)
> **Mapped to**: AMC (Agent Maturity Compass) — evidence-backed agent trust framework
> **Generated**: 2026-03-10
> **Status**: Complete — all 5 Trust Services Categories mapped

---

## Overview

This document maps AMC's diagnostic questions, assurance packs, and evidence infrastructure to SOC 2 Type II Trust Services Criteria. SOC 2 Type II evaluates **operating effectiveness over a period** (not just design at a point in time), which aligns with AMC's continuous evidence collection model.

AMC's compliance engine (`src/compliance/`) already includes built-in mappings (`builtInMappings.ts`) for all 5 categories. This document provides the **criteria-level detail** required for Type II audit preparation.

---

## 1. Security (Common Criteria — CC6)

**SOC 2 Category**: Security (Common to all engagements)
**AMC Built-in Mapping ID**: `soc2_security`

### CC6.1 — Logical and Physical Access Controls

| SOC 2 Requirement | AMC Control | Evidence Source |
|---|---|---|
| Logical access restricted to authorized users | Action policy enforcement (`action-policy.yaml`) | `audit` events: `LEASE_INVALID_OR_MISSING`, `LEASE_SCOPE_DENIED` |
| Access provisioned based on authorization | Approval gates (`approval-policy.yaml`) | `tool_action` events with approval chain |
| Access reviewed and modified when needed | Capability manifest with least-privilege | AMC questions: `AMC-1.5`, `AMC-1.8` |

**AMC Questions**: AMC-1.5 (tool boundary enforcement), AMC-1.8 (governance/approval gates)
**Assurance Packs**: `governance_bypass` (min score 85, 0 succeeded attacks)
**Evidence Events**: `llm_request`, `llm_response`, `tool_action`, `audit` (min 70% observed ratio)
**Denied Audit Types**: `GOVERNANCE_BYPASS_SUCCEEDED`, `EXECUTE_WITHOUT_TICKET_ATTEMPTED`, `LEASE_INVALID_OR_MISSING`

### CC6.2 — System Access Authentication

| SOC 2 Requirement | AMC Control | Evidence Source |
|---|---|---|
| Users identified and authenticated | Agent identity via gateway auth tokens | `audit` events with agent identity |
| Credentials managed securely | No agent-provided keys in prompts | `AGENT_PROVIDED_KEY_IGNORED` denylist |
| Multi-factor where appropriate | Approval escalation for sensitive actions | `tool_action` with approval chain |

**AMC Questions**: AMC-3.2.3 (identity verification), AMC-3.3.4 (credential handling)

### CC6.3 — Authorization to Access

| SOC 2 Requirement | AMC Control | Evidence Source |
|---|---|---|
| Access authorized based on job function | Role-based action policy | `action-policy.yaml` configuration |
| Principle of least privilege enforced | Tool allowlists and scope restrictions | `tools.yaml` configuration |
| Access removed upon role change | Dynamic capability manifest | Capability manifest updates |

**AMC Questions**: AMC-1.5 (tool boundaries), AMC-4.6 (governance controls)

### CC6.6 — Threats Against System Boundaries

| SOC 2 Requirement | AMC Control | Evidence Source |
|---|---|---|
| Threats from injections detected | Prompt injection assurance pack | `injection` pack (min score 80) |
| Data exfiltration prevented | Exfiltration assurance pack | `exfiltration` pack (min score 80) |
| Boundary violations logged | Audit trail with denied events | `SECRET_EXFILTRATION_SUCCEEDED` denylist |

**AMC Questions**: AMC-3.3.1 (injection defense), AMC-3.3.4 (indirect injection)
**Assurance Packs**: `injection`, `exfiltration`

### CC6.7 — Data Transmission Protection

| SOC 2 Requirement | AMC Control | Evidence Source |
|---|---|---|
| Data in transit protected | Gateway-mediated provider routing | `gateway.yaml` with trusted routes |
| Unauthorized routes prevented | Provider route governance | `UNSAFE_PROVIDER_ROUTE` denylist |

### CC6.8 — Malicious Software Prevention

| SOC 2 Requirement | AMC Control | Evidence Source |
|---|---|---|
| Unsafe tool execution prevented | Tool safety assurance pack | `unsafe_tooling` pack |
| Supply chain integrity verified | Provider route validation | `DIRECT_PROVIDER_BYPASS_SUSPECTED` denylist |

---

## 2. Availability (A1)

**SOC 2 Category**: Availability
**AMC Built-in Mapping ID**: `soc2_availability`

### A1.1 — Capacity Management

| SOC 2 Requirement | AMC Control | Evidence Source |
|---|---|---|
| System capacity monitored | Budget tracking (`budgets.yaml`) | `metric` events with cost/token data |
| Resource consumption managed | Budget limits and freeze controls | `BUDGET_EXCEEDED`, `EXECUTE_FROZEN_ACTIVE` |
| Performance metrics tracked | Operational telemetry | AMC questions: AMC-4.2 |

**AMC Questions**: AMC-1.7 (observability), AMC-4.1 (operational reliability), AMC-4.2 (cost efficiency)

### A1.2 — Recovery and Continuity

| SOC 2 Requirement | AMC Control | Evidence Source |
|---|---|---|
| Recovery procedures documented | Alert configurations (`alerts.yaml`) | `audit` events for incident response |
| Backup and restore tested | Drift/regression detection | `DRIFT_REGRESSION_DETECTED` monitoring |
| Failover mechanisms available | Multi-provider routing | Gateway route configuration |

**Evidence Events**: `metric`, `audit`, `test` (min 60% observed ratio)
**Denied Audit Types**: `TRACE_CORRELATION_LOW`, `DRIFT_REGRESSION_DETECTED`

### A1.3 — Environmental Controls

| SOC 2 Requirement | AMC Control | Evidence Source |
|---|---|---|
| System environment monitored | Continuous assurance runner | Assurance pack execution logs |
| Anomalies detected and escalated | Alert thresholds and notifications | `alerts.yaml` configuration |

---

## 3. Processing Integrity (PI1)

**SOC 2 Category**: Processing Integrity
**AMC Built-in Mapping ID**: `soc2_processing_integrity`

### PI1.1 — Accurate and Complete Processing

| SOC 2 Requirement | AMC Control | Evidence Source |
|---|---|---|
| Outputs verified for accuracy | Hallucination assurance pack | `hallucination` pack (min score 80) |
| Processing logic validated | Eval harness with deterministic tests | `test` events from eval-harness |
| Error detection and correction | Verification discipline metrics | AMC questions: AMC-2.3, AMC-2.5 |

**AMC Questions**: AMC-2.3 (verification discipline), AMC-2.5 (output quality), AMC-3.3.1 (correctness controls)

### PI1.2 — System Input Controls

| SOC 2 Requirement | AMC Control | Evidence Source |
|---|---|---|
| Input validation enforced | Guardrails configuration | `guardrails.yaml` |
| Malformed inputs rejected | Input sanitization in gateway | `llm_request` event validation |

### PI1.3 — System Output Controls

| SOC 2 Requirement | AMC Control | Evidence Source |
|---|---|---|
| Outputs meet quality standards | Gate policy evaluation | `gatePolicy.json` configuration |
| Output integrity verified | Trace receipt chain integrity | `TRACE_RECEIPT_INVALID` monitoring |

**Evidence Events**: `test`, `audit`, `metric` (min 60% observed ratio)
**Assurance Packs**: `hallucination` (min score 80, 0 succeeded)

### PI1.4 — Processing Monitoring

| SOC 2 Requirement | AMC Control | Evidence Source |
|---|---|---|
| Processing monitored continuously | Evidence ledger with hash chains | Ledger integrity verification |
| Anomalies investigated | Audit event correlation | `audit` events with correlation |
| Completeness of processing verified | Trace chain validation | AMC question: AMC-4.3 |

---

## 4. Confidentiality (C1)

**SOC 2 Category**: Confidentiality
**AMC Built-in Mapping ID**: `soc2_confidentiality`

### C1.1 — Confidential Information Identified

| SOC 2 Requirement | AMC Control | Evidence Source |
|---|---|---|
| Confidential data classified | Data boundary definitions | `context-graph.json` boundaries |
| Classification enforced in processing | Secret handling rules | AMC question: AMC-3.1.2 |

**AMC Questions**: AMC-1.5 (tool boundary enforcement), AMC-1.8 (governance gates), AMC-3.1.2 (secret handling)

### C1.2 — Confidential Information Protected

| SOC 2 Requirement | AMC Control | Evidence Source |
|---|---|---|
| Secrets not leaked in responses | Exfiltration assurance pack | `exfiltration` pack (min score 80) |
| Redaction applied where needed | Output guardrails | `guardrails.yaml` redaction rules |
| Secret exfiltration detected | Audit denylist enforcement | `SECRET_EXFILTRATION_SUCCEEDED` denylist |
| Agent key injection blocked | Key isolation policy | `AGENT_PROVIDED_KEY_IGNORED` denylist |

**Evidence Events**: `audit`, `llm_request`, `llm_response` (min 70% observed ratio)
**Assurance Packs**: `exfiltration` (min score 80, 0 succeeded)

### C1.3 — Confidential Information Disposed

| SOC 2 Requirement | AMC Control | Evidence Source |
|---|---|---|
| Data retention policies enforced | Context window management | Gateway session lifecycle |
| Confidential data purged when no longer needed | Evidence event expiry | Ledger retention policies |

---

## 5. Privacy (P1)

**SOC 2 Category**: Privacy
**AMC Built-in Mapping ID**: `soc2_privacy`

### P1.1 — Notice and Consent

| SOC 2 Requirement | AMC Control | Evidence Source |
|---|---|---|
| Privacy practices communicated | Prompt addendum with disclosure | `prompt-addendum.md` configuration |
| Consent obtained before processing | Consent-aware operation flags | `MISSING_CONSENT` denylist |

**AMC Questions**: AMC-1.8 (governance gates), AMC-3.1.2 (data handling), AMC-4.5 (risk awareness)

### P1.2 — Choice and Consent

| SOC 2 Requirement | AMC Control | Evidence Source |
|---|---|---|
| Data subjects can opt out | Human oversight controls | AMC question: AMC-2.10 |
| Consent preferences enforced | Policy violation detection | `POLICY_VIOLATION` denylist |

### P1.3 — Collection Limitation

| SOC 2 Requirement | AMC Control | Evidence Source |
|---|---|---|
| Data collection minimized | Least-privilege tool access | `tools.yaml` with scope limits |
| Only necessary data processed | Context graph boundaries | `context-graph.json` |

### P1.4 — Use, Retention, and Disposal

| SOC 2 Requirement | AMC Control | Evidence Source |
|---|---|---|
| Data used only for stated purposes | Action policy scope enforcement | `action-policy.yaml` |
| Retention periods defined | Ledger window-based evidence | Evidence window configuration |

### P1.5 — Disclosure and Notification

| SOC 2 Requirement | AMC Control | Evidence Source |
|---|---|---|
| Breach notification procedures | Alert and audit trail | `alerts.yaml`, `SECRET_EXFILTRATION_SUCCEEDED` |
| Third-party disclosures controlled | Provider route governance | `gateway.yaml` trusted routes |

**Evidence Events**: `audit`, `review` (min 50% observed ratio)
**Denied Audit Types**: `MISSING_CONSENT`, `POLICY_VIOLATION`

---

## Evidence Generation Guide

### Running a SOC 2 Compliance Report

```bash
# Generate SOC 2 compliance report for a 90-day window
amc compliance report --framework SOC2 --window 90d --agent-id <agent-id>

# Initialize signed compliance maps (first time)
amc compliance init

# Verify compliance maps signature
amc compliance verify
```

### Evidence Trust Tiers

AMC classifies evidence into three trust tiers (critical for Type II audits):

| Tier | Description | SOC 2 Value |
|---|---|---|
| **OBSERVED** | Runtime-captured, hash-chained evidence | Highest — direct system evidence |
| **ATTESTED** | Signed by external notary/vault | High — third-party verification |
| **SELF_REPORTED** | Owner/review attestations | Lower — requires corroboration |

For SOC 2 Type II, aim for **≥70% OBSERVED** evidence ratio across all categories.

### Report Output Fields

Each compliance report includes:
- `coverage.score` — overall compliance coverage (0-100)
- `coverage.satisfied` / `partial` / `missing` / `unknown` — per-category counts
- `categories[]` — detailed per-criteria evaluation with evidence refs
- `trustTierCoverage` — observed/attested/self-reported ratios
- `configTrusted` — whether compliance maps are signed and verified
- `nonClaims` — legal disclaimers (not legal advice)

### Continuous Monitoring (Type II Requirement)

SOC 2 Type II requires evidence of controls operating **over a period** (typically 6-12 months). AMC supports this via:

1. **Evidence Ledger** — Hash-chained event log with timestamps
2. **Assurance Runner** — Scheduled pack execution (governance_bypass, injection, exfiltration, hallucination, unsafe_tooling)
3. **Compliance Engine** — Periodic report generation with window-based evidence evaluation
4. **Drift Detection** — `DRIFT_REGRESSION_DETECTED` audit events flag control degradation

### Required Assurance Packs for SOC 2 Type II

| Pack | Categories Covered | Minimum Score |
|---|---|---|
| `governance_bypass` | Security (CC6) | 85 |
| `injection` | Security (CC6), Processing Integrity (PI1) | 80 |
| `exfiltration` | Security (CC6), Confidentiality (C1), Privacy (P1) | 80 |
| `hallucination` | Processing Integrity (PI1) | 80 |
| `unsafe_tooling` | Security (CC6), Availability (A1) | 75 |
| `duality` | Privacy (P1) | 75 |

### AMC Questions Coverage Matrix

| AMC Question | SOC 2 Categories |
|---|---|
| AMC-1.5 (Tool Boundaries) | CC6.1, CC6.3, C1.1 |
| AMC-1.7 (Observability) | A1.1, A1.2 |
| AMC-1.8 (Governance Gates) | CC6.1, CC6.2, P1.1 |
| AMC-2.3 (Verification) | PI1.1 |
| AMC-2.5 (Output Quality) | PI1.1 |
| AMC-3.1.2 (Secret Handling) | C1.1, C1.2, P1.3 |
| AMC-3.3.1 (Injection Defense) | CC6.6 |
| AMC-3.3.4 (Indirect Injection) | CC6.6 |
| AMC-4.1 (Reliability) | A1.2 |
| AMC-4.2 (Cost Efficiency) | A1.1 |
| AMC-4.3 (Completeness) | PI1.4 |
| AMC-4.5 (Risk Awareness) | P1.1 |
| AMC-4.6 (Governance Controls) | CC6.1, CC6.3 |

---

## Gap Analysis & Recommendations

### Current Built-in Coverage

AMC's `builtInMappings.ts` provides **5 category-level mappings** covering all SOC 2 Trust Services Categories. Each mapping includes:
- Evidence event requirements with observed ratio thresholds
- Assurance pack requirements with score thresholds
- Audit event denylists for violation detection

### Recommended Enhancements for Type II Readiness

1. **Expand to criteria-level mappings** — Current mappings are at category level (e.g., "Security"). Add criteria-level mappings (CC6.1, CC6.2, CC6.3, etc.) for granular audit evidence.

2. **Add temporal evidence windows** — Type II requires evidence over 6-12 months. Implement scheduled compliance report generation with rolling windows.

3. **Add change management controls** — Map `CONFIG_SIGNATURE_INVALID` and configuration change events to CC8.1 (Change Management).

4. **Add vendor management** — Map provider route governance and `UNSAFE_PROVIDER_ROUTE` detection to CC9.2 (Vendor Risk Management).

5. **Implement evidence retention policy** — Define ledger retention periods aligned with SOC 2 Type II audit windows (minimum 12 months).

---

## Non-Claims

- This mapping provides evidence-backed signals only; it is **not legal advice**.
- Controls not represented in verified AMC evidence are marked as UNKNOWN/MISSING.
- Owner attestations must be explicitly signed and are not inferred automatically.
- SOC 2 Type II audit must be performed by an independent CPA firm.
- This document supports audit preparation but does not constitute an audit report.
