# AMC Dimensions Framework v2

This is the v2 maturity framework used for AMC Score scoring **plus** the platform implementation path.

> Levels: **L1 (Ad hoc)** → **L2 (Developing)** → **L3 (Defined)** → **L4 (Optimized)**

## 0) Core principle

A team can claim a level only when evidence proves the current control state. For each transition, we now specify the **exact AMC module path** that accelerates that move.

**Source files used:**
- `AMC_OS/PRODUCT/PLATFORM_ARCHITECTURE_v2.md`
- `AMC_OS/PRODUCT/PRICING_MODEL.md`
- `AMC_OS/PRODUCT/AMC_DIMENSIONS_FRAMEWORK.md`

---

## 1) Governance

**What it measures (1 sentence):**
How clearly teams define ownership, decision rights, and approval workflows for agent systems.

**Why buyers care (1 sentence):**
Clear governance prevents chaos, role confusion, and unauthorized operational actions.

**L1 (ad hoc):**
No single owner for AI-agent decisions, no formal policy documented, teams operate independently.

**L2 (developing):**
Basic owner list and some written rules exist, but inconsistent and reactive updates.

**L3 (defined):**
Governance is documented centrally with ownership, approval paths, escalation, and required checks.

**L4 (optimized):**
Active policy operations with role-based accountabilities, periodic reviews, cross-team updates, and evidence-based leadership decisions.

### Transition map (Evidence + what gets you there)

- **L1→L2**
  - **Existing evidence:** role-owner list in docs, ownership sign-off for ad-hoc workflows.
  - **To reach L2:** add **E1 Tool Policy Firewall** (baseline policy templates) + **E6 Step-Up Authorization** (decision checkpoints) + **W2 Continuous Assurance** (policy drift reporting).

- **L2→L3**
  - **Existing evidence:** shared governance charter, escalation matrix, occasional review minutes.
  - **To reach L3:** add **W1 Signed Action Receipts** (traceability of approvals), **W2 Assurance Suite** (review cadence automation), and expand **E1 Tool Policy Firewall** with role-based policy blocks.

- **L3→L4**
  - **Existing evidence:** governance dashboard, monthly leadership reviews, approved policy version history.
  - **To reach L4:** add **W2 Assurance Suite** + **V2 DLP** for governance over sensitive data handling policies + **E6 Step-Up** for high-risk action approvals in production.

**3 interview questions:**
1. Who is responsible for approving new AI agent workflows, and how is approval documented?
2. What happens when an agent output is wrong, unsafe, or out-of-policy?
3. When was the last governance rule changed, and who signed off?

**Evidence types that prove each level:**
- **L1:** scattered chat notes, ad-hoc setup docs, no central policy link.
- **L2:** shared ownership list, partial policy page, occasional decision records.
- **L3:** governance charter, role matrix, approval logs, quarterly review notes.
- **L4:** governance dashboard, policy change approvals, board/leadership review summaries.

---

## 2) Security

**What it measures (1 sentence):**
How well teams control access, secrets, tool safety, and malicious behavior through systems.

**Why buyers care (1 sentence):**
Security failures in AI agents are usually high-speed and high impact.

**L1 (ad hoc):**
Informal access; shared or unmanaged secrets; minimal pre-deploy checks.

**L2 (developing):**
Basic controls exist, but uneven and not standardized in agent runtime.

**L3 (defined):**
Consistent security controls are applied across agents: access, secrets, logging, and checks.

**L4 (optimized):**
Automated continuous security posture with incident drills, threat tests, and measured response.

### Transition map (Evidence + what gets you there)

- **L1→L2**
  - **Existing evidence:** password manager use, occasional access snapshots.
  - **To reach L2:** deploy **S1 Skill Static Analyzer** + **S4 SBOM/CVE Watch** + **S6 Permission Manifest** + **V1 Secrets Broker**.

- **L2→L3**
  - **Existing evidence:** role-based access policy docs, periodic key rotation records, checklist tie-ins.
  - **To reach L3:** add **S3 Signing & Publisher Identity** + **S2 Behavioral Sandbox** + **E2 Exec Guard** + **E4 Network Egress Proxy**.

- **L3→L4**
  - **Existing evidence:** threat test reports, IR runbooks, remediation SLAs.
  - **To reach L4:** add **S8 Ingress Shield** + **E8 Cross-Session Firewall** + **V3 Honeytokens** + **V4 RAG Guard** + **W2 Continuous Assurance**.

**3 interview questions:**
1. Where are API keys and secrets stored?
2. How is unauthorized agent tool use detected and blocked?
3. How quickly can you revoke access and patch security issues?

**Evidence types that prove each level:**
- **L1:** informal credentials, no rotation logs, no access policy.
- **L2:** basic manager usage, access snapshots, partial logs.
- **L3:** role-based policy definitions and key management cadence.
- **L4:** SOC-style log aggregation, threat tests, IR runbooks with timestamps.

---

## 3) Reliability

**What it measures (1 sentence):**
How consistently agents operate under normal and abnormal conditions.

**Why buyers care (1 sentence):**
Unreliable agents quickly destroy trust and increase manual intervention.

**L1 (ad hoc):**
Failures are handled manually; no shared playbook.

**L2 (developing):**
Some checklists exist; recovery depends on tribal knowledge.

**L3 (defined):**
Rollout/run checklists include rollback, and core incidents are documented.

**L4 (optimized):**
Service-quality is managed with proactive health checks and post-incident learning cycles.

### Transition map (Evidence + what gets you there)

- **L1→L2**
  - **Existing evidence:** manual issue list, ad-hoc recovery action notes.
  - **To reach L2:** implement **E5 Budget Circuit Breaker** + **E7 Sandbox Orchestrator** + **W1 Signed Receipts**.

- **L2→L3**
  - **Existing evidence:** checklists and partial incident logs.
  - **To reach L3:** add **E4 Network Egress Proxy** + **E2 Exec Guard** + **E5 Circuit Breaker** with guardrail alerts.

- **L3→L4**
  - **Existing evidence:** uptime dashboards, RCA history, trend mitigation plans.
  - **To reach L4:** add **W2 Assurance Suite** + **W1 Receipts** + **S2 Sandbox** for pre-release regression and **V4 RAG Guard** for data reliability boundaries.

**3 interview questions:**
1. How are failures noticed and escalated?
2. Who can pause/rollback an agent system?
3. What is current MTTR on failures?

**Evidence types that prove each level:**
- **L1:** user complaint logs, missing postmortems.
- **L2:** test checklists, partial downtime logs.
- **L3:** release checklists, rollback docs, incident records.
- **L4:** automated health checks, RCA trend and completion reports.

---

## 4) Evaluation

**What it measures (1 sentence):**
How systematically teams measure quality, risk, and business impact.

**Why buyers care (1 sentence):**
Without evaluation, teams cannot prove impact nor decide what to improve.

**L1 (ad hoc):**
Only anecdotal quality review, no formal score.

**L2 (developing):**
Some metrics exist, not standardized.

**L3 (defined):**
Shared scorecard, periodic audits, clear pass/fail criteria.

**L4 (optimized):**
Continuous evaluation with control samples, segmentation, and action decisions.

### Transition map (Evidence + what gets you there)

- **L1→L2**
  - **Existing evidence:** ad hoc feedback and issue notes.
  - **To reach L2:** start with **W1 Signed Action Receipts** (decision traceability) + **V2 DLP** (input/output consistency by policy).

- **L2→L3**
  - **Existing evidence:** shared metric sheet and periodic manual audits.
  - **To reach L3:** enable **W1 Receipts Ledger** + **W2 Assurance Suite** + **E1 Policy Firewall** (controls for model behavior tests).

- **L3→L4**
  - **Existing evidence:** control-test datasets and performance trend decisions.
  - **To reach L4:** expand **W2 Continuous Assurance** (red-team, control-regression suite) + **S10 Prompt Injection Detector** + **E6 Step-Up** to enforce quality fail gates.

**3 interview questions:**
1. What metrics determine agent success?
2. How often are samples reviewed and by whom?
3. Can one review event produce a roadmap change?

**Evidence types that prove each level:**
- **L1:** informal feedback only.
- **L2:** manual score notes and dashboard snapshots.
- **L3:** shared scorecard and decision records.
- **L4:** longitudinal evaluation reports tied to actions and outcomes.

---

## 5) Observability

**What it measures (1 sentence):**
How visible agent activity, policy decisions, and outcomes are across operations.

**Why buyers care (1 sentence):**
Visibility reduces blind risk and makes incident response faster.

**L1 (ad hoc):**
Issues surface via complaints; no single pane of glass.

**L2 (developing):**
Partial logs and dashboards with inconsistent standards.

**L3 (defined):**
Standard logging/alerts for key workflows and decisions.

**L4 (optimized):**
Cross-linked, proactive observability with alert-to-response workflows.

### Transition map (Evidence + what gets you there)

- **L1→L2**
  - **Existing evidence:** fragmented logs and complaint-only signals.
  - **To reach L2:** deploy **W1 Signed Action Receipts** to centralize event capture + **E1 Firewall** decision logging.

- **L2→L3**
  - **Existing evidence:** partial metric dashboards, inconsistent retention.
  - **To reach L3:** add **W2 Assurance Suite** + **S2 Sandbox** runtime metadata capture + standardized alert rules.

- **L3→L4**
  - **Existing evidence:** unified incident timeline and trend dashboards.
  - **To reach L4:** add **W1 Receipts + W2 Assurance core** and **E9 Outbound Communications Safety** to close the observability loop on outgoing actions.

**3 interview questions:**
1. What is your first place to check for issues?
2. How long are logs retained?
3. Do you get early alerts before users do?

**Evidence types that prove each level:**
- **L1:** fragmented logs and chat-only incident notes.
- **L2:** partial dashboards and inconsistent logging standards.
- **L3:** standardized schema, centralized dashboards, retention policy.
- **L4:** alert-to-resolution chain and full incident timeline.

---

## 6) Cost Efficiency

**What it measures (1 sentence):**
How well teams track, control, and optimize AI operating spend.

**Why buyers care (1 sentence):**
Uncontrolled spend can erase AI upside quickly.

**L1 (ad hoc):**
Costs are visible only after billing cycles.

**L2 (developing):**
Partial visibility with reactive cost fixes.

**L3 (defined):**
Assigned owners and periodic reviews with usage-to-value estimates.

**L4 (optimized):**
Real-time cost governance integrated with quality and risk policy.

### Transition map (Evidence + what gets you there)

- **L1→L2**
  - **Existing evidence:** periodic invoice snapshots, ad-hoc cost concerns.
  - **To reach L2:** deploy **E5 Budget Circuit Breaker** + **V2 DLP** for data-volume cost controls + **E1 Tool Firewall** budgets by policy.

- **L2→L3**
  - **Existing evidence:** spend reports and recurring review discussions.
  - **To reach L3:** add **W1 Receipts** + **W2 Assurance** with budget policy checks and cost guardrail reporting.

- **L3→L4**
  - **Existing evidence:** formal budget overage governance and tradeoff logs.
  - **To reach L4:** expand **W2 Assurance** + **E6 Step-Up** on expensive/high-risk actions + **S9 Sanitization Gateway** for token-efficient processing separation.

**3 interview questions:**
1. Who owns AI spend and optimization decisions?
2. How are spend overruns prevented?
3. Do you model cost-to-value per workflow?

**Evidence types that prove each level:**
- **L1:** end-of-month invoice-only view.
- **L2:** partial spend reports and informal mitigation.
- **L3:** tagged cost reviews and value comparisons.
- **L4:** budget guardrails and measured optimization decisions.

---

## 7) Operating Model

**What it measures (1 sentence):**
How teams run agent systems from onboarding through continuous improvement.

**Why buyers care (1 sentence):**
Mature operating models are the only way to scale safely.

**L1 (ad hoc):**
One-off projects, no shared operating loop.

**L2 (developing):**
Some templates/checklists exist, but uneven adoption.

**L3 (defined):**
Consistent reassessment, owners, retrospectives, and improvement cadence.

**L4 (optimized):**
Fully embedded operating model with training, reviews, and continuous capability growth.

### Transition map (Evidence + what gets you there)

- **L1→L2**
  - **Existing evidence:** project-level notes and irregular follow-ups.
  - **To reach L2:** start with **AMC Score Continuous** + **W1 Receipts** for shared operational evidence and **E2-E1 basic controls** for standard operating policies.

- **L2→L3**
  - **Existing evidence:** templates used in some teams, inconsistent ownership.
  - **To reach L3:** add **W2 Assurance Suite** for recurring governance and **E6 Step-Up** for operational sign-off workflows.

- **L3→L4**
  - **Existing evidence:** portfolio planning and training completion records.
  - **To reach L4:** add **V1 Secrets Broker**, **W2 Assurance**, and full **Watch/Enforce/Safeguard modules** plus **quarterly external red-team validation** patterns.

**3 interview questions:**
1. Who owns the AI operating calendar each quarter?
2. How are lessons learned converted into process improvements?
3. How are new team members onboarded on safe agent operations?

**Evidence types that prove each level:**
- **L1:** ad-hoc project docs, missing RACI.
- **L2:** partial templates, irregular retros.
- **L3:** published operating calendar, recurring review cadence.
- **L4:** integrated planning, training completion tracking, continuous improvement backlog tied to maturity lifts.

---

## Suggested scoring use in interviews

- Keep the original scoring flow from v1:
  - Ask three questions per dimension.
  - Score with auditable evidence links.
  - Require evidence to upgrade levels.
- Use the transition map above to recommend implementation recommendations in a live advisory session.

---

## Files created/updated
- `AMC_OS/PRODUCT/AMC_DIMENSIONS_FRAMEWORK_v2.md`

## Acceptance checks
- Every dimension has all three transition pathways with explicit evidence and module recommendations.
- Existing dimension definitions remain intact and complete.
- Module recommendations align to module names in `PLATFORM_ARCHITECTURE_v2.md`.

## Next actions
1. Build transition-aware scoring UI so recommendations are generated with each assessment.
2. Add transition evidence examples for 2–3 customer verticals.
3. Add score-to-module guidance in proposal playbooks.
4. Verify that S4/S8/S9/S10 recommendations are used only where security posture evidence supports them.

## Risks / unknowns
- Some transitions may over-prescribe enforcement modules for small teams.
- Module overlap can blur ownership (especially E1/E5/S2/S10); scoring UI should keep recommendation clarity.
- Mapping to real controls depends on evidence maturity and available telemetry depth.
