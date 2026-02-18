# AMC Dimensions Framework

This framework is a practical maturity model for AI-agent operations. Scores are based on auditable evidence, not opinions.

> Levels: **L1 (Ad hoc)** → **L2 (Developing)** → **L3 (Defined)** → **L4 (Optimized)**

## 1) Governance

**What it measures (1 sentence):**
How clearly teams define who owns AI agents, what rules they follow, and how decisions are approved before and during use.

**Why buyers care (1 sentence):**
Clear governance reduces accidental risk, slows chaos, and gives leadership confidence to scale AI-agent use.

**L1 (ad hoc):**
No single owner for AI-agent decisions, no formal policy is documented, and teams run tools in isolated ways based on whoever set them up.

**L2 (developing):**
A basic owner list and some written agent usage rules exist, but they are inconsistent across teams and are updated only when an issue appears.

**L3 (defined):**
Governance is documented centrally, including ownership, approval paths, escalation rules, and required checks, and teams follow it in most routine workflows.

**L4 (optimized):**
Governance is actively managed with periodic reviews, role-based accountabilities, cross-team policy updates, and clear evidence that leadership decisions are based on current compliance metrics.

**3 interview questions:**
1. Who is responsible for approving new AI agent workflows, and how is that approval documented?
2. What happens when an agent output is wrong, unsafe, or out-of-policy?
3. When was the last governance rule changed, and who signed off on it?

**Evidence types that prove each level:**
- **L1:** scattered chat notes, ad-hoc setup docs, no central policy link.
- **L2:** shared ownership list, partial policy page, occasional decision records.
- **L3:** governance charter, role matrix, approval logs, quarterly review notes.
- **L4:** governance dashboard, policy change approvals, risk/incident trend reports, periodic board or leadership review summaries.

---

## 2) Security

**What it measures (1 sentence):**
How well teams protect sensitive data, prevent misuse, and keep AI-agent access and actions controlled.

**Why buyers care (1 sentence):**
Security gaps in AI agents can leak data or create unsafe automation quickly, so this directly affects trust and operational continuity.

**L1 (ad hoc):**
Access is informal, secrets are shared across channels, and no standard security checks are applied before agents are used.

**L2 (developing):**
Basic controls exist (password managers, basic access restrictions), but enforcement is uneven and security checks are not integrated into the AI workflow.

**L3 (defined):**
Standard security controls are consistently applied across agents: access levels, secret handling, logging, and model/data security checks for approved use cases.

**L4 (optimized):**
Security controls are automated and continuously monitored with role-based access, periodic red-team style tests, incident drill exercises, and documented remediation times.

**3 interview questions:**
1. Where are API keys, credentials, and secrets stored for agent integrations?
2. How do you currently detect and block unauthorized use of an AI agent account or tool?
3. How quickly can your team revoke access and patch a security issue involving an agent workflow?

**Evidence types that prove each level:**
- **L1:** informal credentials in docs/spreads, no rotation logs, no access policy evidence.
- **L2:** password manager usage, access list snapshots, basic audit logs.
- **L3:** role-based access policies, key rotation records, security checklist tied to each deployment.
- **L4:** SOC-style log aggregation, threat test reports, incident response runbooks with timestamps, remediation SLA evidence.

---

## 3) Reliability

**What it measures (1 sentence):**
How consistently AI agents run correctly over time, produce expected quality, and fail safely when something breaks.

**Why buyers care (1 sentence):**
If agent outputs are unstable, teams lose trust, and business processes become more error-prone.

**L1 (ad hoc):**
Agent failures are handled manually after user complaints, with no shared monitoring or recovery playbook.

**L2 (developing):**
Some checklists and smoke tests exist, but testing is inconsistent and recovery depends on available staff knowledge.

**L3 (defined):**
Release and run checklists are applied before each agent change, including rollback plans, and core failure cases are covered by shared runbooks.

**L4 (optimized):**
Reliability is measured as a service-level target with pre-defined fail-safes, automated health checks, and evidence-based improvements from incident reviews.

**3 interview questions:**
1. What is the most common way your team notices an agent failure?
2. Who decides whether an agent should be paused, rolled back, or fixed when quality drops?
3. What is your current mean time to recover from a failed automation run?

**Evidence types that prove each level:**
- **L1:** user-reported issue list, ad-hoc fixes in chat, missing postmortems.
- **L2:** test checklists, partial downtime logs, some runbooks.
- **L3:** release checklists, rollback procedure docs, incident response records with owners.
- **L4:** uptime/error-rate dashboard, automated test run history, RCA reports with trend-based action plans and completion status.

---

## 4) Evaluation

**What it measures (1 sentence):**
How systematically teams measure agent output quality, business impact, and bias/risk against clear success criteria.

**Why buyers care (1 sentence):**
Without evaluation, teams cannot separate useful automation from noise and cannot justify expansion or investment.

**L1 (ad hoc):**
Quality review is based on anecdotal feedback and no standard score is tracked for agent outcomes.

**L2 (developing):**
Teams track a few metrics, but definitions vary by team and scoring is not tied to shared baselines.

**L3 (defined):**
There is a shared scorecard with agreed metrics, periodic sample audits, and clear criteria for pass/fail or acceptable quality.

**L4 (optimized):**
Evaluation is continuous with control samples, segmentation by task type, and score-based decisions on whether to keep, improve, or retire an agent.

**3 interview questions:**
1. What metrics do you use to decide whether an agent is good enough to continue running?
2. How often are agent outputs sampled for review, and who approves the sample results?
3. Can you show a single example where poor evaluation changed a live process?

**Evidence types that prove each level:**
- **L1:** informal user feedback, one-off screenshots/comments, no periodic score record.
- **L2:** manual metric sheet, dashboard snapshots from one team, ad-hoc quality notes.
- **L3:** shared scorecard template, periodic audit logs, decision records from review meetings.
- **L4:** longitudinal evaluation reports, control-test dataset, correlation of scores with business outcomes, improvement cycle tracker.

---

## 5) Observability

**What it measures (1 sentence):**
How visible AI-agent activity and outcomes are to teams through logs, traces, and clear reporting.

**Why buyers care (1 sentence):**
Without observability, teams cannot diagnose issues, defend decisions, or trust AI agents in critical processes.

**L1 (ad hoc):**
Teams discover issues by complaints, with no single place to see agent activity or status.

**L2 (developing):**
Some dashboards or logs exist, but naming and retention standards differ by project and are incomplete.

**L3 (defined):**
A standard “single pane” view exists for key agents, including usage, failures, latency, and key decisions, with defined retention.

**L4 (optimized):**
Operational teams use cross-linked observability (logs + alerts + user feedback) to run proactive checks and pre-empt failures before impact.

**3 interview questions:**
1. What is your first place to check when an agent output looks wrong?
2. How long do you keep enough logs to explain an incident six months later?
3. Do you get alerts before users do when quality or usage deviates from normal?

**Evidence types that prove each level:**
- **L1:** fragmented logs, no single dashboard, incident evidence only in chat.
- **L2:** partial metric dashboards, inconsistent log naming, manual report exports.
- **L3:** standardized logging schema, centralized dashboard, retention policy, alert rules list.
- **L4:** alert-to-resolution chain, unified incident timeline from logs to business impact, regular observability review cadence.

---

## 6) Cost Efficiency

**What it measures (1 sentence):**
Whether teams understand and control the full cost of building, running, and maintaining AI-agent systems.

**Why buyers care (1 sentence):**
Cost-efficient AI lets teams grow automation without surprising cloud bills, hidden rework, or value erosion.

**L1 (ad hoc):**
Costs are only partially visible, often inferred at the end of a month, with no owner responsible for optimization.

**L2 (developing):**
Some cost visibility is in place (per team or tool), but optimization decisions are reactive and based on budget pressure.

**L3 (defined):**
Cost targets are assigned per use case, spending is reviewed on a regular cadence, and cost-to-value is estimated for major agents.

**L4 (optimized):**
Cost is continuously tracked against value delivered, with auto-alerts for overruns and explicit trade-off decisions for quality, speed, and expense.

**3 interview questions:**
1. Which dashboards or reports show AI spend by team, workflow, and model usage?
2. How do you decide when to switch models, throttle usage, or retire an agent for cost reasons?
3. Can you show a recent cost optimization action and its impact?

**Evidence types that prove each level:**
- **L1:** cloud invoice summary only, no cost tags, no owner.
- **L2:** partial spend reports, spot-cost fixes in backlog, informal savings notes.
- **L3:** tagged usage/cost reports, regular review minutes, value-per-cost comparisons for major automations.
- **L4:** budget guardrails, overage alert logs, experiment evidence showing cost-performance trade-offs and realized savings.

---

## 7) Operating Model

**What it measures (1 sentence):**
How the team runs AI-agent work end-to-end: roles, processes, training, and improvement loops from launch to next cycle.

**Why buyers care (1 sentence):**
A strong operating model turns AI from one-off experiments into repeatable capability that compounds over time.

**L1 (ad hoc):**
AI initiatives are project-to-project efforts without shared ownership or standard handoffs.

**L2 (developing):**
Some repeatable patterns exist (templates, checklists, role assignments), but they are not yet consistent across all teams or cycles.

**L3 (defined):**
A stable assessment-and-improvement workflow is used across teams, with owners, review cycles, and routine retrospectives.

**L4 (optimized):**
The operating model is fully integrated into normal planning and delivery; milestones, owners, and training are tied to measurable maturity gains.

**3 interview questions:**
1. Who owns the AI operating calendar (onboarding, reviews, reassessments) each quarter?
2. What happens to lessons learned after each incident or pilot?
3. How do new team members learn the full AI workflow from day one?

**Evidence types that prove each level:**
- **L1:** ad-hoc project docs, missing RACI, no shared cadence.
- **L2:** templates used in some teams, partial staffing map, irregular retrospectives.
- **L3:** published operating calendar, role matrix, recurring review cadence with action ownership.
- **L4:** integrated portfolio planning evidence, training completion tracking, continuous improvement backlog linked to maturity changes.

## Suggested scoring prompt for interviews
- Ask each team member the three questions under each domain.
- Score each domain L1–L4 based on shared artifacts first, then interview signals.
- Document evidence links directly with every point awarded.

---

**Files created/updated:**
- `AMC_OS/PRODUCT/AMC_DIMENSIONS_FRAMEWORK.md`

**Acceptance checks:**
1. Validate each domain has: what it measures, why buyers care, L1-L4 descriptions, 3 questions, and evidence per level.
2. Confirm language uses plain terms and examples a client can map to their own team.
3. Confirm all 7 domains requested are present and named exactly.

**Next actions:**
1. Review with REV_TECH_LEAD and REV_COO_ORCH for scoring alignment.
2. Add sample scoring rubrics into any existing scoring engine schema.
3. Collect 1–2 real customer examples per domain to ground-check level language.

**Risks/unknowns:**
- Missing product-specific weighting between domains may make final composite score interpretation inconsistent.
- Evidence conventions may vary by industry, requiring optional domain-specific evidence examples.
- Current framework is language-first; automation logic still needs mapping into the exact tool’s required schema.