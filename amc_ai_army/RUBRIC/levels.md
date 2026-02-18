# AMC Maturity Rubric — Levels 0–5 (Evidence-First)

Use this scale for each dimension in `dimensions.md`.

## Universal Level Anchors

### Level 0 — Absent / Unknown
- No reliable evidence the capability exists.
- Activities are ad hoc or not performed.
- No owner, no baseline, no controls.

### Level 1 — Initial / Reactive
- Basic practices exist, mostly manual and inconsistent.
- Evidence is anecdotal or one-off.
- Issues are handled after impact; prevention is weak.

### Level 2 — Defined / Repeatable in Pockets
- Documented practices and named owners exist.
- Some repeatability, but uneven adoption across teams/systems.
- Limited instrumentation and weak enforcement.

### Level 3 — Managed / Enforced Baseline
- Standardized controls are broadly implemented and enforced.
- Metrics are tracked regularly and influence operational decisions.
- Incidents/evaluation outcomes feed into corrective workflows.

### Level 4 — Quantitatively Controlled / Predictable
- Capability is measured end-to-end with reliable leading indicators.
- Forecasts are reasonably accurate; variance is actively managed.
- Automated guardrails reduce reliance on manual intervention.

### Level 5 — Optimizing / Continuously Improving
- Continuous improvement loops are institutionalized and evidenced.
- Tradeoffs (safety/reliability/cost/speed) are explicitly optimized.
- System adapts quickly to drift, threats, and context changes.

---

## Dimension-Specific Evidence Requirements by Level

> Score only to the highest level where evidence is **current, repeatable, and operationally proven**.

### 1) Governance
- **L0:** No decision rights or policy records.
- **L1:** Informal ownership; approvals happen via chat/email without auditability.
- **L2:** Ownership and policy docs exist; exceptions tracked inconsistently.
- **L3:** Versioned policy + enforceable approval workflow + auditable overrides.
- **L4:** Governance KPIs (exception aging, control effectiveness) drive interventions.
- **L5:** Policy effectiveness continuously tuned from incidents/evals; near-real-time control adaptation.

### 2) Safety
- **L0:** No defined safety controls or threat model.
- **L1:** Basic checks exist but are bypassable/unverified.
- **L2:** Threat scenarios documented; partial runtime safeguards.
- **L3:** Adversarial testing integrated; critical controls enforced with closure SLAs.
- **L4:** Safety telemetry predicts emerging risk; automated containment is reliable.
- **L5:** Continuous red-teaming + adaptive controls materially reduce severe event rate over time.

### 3) Reliability
- **L0:** No SLOs/SLIs; outages unmanaged.
- **L1:** Reactive firefighting; sparse incident documentation.
- **L2:** SLOs defined for key services; partial incident process.
- **L3:** Error budgets and resilience tests influence release/rollback decisions.
- **L4:** Reliability behavior is predictable under stress; automated recovery common.
- **L5:** Reliability improvements are systematic, with declining recurrence and strong degradation design.

### 4) Evaluation
- **L0:** No consistent evaluation framework.
- **L1:** Infrequent/manual tests; subjective acceptance.
- **L2:** Core benchmark set exists but limited coverage/versioning.
- **L3:** Versioned eval suite (including adversarial) gates releases.
- **L4:** Eval metrics correlate with production outcomes; drift and calibration tracked.
- **L5:** Continuous eval synthesis and feedback loops optimize decision quality and risk posture.

### 5) Observability
- **L0:** Minimal logs/metrics; no usable diagnostics.
- **L1:** Basic monitoring; high blind-spot and alert noise.
- **L2:** Standard telemetry in key areas; traceability incomplete.
- **L3:** End-to-end observability with actionable alerts and runbook linkage.
- **L4:** High-fidelity causal diagnostics; low-noise alerting with measured quality.
- **L5:** Observability enables proactive anomaly prevention and fast forensic reconstruction at scale.

### 6) Cost
- **L0:** Cost unknown/untracked.
- **L1:** Aggregate spend visible only after-the-fact.
- **L2:** Partial attribution and periodic reviews.
- **L3:** Unit economics tracked; budget controls and anomaly alerts active.
- **L4:** Forecasting and optimization experiments are routine and measurable.
- **L5:** Real-time value-aware optimization keeps cost efficient without degrading safety/reliability.

### 7) Operating Model
- **L0:** No defined operating cadence.
- **L1:** Hero-driven execution; unclear escalation.
- **L2:** Basic rituals/runbooks exist; adoption inconsistent.
- **L3:** Cross-functional operating rhythm is reliable; canary/rollback/on-call are practiced.
- **L4:** Delivery and incident response are predictable with measurable flow efficiency.
- **L5:** Learning organization behavior: rapid feedback-to-change loops, low key-person risk, sustained performance gains.

---

## Evidence Confidence and Scoring Guardrails

Apply a confidence modifier to each dimension score:

- **High confidence:** Multiple independent artifacts, recent, production-linked.
- **Medium confidence:** Adequate evidence but incomplete coverage or staleness risk.
- **Low confidence:** Sparse, self-reported, or contradictory evidence.

### Guardrails
- Missing critical evidence item → cap at **Level 2**.
- No proof of enforcement/operation (only documentation) → cap at **Level 1**.
- Repeated critical incidents without corrective closure → cannot exceed **Level 2** in affected dimensions.
- Level 5 requires at least two consecutive assessment cycles showing sustained improvement.

---

## Suggested Scoring Output Format

For each dimension, report:
1. **Level (0–5)**
2. **Confidence (High/Medium/Low)**
3. **Key evidence cited** (artifact IDs/links/timestamps)
4. **Primary limiting factor**
5. **Next evidence-backed improvement action**

This keeps scoring auditable and action-oriented.