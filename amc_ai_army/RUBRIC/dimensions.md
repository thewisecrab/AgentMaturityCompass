# AMC Maturity Rubric — Dimensions (Evidence-First)

This rubric is for scoring AMC capability maturity using **verifiable evidence**, not plans or claims.

## Scoring Principles (Apply to every dimension)

1. **Evidence over intent**
   - Score only what is demonstrated in artifacts, logs, tests, or observed operations.
   - Roadmaps, policy docs, and verbal statements count as context, not proof.

2. **Most-recent, production-relevant evidence**
   - Prefer evidence from the last 90 days and from production or production-like environments.
   - Stale evidence should be down-weighted.

3. **Triangulation required**
   - Target at least 2 independent evidence types (e.g., policy + telemetry, runbook + incident record).

4. **Fail-closed for missing evidence**
   - If evidence is absent, contradictory, or unverifiable, score at the lower level.

5. **Weakest-link within dimension**
   - A dimension score should reflect its limiting sub-capability (not the best-looking artifact).

6. **Repeatability threshold**
   - One-off success is not maturity. Evidence must show repeatable operation over time.

---

## Dimension 1: Governance

**What it measures:** Decision rights, policy control, accountability, and traceability of changes.

**Look for evidence:**
- RACI / ownership registry with current accountable owners
- Versioned policy controls and change approvals
- Exception process with expiry and review
- Decision logs linking policy changes to outcomes
- Audit trail for approvals and overrides

**Strong signals:**
- Policy-as-code with enforced gates
- Time-bounded waivers with closure rate tracking
- Regular governance review cadence with actions completed

**Anti-signals:**
- Undefined ownership
- Backdoor overrides without records
- Approval theater (sign-offs with no enforcement)

---

## Dimension 2: Safety

**What it measures:** Prevention, detection, and containment of harmful or non-compliant system behavior.

**Look for evidence:**
- Threat models and abuse cases mapped to controls
- Red-team / adversarial test results with remediation closure
- Runtime guardrails (policy checks, tool restrictions, fail-safe defaults)
- Incident records and postmortems with corrective actions
- Sensitive action controls (approval thresholds, segregation)

**Strong signals:**
- Blocking controls tested and verified in production-like runs
- Measured reduction in unsafe outcomes release-over-release
- Explicit kill-switch / rollback exercised in drills

**Anti-signals:**
- Safety checks only in docs, not in runtime
- Open critical findings past SLA
- No proof of mitigation effectiveness

---

## Dimension 3: Reliability

**What it measures:** Stability, correctness, and resilience under normal and degraded conditions.

**Look for evidence:**
- SLO/SLI definitions and trend data
- Error budget tracking and policy-based release decisions
- Deterministic/reproducibility tests for critical paths
- Resilience testing (load, chaos, dependency failure)
- Incident frequency, MTTR, recurrence rates

**Strong signals:**
- Automated rollback/circuit breaking with measured impact
- Reliability improvements tied to engineering changes
- Controlled degradation modes with user impact limits

**Anti-signals:**
- No SLOs or ignored breaches
- Frequent regressions and repeated incidents
- Reliance on heroics instead of engineered reliability

---

## Dimension 4: Evaluation

**What it measures:** Quality of measurement, benchmark design, and decision use of evaluation results.

**Look for evidence:**
- Defined metric taxonomy (quality, safety, latency, cost, calibration)
- Versioned benchmark/scenario sets (including adversarial coverage)
- Offline + online evaluation linkage
- Pre/post release gate reports with pass/fail rationale
- Calibration and drift monitoring over time

**Strong signals:**
- Evaluation predicts production outcomes with tracked confidence
- Regression detection is timely and actionable
- Metrics are decision-driving, not vanity

**Anti-signals:**
- Cherry-picked benchmarks
- Metric gaming or untracked metric definition changes
- No mapping from eval outcomes to release decisions

---

## Dimension 5: Observability

**What it measures:** Visibility into behavior, causality, and diagnosability across system layers.

**Look for evidence:**
- Structured logs, traces, and metrics with consistent IDs
- End-to-end traceability across agents/tools/pipelines
- Alert quality metrics (precision, recall, noise rate)
- Dashboards tied to SLOs and runbooks
- Forensic readiness (retention, immutable logs, access audit)

**Strong signals:**
- Fast root-cause analysis from telemetry
- Actionable alerts with low noise
- Clear linkage between user-impact and internal signals

**Anti-signals:**
- Blind spots in critical components
- Alert fatigue without tuning loop
- Inability to reconstruct incidents

---

## Dimension 6: Cost

**What it measures:** Economic control, unit efficiency, and value-aware optimization.

**Look for evidence:**
- Unit economics (cost per request/task/outcome)
- Budget guardrails and anomaly detection
- Cost attribution by team, workload, and feature
- Performance-cost tradeoff experiments
- Forecast accuracy vs actuals

**Strong signals:**
- Cost is measurable at decision granularity
- Optimizations preserve quality/safety constraints
- Budget breach response is automated and timely

**Anti-signals:**
- Spend visibility only at aggregate monthly level
- Cost cuts that degrade reliability/safety unnoticed
- No tie between cost and delivered value

---

## Dimension 7: Operating Model

**What it measures:** How effectively teams, processes, and execution cadence deliver safe, reliable outcomes.

**Look for evidence:**
- Clear lifecycle from idea → build → evaluate → release → learn
- On-call model, escalation paths, and runbooks
- Defined release/canary/rollback practices
- Cross-functional rituals (eng, policy, risk, ops)
- Skill coverage, training, and succession depth

**Strong signals:**
- Predictable delivery with controlled change failure rate
- Fast learning loops from incidents and evaluations
- Low dependence on single individuals

**Anti-signals:**
- Process exists only as slideware
- Handoffs routinely fail
- Chronic bottlenecks or key-person risk

---

## Recommended Evidence Pack (for each assessment cycle)

- Last 90 days: incidents, postmortems, and corrective action closure report
- Current policy/control inventory and exception log
- SLO dashboard exports and reliability trend summary
- Evaluation reports (pre-release and in-production)
- Observability artifacts (dashboards, alert tuning metrics, trace samples)
- Cost report (unit economics + variance + optimization outcomes)
- Operating cadence artifacts (runbooks, on-call reviews, release retrospectives)

If any pack item is missing, note explicit confidence reduction and cap score accordingly.