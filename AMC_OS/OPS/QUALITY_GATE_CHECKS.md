# QUALITY GATE CHECKS

Owner: REV_QA_LEAD  
Scope: Revenue/Delivery core go-to-market deliverables  
Status: Active

## Purpose
This document defines acceptance tests that must pass before any deliverable is marked client-ready or moved to execution.

## Gate Process (applies to all deliverables)
1. **Draft Complete** — author submits artifact with named owner/date/version.
2. **Self-QA** — author runs checklist and attaches evidence.
3. **QA Review** — REV_QA_LEAD verifies tests and logs pass/fail.
4. **Remediation** — failures corrected and re-tested.
5. **Release Approval** — all critical tests pass; non-critical exceptions documented.

### Severity Rules
- **Critical**: Must pass to ship.
- **Major**: Can ship only with documented exception + owner/date for fix.
- **Minor**: Improvement backlog item; does not block launch.

---

## Acceptance Test Matrix

### 1) Lead List (AMC_OS/LEADS/*)
| Test ID | Severity | Acceptance Criterion | Verification Method | Pass Condition |
|---|---|---|---|---|
| LL-01 | Critical | Every lead has ICP segment tag (e.g., SMB, Mid-Market, Agency) | Spot-check 20 rows or full set if <20 | 100% rows include valid ICP tag |
| LL-02 | Critical | Every lead has trigger/event tag (hiring, funding, tool switch, launch, etc.) | Data scan on trigger field | 100% rows populated with meaningful trigger |
| LL-03 | Critical | Every lead includes next step and owner | Review columns for next action + owner | No blank next-step/owner cells |
| LL-04 | Major | Contact fields are actionable (name + role + company + channel) | Random sample 15 rows | ≥90% actionable completeness |
| LL-05 | Major | No duplicate leads by domain/company | Deduplicate check | Duplicate rate ≤5% |
| LL-06 | Major | Prioritization present (tier/score) | Check scoring/tier column | 100% rows scored |
| LL-07 | Minor | Last-updated timestamp exists | Check date column | ≥95% rows have last-updated date |

### 2) Offer (AMC_OS/SALES/OFFERS.md or equivalent)
| Test ID | Severity | Acceptance Criterion | Verification Method | Pass Condition |
|---|---|---|---|---|
| OF-01 | Critical | Offer names target ICP explicitly | Content review | ICP clearly stated per offer |
| OF-02 | Critical | Scope and deliverables are explicit and bounded | Clause review | No ambiguous “done-for-you everything” language |
| OF-03 | Critical | Timeline/milestones included | Review timeline section | Start-to-finish cadence defined |
| OF-04 | Critical | Pricing is explicit (fee structure + payment terms) | Pricing review | No missing price/term elements |
| OF-05 | Critical | Exclusions and assumptions listed | Legal/ops review | Clear out-of-scope and assumptions section |
| OF-06 | Major | Risk reversal/guarantee claims are compliant and non-deceptive | Claims check | No guaranteed revenue/income claims |
| OF-07 | Major | Proof assets mapped to offer (case study, testimonial, benchmark) | Proof mapping check | Each offer has at least one proof element |

### 3) Landing Page (AMC_OS/MARKETING/*landing* or equivalent)
| Test ID | Severity | Acceptance Criterion | Verification Method | Pass Condition |
|---|---|---|---|---|
| LP-01 | Critical | Narrative flow: Problem → Offer → Proof → CTA | Visual/content audit | All 4 blocks clearly present |
| LP-02 | Critical | Primary CTA is unambiguous and singular per screen section | UX review | CTA text specific; no conflicting primary CTAs |
| LP-03 | Critical | Claims are truthful, specific, and compliant | Claims audit | No unverifiable superlatives or guarantee claims |
| LP-04 | Major | Message matches ICP pains and desired outcomes | ICP-message mapping | Top 3 pains addressed with benefit statements |
| LP-05 | Major | Basic trust stack present (proof, FAQ, objection handling) | Section audit | At least 2 trust mechanisms live |
| LP-06 | Major | Form friction controlled (required fields minimized) | Form review | Only essential fields required |
| LP-07 | Minor | Tracking readiness (CTA event naming plan documented) | Analytics check | Event names for primary CTA documented |

### 4) Proposal (AMC_OS/SALES/PROPOSAL_TEMPLATE.md or client proposal files)
| Test ID | Severity | Acceptance Criterion | Verification Method | Pass Condition |
|---|---|---|---|---|
| PR-01 | Critical | Objective and business outcome defined | Proposal review | Outcome statement measurable and client-specific |
| PR-02 | Critical | Scope, deliverables, and acceptance criteria included | Section audit | All three sections present and concrete |
| PR-03 | Critical | Timeline and milestones included | Timeline audit | Milestones and dates present |
| PR-04 | Critical | Fees, billing schedule, and validity window included | Commercial check | Full commercial block present |
| PR-05 | Critical | Terms/assumptions/dependencies included | Contract readiness check | No missing legal/ops dependency statements |
| PR-06 | Major | Risks and mitigation steps documented | Risk section audit | At least top 3 risks with mitigation |
| PR-07 | Major | Success metrics + reporting cadence defined | Metrics review | KPI list and reporting frequency present |

### 5) Roadmap (AMC_OS/PRODUCT/*roadmap* or strategy files)
| Test ID | Severity | Acceptance Criterion | Verification Method | Pass Condition |
|---|---|---|---|---|
| RM-01 | Critical | Initiatives are prioritized by Impact/Confidence/Effort (or equivalent) | Prioritization audit | Every initiative has ICE-style score |
| RM-02 | Critical | Milestones and target dates defined | Milestone review | Time-bound plan visible |
| RM-03 | Critical | Owner assigned for each initiative | Ownership check | No unowned initiative |
| RM-04 | Major | Dependencies and sequencing are explicit | Dependency mapping review | Cross-functional dependencies listed |
| RM-05 | Major | Success metrics tied to each milestone | KPI audit | Each milestone has measurable outcome |
| RM-06 | Major | Risks/blockers tracked with mitigation owner | Risk register review | Top risks + owners listed |
| RM-07 | Minor | Review cadence (weekly/biweekly) defined | Governance check | Cadence documented |

---

## QA Evidence Log Template
Use this format in review notes or PR comments:

- Deliverable:
- Version/Date:
- Reviewer:
- Tests Run:
- Failed Tests:
- Exceptions Approved (if any):
- Release Decision: Pass / Conditional Pass / Fail

---

## Exit Criteria
A deliverable is **quality-gate approved** only when:
- All **Critical** tests pass
- Any **Major** exception has owner + remediation date
- Decision and evidence are logged

---

Files created/updated: AMC_OS/OPS/QUALITY_GATE_CHECKS.md  
Acceptance checks: Matrix includes explicit criteria, method, and pass condition for lead list, offer, landing page, proposal, roadmap.  
Next actions:
1. Apply matrix to current live assets and log first QA pass/fail report.
2. Add a recurring weekly QA review slot in ops cadence.
3. Convert recurring failed checks into SOP updates.
Risks/unknowns:
- Existing artifacts may not yet include all required metadata fields.
- Current naming conventions differ across folders; may need standardization for automated QA.