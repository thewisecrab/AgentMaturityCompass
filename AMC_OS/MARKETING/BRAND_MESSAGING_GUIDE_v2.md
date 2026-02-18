# AMC Brand Messaging Guide v2
**Version:** 2.0
**Date:** 2026-02-18
**Scope:** Full Trust & Safety Platform rollout
**Status:** Deployment draft

## 1) Core Positioning

### New positioning statement
**AMC is Agent-native trust & safety infrastructure for teams building, deploying, or operating AI agents.**

### Platform one-liner
**The Trust & Safety Platform for Agent Systems**

### Positioning shift
AMC is no longer only a maturity assessment. It is now a 5-suite platform for:
1. **Measuring** current posture (AMC Score)
2. **Enforcing** safe behavior in runtime (AMC Shield + AMC Enforce)
3. **Proving** outcomes with tamper-evident evidence (AMC Watch)

### What this means in messaging
- Speak to **operational control**, not “methodology hype”
- Lead with what happens at runtime
- Lead with proof and traceability over theoretical readiness

---

## 2) ICP Profiles (updated)

### ICP A — Developer + Security Engineering Teams
**Typical goals:** ship more trusted agents without adding unsafe shortcuts in CI/CD and runtime

**Current pain:** security posture is assessed after implementation; prompt-focused checks do not prevent bad tool-chain or runtime execution paths

**Messaging angle:**
- “We help you close the gap between what the model says and what it can do.”
- “You can keep your stack fast while adding enforceable runtime controls.”

**Top proof points:**
- Reduced review friction by using policy templates and receipts tied to action context
- Better prioritization via module-level risk scoring and confidence tags

### ICP B — CISOs / Security Leadership
**Typical goals:** reduce enterprise risk, improve governance artifacts, survive security review without slowing teams

**Current pain:** risk teams often receive fragmented evidence and no direct control over execution outcomes

**Messaging angle:**
- “Trust here means enforcement plus evidence, not only assessments.”
- “Agent-native controls reduce policy bypass risk in production workflows.”

**Top proof points:**
- Audit-ready receipts and policy decision trails
- Continuous assurance across tool calls, escalations, and deployment drift

### ICP C — Agent Platform Providers
**Typical goals:** provide safety guardrails for third-party developers and customers as a core service layer

**Current pain:** trust is difficult to guarantee when workloads, skills, and integrations scale across tenants

**Messaging angle:**
- “Bundle trust into the runtime instead of outsourcing it to each customer’s integration team.”
- “Expose one policy layer across all SKUs instead of many ad hoc controls.”

**Top proof points:**
- Shield + Enforce module composability for multi-tenant environments
- Standardized receipts and audit export for tenant-level trust reporting

### ICP D — Marketplace Operators (skills/external plugins)
**Typical pain:** publisher risk, dependency compromise, inconsistent skill quality, trust collapse from one bad module

**Current pain:** public or internal marketplaces expose runtime risk through unvetted skills and opaque updates

**Messaging angle:**
- “Treat every install as a controlled supply-chain event.”
- “Gate skills with signing, sandboxing, and reputation controls before agents can execute.”

**Top proof points:**
- S1 static analysis + S2 behavioral sandbox + S3 signing + S5 reputation graph
- Clear risk receipts at install and execution events

---

## 3) Messaging Pillars (3)

### Pillar 1 — Runtime Enforcement (not prompts)
- Enforcement happens **after** risk detection, where tool calls become changes to systems.
- Messaging verbs: block, gate, constrain, approve, isolate, hash.
- Avoid framing that implies “prompt engineering alone solves risk.”

### Pillar 2 — Supply-Chain Security
- Safe agents require safe ingress: skills, dependencies, publishers, and content channels.
- Messaging verbs: verify, pin, sign, attest, quarantine, allowlist.
- Explicitly link to pre-execution gates and runtime manifests.

### Pillar 3 — Tamper-Evident Proof
- Decisions should be replayable and reviewable: what happened, who approved, and why.
- Messaging verbs: record, sign, prove, reconstruct, attest, retain.
- Emphasize that trust is not just “score” but **traceable operations**.

---

## 4) Suite-level proof points

### AMC Score
- Benefit: creates a shared maturity baseline across technical and security stakeholders
- Evidence: structured scoring with confidence/assumption tags, updated by drift and module usage
- Messaging cue: “Baseline first, no more debate about definitions of ‘ready’.”

### AMC Shield
- Benefit: prevents unsafe assets, prompts, and tool definitions from entering the execution path
- Evidence: static + behavioral + signing + dependency controls before runtime
- Messaging cue: “Protect the ingress layer before it becomes an attack layer.”

### AMC Enforce
- Benefit: constrains actual execution in real time
- Evidence: tool policy firewall, command guardrails, approval flow, cross-session isolation
- Messaging cue: “Governance becomes machine-enforced, not manually remembered.”

### AMC Vault
- Benefit: limits impact when data and credentials are exposed
- Evidence: least-privilege tokenization, DLP redaction, canary tokens, RAG memory isolation
- Messaging cue: “Reduce blast radius at the data boundary, not at incident review time.”

### AMC Watch
- Benefit: turns decisions into verifiable evidence
- Evidence: signed receipts, hash-chain audit storage, continuous assurance tests, incident playbooks
- Messaging cue: “Know and prove what your agents did, and why.”

---

## 5) Competitive differentiation

### vs DIY policy documents
- **DIY:** policy pages are static and human-dependent
- **AMC:** runtime and evidence layers execute controls automatically and persist decisions
- **Short framing:** “Policies without enforcement and receipts are hard to verify in production.”

### vs App security tools
- **App security tools:** strong for static risk and app boundary controls
- **AMC:** built for agent-native behaviors: tool call chains, dependency-driven skills, memory interactions, autonomous loops
- **Short framing:** “Use app security where it belongs, and use AMC where app security ends.”

### vs LLM guardrails (model-layer only)
- **LLM guardrails:** constrain model output patterns, valuable but insufficient for tool execution
- **AMC:** enforces at tool boundary, network path, workspace, and audit layer
- **Short framing:** “Model controls can reduce bad prompts. AMC prevents bad actions.”

---

## 6) Voice & Tone for technical security buyers

### Core voice characteristics
- **Precision over hype:** use exact controls, module names, and outcomes
- **Evidence-first:** include assumptions, scope, and confidence where possible
- **Operational language:** policy, manifests, telemetry, approvals, receipts
- **Respectful urgency:** direct about risks, explicit about what is guaranteed versus what is observed

### Forbidden patterns (strongly discourage)
- “Guaranteed,” “fail-safe,” “never” statements about security outcomes
- “AI-ready” without explicit definition
- Overstated absolute claims (“best,” “only solution,” “unbreakable”)
- Vague abstract adjectives with no control mapping

### Do this instead
- “in production contexts,” “subject to policy scope,” “under current assumptions,” “observed in pilot environments”

---

## 7) Recommended external copy modules

### Taglines
1. **Primary:** The Trust & Safety Platform for Agent Systems
2. **Secondary:** Measure it. Enforce it. Prove it.
3. **Technical:** Runtime Trust, Not Prompt Trust.

### 30-second pitch
"AMC is a five-suite trust and safety platform for agent systems: Score, Shield, Enforce, Vault, and Watch. We help teams shift from static policy to enforced runtime controls and traceable evidence. That means security teams can control tool actions, developers move faster with safer defaults, and leadership gets auditable proof when things are reviewed." 

### 60-second pitch
"Traditional app security and prompt-level controls leave a gap for agent systems because the biggest risks often happen in execution loops: tool chaining, runtime state changes, skill loading, and content ingestion. AMC closes that gap as a complete platform. Score gives you a shared baseline, Shield blocks risky ingress, Enforce controls execution, Vault protects secrets and outputs, and Watch provides tamper-evident proof through signed receipts and continuous assurance. The result is a practical, layered posture that supports both fast shipping and accountable operations."

---

## 8) Sales handoff lines

- "We’re not asking you to replace everything you already run. We’re asking you to make agent behavior enforceable and reviewable." 
- "If your teams are still arguing about readiness, the issue is often evidence granularity, not engineering capability." 
- "The CTA is simple: let’s map your highest-risk workflow to AMC modules by source of execution risk."

---

## Output standard
- **Files created/updated:** `AMC_OS/MARKETING/BRAND_MESSAGING_GUIDE_v2.md`
- **Acceptance checks:**
  - Positioning updated to agent-native trust & safety
  - ICP list includes dev/security, CISOs, platform providers, marketplaces
  - 3 new pillars documented and mapped to controls
  - Suite proof points updated for all 5 suites
  - Competitive differentiation clearly distinguishes DIY, app security tools, LLM guardrails
  - Voice guidance tailored to technical/security audience
  - No guaranteed outcome claims
- **Next actions:**
  1. Sync this guide with Rev ops and SDR scripts before outbound cadence launch
  2. Update shared pitch decks and website hero copy to match new tagline
  3. Add a “claim confidence” field in proof-heavy assets
  4. Review with compliance/legal for audit-trail and claims wording before publication
  5. Create role-level cheat sheet (SDR vs AE vs engineer) using this guide as source
- **Risks/unknowns:**
  - Claim confidence levels depend on proof-source quality in each ICP
  - Some operators may still confuse AMC Score with standalone compliance compliance
  - Marketplace ICP messaging requires stronger examples once partner telemetry reaches sample size
