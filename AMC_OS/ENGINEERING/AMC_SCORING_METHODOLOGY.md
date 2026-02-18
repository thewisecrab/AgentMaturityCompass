# AMC Scoring Methodology
_Version 1.0 — INNO_AI_AGENT_RND | 2026-02-18_

> **Purpose:** Define how AMC scores AI agent maturity across each dimension — what counts as evidence, how scores are calculated, how gaming is prevented, and how uncertainty is handled. This is an original synthesis, not a copy of any single framework.

---

## 1. Philosophical Foundations

AMC scoring is grounded in three principles borrowed and adapted from existing frameworks:

| Principle | Source Inspiration | AMC Application |
|---|---|---|
| Evidence over attestation | NIST AI RMF "Measure" function | Scores require demonstrable artifacts, not self-declared compliance |
| Risk-tiered scrutiny | EU AI Act risk classification | Higher-stakes agent deployments receive heavier evidence burdens |
| Continuous maturity, not binary pass/fail | MLOps Maturity Model (Google/Microsoft) | Scores exist on a 1–5 continuum; partial credit reflects real state |

**Critical departure from existing frameworks:** NIST AI RMF and ISO 42001 are governance *frameworks*, not scoring systems. MLOps maturity models focus on model pipelines, not deployed autonomous agents. The EU AI Act is compliance law, not operational rubric. AMC synthesizes insights from all of these into a *scoring instrument* purpose-built for teams shipping agentic AI systems.

---

## 2. Scoring Dimensions

AMC evaluates seven dimensions. Each is scored 1–5. The overall AMC Maturity Score (AMS) is a weighted average.

### Dimension Map

| # | Dimension | Weight | What It Measures |
|---|---|---|---|
| D1 | **Agent Architecture & Design** | 15% | System decomposition, tool use controls, blast radius limits |
| D2 | **Observability & Monitoring** | 18% | Logging depth, alerting, trace coverage, anomaly detection |
| D3 | **Safety & Alignment Controls** | 20% | Guardrails, refusal logic, human-in-the-loop gates, red-teaming |
| D4 | **Data & Context Governance** | 15% | RAG hygiene, prompt injection controls, data provenance |
| D5 | **Deployment & Change Management** | 12% | CI/CD for prompts, rollback capabilities, canary patterns |
| D6 | **Security Posture** | 12% | Secrets management, tool permission scoping, supply chain |
| D7 | **Organizational Readiness** | 8% | Ownership clarity, incident response, AI literacy of team |

> **Weight rationale:** Safety/Alignment (D3) and Observability (D2) carry highest weight because failures there are least recoverable and most reputationally damaging. Organizational Readiness (D7) carries least because it is most gameable with documentation alone.

---

## 3. The 5-Level Maturity Scale

Each dimension maps to one of five maturity levels. Levels are defined behaviorally (what the team *does*), not documentarily (what they *say*).

### Universal Level Definitions

| Level | Label | Behavioral Description |
|---|---|---|
| **1 — Ad Hoc** | Reactive | No repeatable process. Issues discovered post-incident. Team relies on individual heroics. |
| **2 — Defined** | Intentional | Processes documented but not consistently followed. Some tooling in place. Coverage is partial. |
| **3 — Managed** | Measured | Processes followed consistently. Metrics tracked. Deviations trigger review. |
| **4 — Optimizing** | Data-Driven | Continuous improvement loop active. Metrics drive decisions. Automated feedback cycles. |
| **5 — Resilient** | Adaptive | System self-corrects. Failure modes predicted and pre-empted. External validation in place. |

---

## 4. Evidence Types and Hierarchy

Not all evidence is equal. AMC uses a three-tier evidence hierarchy:

### Tier 1 — Verified Artifacts (Highest Trust)
- Live system demonstration (assessor observes, not client shows)
- CI/CD pipeline logs with timestamps
- Monitoring dashboards with real data
- Incident post-mortems with timeline and resolution
- Code review artifacts (PR diffs, test coverage reports)

### Tier 2 — Documented Artifacts (Medium Trust)
- Architecture diagrams with version history
- Runbooks and SOPs with last-updated dates
- Test results (unit, integration, red-team)
- Security scan outputs (SAST, dependency audits)
- Vendor contracts with relevant SLAs

### Tier 3 — Attestations (Lower Trust, Require Corroboration)
- Verbal claims in interviews
- Self-assessment questionnaires
- Undated policy documents
- "We plan to..." statements

**Rule:** A score of 3 or higher requires at least one Tier 1 artifact per sub-dimension. Level 4 or 5 requires multiple Tier 1 artifacts showing consistency over time.

---

## 5. Dimension-by-Dimension Scoring Rubrics

### D1 — Agent Architecture & Design

| Level | Evidence Required |
|---|---|
| 1 | Agent is a single monolithic prompt with no boundary controls |
| 2 | Agent decomposed into steps; tool list exists but not enforced at runtime |
| 3 | Tools scoped to minimum necessary; blast radius documented; human approval gates for irreversible actions |
| 4 | Architecture reviewed against threat model; automated contract testing between agent and tools |
| 5 | Formal verification or extensive adversarial simulation; blast-radius limits enforced programmatically |

**Key sub-dimensions:** tool scoping, reversibility awareness, context window integrity, agent-to-agent trust boundary (for multi-agent systems)

---

### D2 — Observability & Monitoring

Inspired by: OpenTelemetry standards, MLOps monitoring best practices, NIST AI RMF "Measure" function.

| Level | Evidence Required |
|---|---|
| 1 | Logs exist but are unstructured; no alerting |
| 2 | Structured logs; basic uptime alerting; manual review of outputs |
| 3 | Trace IDs on every agent action; token-level cost tracking; latency SLOs defined and monitored |
| 4 | Behavioral drift detection; automated anomaly flagging; output quality metrics tracked over time |
| 5 | Real-time feedback loop from outputs to model/prompt improvement; shadow mode testing |

**Key metrics to observe:** action entropy (unexpectedly varied actions), refusal rates, tool call frequency, output confidence distribution, user escalation rates.

---

### D3 — Safety & Alignment Controls

Directly addresses OWASP LLM Top 10 risks (LLM01–LLM10) and EU AI Act Article 9 (risk management system).

| Level | Evidence Required |
|---|---|
| 1 | No guardrails; model output used directly |
| 2 | Basic content filtering; some hard-coded restrictions |
| 3 | Input/output guardrails in production; at least one structured red-team exercise documented |
| 4 | Automated adversarial testing in CI; human-in-the-loop gates for high-stakes actions; refusal rate monitored |
| 5 | Continuous red-teaming program; external alignment audit; constitutional AI or equivalent documented |

**Key sub-dimensions:** prompt injection resistance, output validation, HITL gate design, refusal logic coverage, adversarial test coverage.

---

### D4 — Data & Context Governance

Addresses EU AI Act data governance requirements and OWASP LLM03 (Training Data Poisoning) / LLM06 (Sensitive Information Disclosure).

| Level | Evidence Required |
|---|---|
| 1 | RAG data source unknown or undocumented; no data versioning |
| 2 | Data sources listed; basic PII scrubbing |
| 3 | Data provenance tracked; prompt templates versioned; context injection reviewed for injection risk |
| 4 | Automated data quality checks; RAG retrieval relevance monitored; data refresh SLA met |
| 5 | Formal data lineage; independent data quality audit; context poisoning attack simulations performed |

---

### D5 — Deployment & Change Management

Inspired by: Google MLOps Maturity Level 0–3, Accelerate (DORA) metrics.

| Level | Evidence Required |
|---|---|
| 1 | Prompts edited directly in production; no version control |
| 2 | Prompts in source control; manual deployment |
| 3 | Prompt CI/CD pipeline; staging environment; rollback procedure documented and tested |
| 4 | Canary or shadow deployment for prompt changes; automated regression tests gate deployments |
| 5 | Blue/green agent deployments; behavioral regression suite; deployment linked to monitoring SLOs |

---

### D6 — Security Posture

Aligned with: OWASP LLM Top 10, NIST CSF 2.0, NIST AI RMF Govern function.

| Level | Evidence Required |
|---|---|
| 1 | API keys in plaintext; no access controls on agent tools |
| 2 | Secrets in environment variables; basic IAM |
| 3 | Secrets manager in use; tool permissions scoped to principle of least privilege; dependency audit scheduled |
| 4 | Automated secrets scanning in CI; SBOM for AI dependencies; penetration test completed |
| 5 | Continuous vulnerability management; third-party security audit; supplier AI risk assessment documented |

---

### D7 — Organizational Readiness

| Level | Evidence Required |
|---|---|
| 1 | No clear owner; AI decisions made ad hoc |
| 2 | Owner named; informal incident response |
| 3 | AI incident response runbook exists and tested; team trained on AI-specific risks |
| 4 | AI governance committee; regular review cadence; escalation path documented |
| 5 | Board-level AI risk visibility; AI literacy program; external AI ethics review |

---

## 6. Composite Score Calculation

```
AMS = Σ (Dimension Score × Dimension Weight)

Example:
D1=3, D2=2, D3=2, D4=3, D5=2, D6=2, D7=3
AMS = (3×0.15)+(2×0.18)+(2×0.20)+(3×0.15)+(2×0.12)+(2×0.12)+(3×0.08)
AMS = 0.45+0.36+0.40+0.45+0.24+0.24+0.24
AMS = 2.38 → "Early Defined" zone
```

### Score Bands

| AMS Range | Label | Recommended Action |
|---|---|---|
| 1.0–1.9 | **Red — Ad Hoc** | Immediate remediation; do not scale agent |
| 2.0–2.9 | **Amber — Developing** | Targeted improvements in highest-weight dims before scale |
| 3.0–3.9 | **Yellow — Managed** | Systematize; focus on automation and measurement |
| 4.0–4.9 | **Green — Optimizing** | Continuous improvement; prepare for external audit |
| 5.0 | **Blue — Resilient** | Maintain + share knowledge; publish case study |

---

## 7. Anti-Gaming Controls

Gaming risk is real: teams may inflate scores by producing artifacts just for assessment. Controls:

### 7.1 Temporal Triangulation
Evidence must show *history*, not just current state. Example: CI pipeline logs must show multiple runs over weeks, not just one created before the assessment.

### 7.2 Spot-Check Protocol
Assessors randomly request live system access during the sprint. No advance notice for specific checks.

### 7.3 Cross-Witness Interviews
Multiple team members interviewed independently. Inconsistencies logged as "attestation discrepancy" and lower-weight evidence is applied.

### 7.4 Artifact Authenticity Signals
- File creation/modification timestamps reviewed
- Commit history checked (was the runbook committed 2 days before the sprint?)
- Infrastructure-as-code diffs reviewed against stated policies

### 7.5 Dimension Correlation Checks
Certain dimensions are expected to correlate. A team at Level 4 in D5 (Deployment) but Level 1 in D2 (Observability) is flagged as anomalous and receives additional scrutiny.

### 7.6 Scoring Confidence Tag
Each dimension score receives a confidence tag: **High / Medium / Low**. Low confidence means evidence was thin or inconsistent. The final report surfacing confidence levels to the client creates a natural incentive for them to *have* good evidence, not just claim it.

---

## 8. Handling "We Don't Know"

Many teams, especially early-stage, genuinely lack visibility into their own systems. AMC has a principled approach:

### 8.1 The Unknown Inventory
At the start of every sprint, teams complete an "Unknown Inventory" — a structured acknowledgment of what they cannot currently measure. This is **not penalized**. It is used to:
- Set a baseline for the "unknown score"
- Identify highest-priority unknowns to resolve in the sprint
- Prevent false confidence

### 8.2 Epistemic Discount
If a team cannot demonstrate evidence for a sub-dimension but does not contradict it either, the default assigned is **Level 1.5** (halfway between Ad Hoc and Defined). This is lower than the optimistic default most frameworks use (which is Level 2), reflecting AMC's evidence-over-attestation philosophy.

**Rationale:** Unknown ≠ Good. If you don't know whether you have prompt injection controls, you probably don't.

### 8.3 The "Measure Before You Manage" Recommendation
Any dimension scoring below 2 due to unknown evidence receives a specific recommendation: establish measurement before implementing controls. Measuring the gap is often more valuable than speculative controls.

### 8.4 Declared Unknowns as Positive Signal
A team that proactively identifies three critical unknowns and has a plan to resolve them gets +0.3 uplift on D7 (Organizational Readiness) score, because self-awareness is a genuine organizational capability.

---

## 9. Multi-Agent and Agentic System Considerations

Standard maturity models assume monolithic models. AMC adds three overlay considerations for multi-agent architectures:

### 9.1 Trust Boundary Scoring
For each agent-to-agent interface: is there authentication? Is the receiving agent validating inputs? Are there privilege escalation controls?

### 9.2 Blast Radius Compounding
In multi-agent systems, failures compound. AMC scores the maximum potential blast radius at the system level, not individual agent level. A single Level 1 agent in a chain can drag the system AMS down.

### 9.3 Orchestration Control Plane
Is there a human-accessible control plane for the entire agent mesh? Can you pause a workflow mid-execution? This is scored as a D3/D1 hybrid sub-dimension.

---

## 10. Scoring Session Protocol

| Phase | Duration | Activity |
|---|---|---|
| Pre-Sprint Intake | 30 min | Team completes Unknown Inventory + Evidence Pre-Load form |
| Evidence Review | 2 hrs | Assessor reviews Tier 1/2 artifacts async |
| Live System Walk | 90 min | Spot-checks, live demo of key controls |
| Stakeholder Interviews | 60 min | 3–4 independent interviews across engineering, product, ops |
| Scoring Calibration | 45 min | Assessor scores dimensions with confidence tags |
| Draft Readout | 45 min | Client sees draft scores; clarifications invited |
| Final Report | 24 hrs post-sprint | Final AMC report delivered |

---

## 11. Calibration and Inter-Rater Reliability

(See also: EVAL_BENCHMARK_FRAMEWORK.md)

- All AMC assessors complete a **calibration case** — a synthetic team scenario scored independently, then compared to the master score key
- Assessors must achieve Cohen's κ ≥ 0.70 before solo assessments
- Quarterly calibration refreshes required
- Score disagreements > 1 point on any dimension are escalated to senior review

---

## 12. Evolution Protocol

This methodology is versioned. Version increments trigger when:
- A new framework (e.g., EU AI Act implementing acts) creates new scoring requirements
- 5+ client assessments reveal a systematic blind spot
- An internal red-team identifies a gaming vector not currently controlled

---

## Files Created/Updated
- `AMC_OS/ENGINEERING/AMC_SCORING_METHODOLOGY.md` (this file)

## Acceptance Checks
- [ ] All 7 dimensions have a 5-level rubric with behavioral evidence descriptors
- [ ] Weights sum to 100%
- [ ] Anti-gaming section has ≥5 distinct controls
- [ ] "We don't know" handling is non-punitive but evidence-anchored
- [ ] At least 4 external frameworks referenced with original synthesis

## Next Actions
1. REV_TECH_LEAD to review and validate D5 deployment rubric against actual client tech stacks seen
2. REV_QA_LEAD to peer-review the scoring protocol for consistency
3. Create scoring worksheet template (Excel/Notion) implementing the weighted AMS formula
4. Pilot the Unknown Inventory form with first Compass Sprint client
5. Commission calibration case library (3 synthetic team scenarios at Low/Mid/High AMS)

## Risks/Unknowns
- Weight assignments are based on first-principles reasoning, not empirical data — should be validated after 5+ assessments
- "Spot check" protocol assumes client grants live system access; need fallback if refused
- Multi-agent overlay is nascent — may need revision as agentic patterns mature
- Assessor calibration requires investment in case library that doesn't yet exist
