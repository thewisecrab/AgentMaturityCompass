# AMC Compass Sprint — Scoring Guide (1–5)

Use this guide to assign consistent maturity scores and required evidence for each question in `RUBRIC/questions.md`.

## Maturity levels (applies to every question)

### Level 1 — Ad Hoc / Hero-Dependent
**Definition**
- Work is inconsistent, reactive, and person-dependent.
- Limited documentation; outcomes vary by individual effort.

**Typical signals**
- "We mostly do this manually / differently each time."
- No stable ownership or cadence.
- Few/no trusted metrics.

**Minimum evidence expected**
- Interview notes and observable examples showing inconsistency
- Absence of SOPs, dashboards, or control mechanisms

---

### Level 2 — Emerging / Basic Repeatability
**Definition**
- Some workflows and controls exist, but coverage is partial and fragile.
- Early tooling or documentation present; adoption uneven.

**Typical signals**
- SOP drafts exist for some processes.
- Metrics can be produced, often with manual effort.
- Ownership exists but is not reliably enforced.

**Minimum evidence expected**
- Partial SOPs/checklists
- Isolated dashboards/reports (manual reconciliation common)
- Examples of process followed in some teams but not others

---

### Level 3 — Defined / Managed Baseline
**Definition**
- Core processes are documented, owned, and followed across most of scope.
- Baseline metrics are available and used in regular operating reviews.

**Typical signals**
- Clear owner per workflow with handoff definitions.
- Most required data fields/process steps are consistently applied.
- Routine performance review cadence (weekly/biweekly/monthly).

**Minimum evidence expected**
- Current SOP repository (dated/versioned)
- KPI dashboard with baseline + trend for key workflows
- Meeting artifacts showing decisions tied to metrics

---

### Level 4 — Integrated / Predictable at Scale
**Definition**
- Systems, controls, and teams are integrated; outcomes are predictable.
- Automation and governance are reliable, measured, and proactively managed.

**Typical signals**
- Cross-system workflows run with minimal manual rework.
- Exceptions and incidents are handled via defined playbooks.
- Change management and enablement are systematic.

**Minimum evidence expected**
- Integration maps, automation logs, and alerting ownership
- Incident register with response/closure SLAs
- Training completion + adoption telemetry
- Consistent KPI improvements across teams/locations

---

### Level 5 — Optimized / Continuous Improvement Engine
**Definition**
- Organization continuously improves via experimentation and compounding learning.
- Decisions are evidence-first; optimization is embedded in operating rhythm.

**Typical signals**
- Structured experiment pipeline with measurable impact.
- Rapid feedback loops from frontline to leadership.
- Reusable playbooks/templates deployed across functions.

**Minimum evidence expected**
- Experiment backlog with hypotheses, results, and decision outcomes
- Quarterly/ongoing optimization roadmap tied to business KPIs
- Demonstrated sustained KPI lift (not one-off wins)
- Governance updates based on observed risks/performance

---

## Evidence quality rules
For every scored question, tag evidence as:
- **High confidence:** direct artifact + recent timestamp + system-verifiable
- **Medium confidence:** artifact exists but outdated/partial OR only one system proof
- **Low confidence:** self-reported; no verifiable artifact

If confidence is Low, score conservatively (typically cap at 2 unless strong corroboration exists).

---

## Domain-specific evidence examples

### A) Strategy & Business Alignment
- Annual/quarterly plan, OKRs, initiative charter, ROI model, steering meeting notes

### B) Process Standardization & SOP Quality
- SOP library, RACI, process maps, handoff checklists, exception playbooks, QA rubrics

### C) Data Quality & Instrumentation
- Data dictionary, field completeness reports, dashboard screenshots, metric definitions, audit samples

### D) Tooling & Systems Integration
- Architecture/integration diagram, workflow automation logs, monitoring alerts, incident tickets

### E) Governance, Risk & Security
- Policy docs, access reviews, approval workflows, risk register, incident postmortems

### F) Team Adoption, Enablement & Change Readiness
- Training curriculum, attendance/completion records, adoption dashboards, feedback tickets/surveys

### G) Performance Management & Continuous Improvement
- KPI scorecards, experiment tracker, retrospective notes, prioritization backlog, roadmap updates

---

## Scoring procedure (recommended)
1. Score each question 1–5 with an evidence note.
2. Record confidence level (High/Medium/Low).
3. Compute domain averages excluding N/A.
4. Flag any domain with:
   - average < 3, or
   - >40% questions at Low confidence.
5. Convert findings to 90-day plan:
   - **Stabilize:** fix Level 1–2 blockers in high-impact workflows
   - **Systematize:** move Level 2–3 to repeatable cross-team execution
   - **Optimize:** run targeted experiments where Level 3+ foundations exist

---

## Quick interpretation bands
- **1.0–1.9:** Critical foundation gaps (high execution risk)
- **2.0–2.9:** Early maturity; needs standardization before scale
- **3.0–3.6:** Operationally viable baseline; selective scale possible
- **3.7–4.4:** Strong system maturity; predictable performance
- **4.5–5.0:** Optimization-led organization with continuous compounding

Use interpretation bands with evidence confidence; avoid over-claiming maturity when verification is weak.
