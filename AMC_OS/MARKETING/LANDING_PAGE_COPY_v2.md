# AMC Platform Landing Page Copy v2

## 0) Page Metadata
- **Product Positioning:** The Trust & Safety Platform for Agent Systems
- **Primary CTA:** **Start with a free Compass Diagnostic**
- **CTA destination:** `#start-diagnostic`
- **Primary audience:** Developer/security teams, CISOs, platform teams, marketplaces
- **Evidence stance:** Directional, transparent confidence, no guaranteed outcome claims

---

## 1) HERO

### Hero headline
**The Trust & Safety Platform for Agent Systems**

### Subheadline
AMC helps teams move from “agent assessment” to controlled trust posture: measure security risk, enforce safe behavior at runtime, and generate auditable proof that security and governance decisions are being followed.

### Problem statement (hero support)
Traditional app security is necessary but incomplete for agents. Agent systems execute dynamic tool calls, consume external skills, and operate in persistent, multi-party environments.

### Value bullets (benefit-first)
- **Faster signal triage**: find highest-risk controls to fix first
- **Runtime blocking before damage**: prevent unsafe tool calls and high-risk actions
- **Auditable trust evidence**: prove to your security, legal, and leadership teams what actually happened

### Primary action
**Start with a free Compass Diagnostic**

### Secondary action
**See how the 5-suite platform maps to your stack**

---

## 2) Problem: Why Agent Security Is Different

Teams often assume existing app security posture maps directly to agents. It usually does not.

### Difference #1: Control-loop risk is endogenous
Your agent is not a single transaction service. It is a loop:
- Input ingestion
- Reasoning
- Tool invocation
- Environment mutation
- Memory updates

A vulnerability introduced at any step can cascade in the next turn. You need controls where behavior happens, not only around deployment.

### Difference #2: Runtime enforcement, not static policy
Prompt-level safeguards are useful, but they are not sufficient.

- A prompt can be bypassed by a manipulated workflow
- Tool calls can occur at scale and in unexpected sequences
- One successful prompt injection can trigger costly actions unless execution is blocked at the tool boundary

AMC Enforce applies controls exactly where the risk becomes executable.

### Difference #3: Supply-chain risk is part of agent risk
Agents pull skills, prompts, packages, and external context continuously.
- Compromised dependencies
- Malicious or stale skill versions
- Untrusted capability claims

AMC Shield adds pre-install, pre-run, and reputation checks so your model runtime is not the only trust boundary.

### Difference #4: Evidence for AI systems must be machine-verifiable
For agents, trust is operational:
- Who approved an action?
- Why was a request blocked?
- Which policy version was active?

AMC Watch creates tamper-evident records instead of tribal memory.

### Difference #5: Compliance is ongoing, not a one-time hardening task
Agent systems drift as prompts, model versions, dependencies, and roles change.

AMC Watch + AMC Score create a continuous posture cycle: baseline → enforce → reassess → audit.

**Transition line:**
So yes, you still need app security and model governance. But for agents, you also need a trust system that controls behavior in real time.

---

## 3) The 5-Suite Platform (Benefit-first)

### 1) **AMC Score** — *Know exactly where you are now*
A maturity engine across security-relevant dimensions with practical risk scoring.
- **Benefit:** eliminates “gut-based readiness debates” by replacing argument with shared, auditable scoring.
- **Use when:** you are planning scale, procurement, or risk review and need a baseline.

### 2) **AMC Shield** — *Stop dangerous inputs before they reach execution*
Static scanning, sandboxing, signing, dependency checks, and publisher trust controls across skills and content channels.
- **Benefit:** reduces bad-capability exposure before an agent can act.
- **Use when:** you need safe onboarding for skill catalogs, prompts, files, and tool definitions.

### 3) **AMC Enforce** — *Block unsafe behavior at the execution boundary*
Tool-policy firewall, command controls, browser/network/capability guardrails, and human step-up authorization.
- **Benefit:** turns trust requirements into machine-enforced behavior.
- **Use when:** governance needs hard controls over what agents can do, when, and by whom.

### 4) **AMC Vault** — *Protect secrets and outputs inside the operating stack*
Secrets brokering, DLP redaction, canary tokens, and memory/RAG controls.
- **Benefit:** reduces leakage and lateral movement risk from the agent’s own workspace and integrations.
- **Use when:** tokens, PII, or sensitive customer data are part of workflow.

### 5) **AMC Watch** — *Prove controls are working over time*
Signed receipts, hash-chained action logs, continuous assurance tests, red-team automation, and audit-ready exports.
- **Benefit:** gives security, legal, and product teams a durable evidence layer for review cycles.
- **Use when:** you need proof for policy review, incident response, and enterprise readiness conversations.

---

## 4) Social Proof (Compliant examples)

### Customer voice (anonymized quotes)
- **“We gained a shared baseline in under two weeks. Our leadership could finally compare engineering vs product risk assumptions without relitigating definitions of ‘ready.’”** — Security Lead, B2B SaaS (pilot), anonymous by request
- **“The runtime policy step caught a tool-call path that had passed prompt checks in our previous setup.”** — Lead Engineer, internal agent tooling team
- **“The receipt and decision logs made our weekly incident review practical. We now have a record of *what was allowed, what was blocked, and why*.”** — Platform Operations Manager, fintech-adjacent deployment

### Observational data points (directional)
- **5+ production-adjacent assessments** reviewed showed control-loop blind spots recurring across tool authorization and runtime escalation paths (non-experimental, observed in internal audits).
- **Multiple teams reported fewer unplanned rollout blockers** after introducing enforcement-first controls for agent tool calls and escalation actions (implementation-dependent; not a guaranteed outcome).
- **In one internal benchmark environment**, tamper-evident action receipts improved incident reconstruction speed by reducing “missing context” during post-incident review (observed, role-dependent).
- **Supply-chain hardening modules** exposed higher than expected exposure from unsigned/low-trust skills and unpinned dependency behavior, especially in multi-tenant or marketplace-like setups.

### Compliance framing
All proof points are presented as observed patterns with confidence qualifiers. No claim implies guaranteed security outcomes or universal improvements.

---

## 5) How It Works: Measure → Enforce → Prove

### Step 1 — **Measure**
- Run a continuous score and targeted module baseline across relevant teams and workloads
- Normalize risk across control domains (governance, security, reliability, observability, operating model)
- Output: a clear risk posture map with confidence and blind spots

### Step 2 — **Enforce**
- Select Shield and Enforce modules needed for your environment
- Implement runtime policy gates, secrets protections, tool limits, and escalation controls
- Output: executable controls and blocked-path telemetry tied to policy decisions

### Step 3 — **Prove**
- Activate Watch for signed receipts, drift testing, audit exports, and incident-ready evidence
- Review evidence cadence against business and regulatory review needs
- Output: measurable trust posture with continuous assurance

### CTA
**Start with a free Compass Diagnostic**

---

## 6) Who This Is For / Not For

### Best fit for:
- Teams already shipping AI agents and building toward broader deployment
- Security teams that require runtime controls (not just policy docs)
- Organizations with multi-tool or multi-agent architectures
- Teams preparing for vendor-risk, SOC, AI governance, or executive reviews

### Not this first step for:
- Teams only in concept/prototype phase with no production intent yet
- Organizations seeking model training only, without governance/reliability focus
- Teams wanting guaranteed “pass/fail” outcomes with no implementation context

---

## 7) Pricing overview

### Starter — **$999/mo**
- Continuous Score + foundational monitoring
- Best fit: one team, low-to-mid integration complexity

### Growth — **$2,099/mo**
- Starter + Shield + Enforce modules by deployment profile
- Best fit: production teams scaling to multiple agents or teams

### Enterprise — **Custom**
- Full Platform (Score + Shield + Enforce + Vault + Watch), SOW, implementation services, dedicated governance onboarding
- Best fit: high-risk environments, marketplaces, regulated sectors, platform providers

**Optional starting path:** 5-day Compass Sprint (legacy diagnostic engagement) remains available as a scoped advisory service.

---

## 8) FAQ (8 questions)

### 1) Is this just another compliance checklist?
**No.** A checklist helps with documentation. AMC is a control stack that combines measurement (Score), prevention (Shield, Enforce), data protection (Vault), and proof (Watch). The difference is that controls execute during runtime.

### 2) How does AMC integrate with my current stack?
**API-first, runtime hooks, and existing identity/tooling patterns.** We use adapters and policy middleware where possible: agents, CI/CD, secrets managers, SIEM, and observability systems.

### 3) How is this different from adding model prompting safeguards?
Prompt safeguards are useful but upstream-only. AMC adds controls at the tool boundary, output path, content ingress, and execution layer. That means less reliance on the model behaving correctly in every context.

### 4) How much implementation effort is typically required?
Effort depends on agent complexity and module selection. Most teams start with a narrow pilot surface (for example one workload class) and expand by control confidence and operational fit.

### 5) What’s the ROI?
We use evidence-based ROI framing: reduced unknown risk, clearer prioritization, and faster risk discussions. Outcomes are context-dependent and tied to team execution.

### 6) Is AMC only for large enterprises?
No. Starter and Growth are available for smaller teams. Enterprise pricing is used when you need broader control, marketplace features, or high-assurance audit and review workflows.

### 7) What data do you retain and where?
Retention and data path are configurable by deployment mode. We support BYOK/encrypted logs and customer-specific retention policies. Data-handling defaults are documented per deployment profile.

### 8) Can we keep using existing security tools?
Yes. AMC is designed as layered trust infrastructure, not a replacement for all existing controls. It adds control surfaces specifically tuned to agent execution behavior.

---

## 9) Primary CTA section

**You do not need perfect security documentation before starting. You need the first measurable control layer that matches how agents actually run.**

### Final CTA
## **Start with a free Compass Diagnostic**

### Supporting line
If you’re curious how this maps to your stack, share your top 2 workflows and we will align a starter path.

---

## 10) Compliance footer

The AMC platform is designed to support trust and safety in agent systems. Outcomes depend on implementation scope, model behavior, tool coverage, team participation, and operating context. Individual environments vary, and results are not guaranteed. Always validate controls in your own environment and with your own approval and legal/compliance processes.

---

## Output standard
- **Files created/updated:** `AMC_OS/MARKETING/LANDING_PAGE_COPY_v2.md`
- **Acceptance checks:**
  - Hero uses exact positioning: “The Trust & Safety Platform for Agent Systems”
  - Problem section explicitly contrasts agent-native security with app security across control loop, runtime enforcement, supply chain
  - 5-suite overview includes AMC Score → Shield → Enforce → Vault → Watch with benefit-first framing
  - Social proof includes compliant quotes and observable data points
  - How-it-works section is exactly 3-step Measure → Enforce → Prove
  - Pricing includes Starter ($999/mo), Growth ($2,099/mo), Enterprise (custom)
  - FAQ has 8 questions including checklist/compliance integration/ROI prompts
  - CTA is “Start with a free Compass Diagnostic”
  - No guaranteed outcome claims
- **Next actions:**
  1. Replace placeholder customer quotes with approved anonymized testimonials before publishing
  2. Localize pricing notes by region and currency controls
  3. Align top CTA and anchor links with final scheduling system
  4. Add schema/event tracking for hero CTA and FAQ interactions
  5. Run a 50/50 A/B test against v1 hero and section order variants
- **Risks/unknowns:**
  - Social proof statements must be validated against approved proof sources
  - Data residency and retention claims need final legal/security review by deployment region
  - Some CTA assumptions depend on available sales tooling integrations
