# AMC Platform Pricing Model v2

**Version:** 2.0  
**Date:** 2026-02-18  
**Status:** Production-ready sales/revenue playbook pricing reference  
**Applies to:** Full 25-module AMC Platform (Score, Shield, Enforce, Vault, Watch)

---

## 0) Pricing Philosophy

AMC is sold as a **security/reliability platform, not a lab tool**. Every tier is designed as a migration path from assessment to enforcement to proof:

- **Starter**: assess current risk and trend over time
- **Growth**: add preventive controls and policy enforcement basics
- **Professional**: add hard runtime controls and approval workflows
- **Enterprise**: add data protection, enterprise governance, and continuous assurance
- **Watch-only / OEM**: optional extension and channel models for distribution

**All pricing is in USD and excludes taxes/customs.**

---

## 1) Suite pricing tiers

### 1.1 Starter — AMC Score
**$999/mo**

**Includes:**
- **Continuous Score (monthly reassessment)**
- 7-dimension scoring engine with evidence capture
- Baseline benchmark and trend dashboard
- Drift alerts (dimension-level risk shifts)
- Quarterly executive summary pack (template)
- In-app roadmap recommendations (non-prescriptive)

**Not included:** runtime enforcement, signed receipts, secret handling controls, vendor attestations.

> This is **assessment-only** and is the required foundation for every enterprise growth path.

---

### 1.2 Growth — AMC Score + AMC Shield
**$1,299/mo (bundle, save 15% vs A-la-carte)**

**Includes:**
- All Starter (Continuous Score)
- Full **AMC Shield** suite (all 10 modules):
  - S1 Skill Static Analyzer
  - S2 Behavioral Sandbox
  - S3 Skill Signing & Publisher Identity
  - S4 Skill SBOM/CVE Watch
  - S5 Skill Reputation Graph
  - S6 Permission Manifest & Installer
  - S7 Private Enterprise Registry
  - S8 Channel Ingress Shield
  - S9 Content Sanitization Gateway
  - S10 Prompt Injection Detector

**Typical outcomes:** reduced pre-deployment incidents, safer skills, safer message ingress.

**Who buys this:** teams deploying first wave of agent skills and needing confidence without runtime lock-down yet.

---

### 1.3 Professional — + AMC Enforce
**$2,099/mo**

**Includes:**
- Starter + Growth modules
- Full **AMC Enforce** suite (all 9 modules):
  - E1 Tool Policy Firewall
  - E2 Exec Guard
  - E3 Browser Automation Guardrails
  - E4 Network Egress Proxy
  - E5 Budget Circuit Breaker
  - E6 Step-Up Authorization
  - E7 Session Sandbox Orchestrator
  - E8 Cross-Session Data Firewall
  - E9 Outbound Comms Safety

**Why add this tier:** prevention is no longer “best effort”—it is enforced in runtime with policy, approvals, and containment.

**Who buys this:** regulated teams, operations-heavy orgs, teams with meaningful incident risk.

---

### 1.4 Enterprise — + AMC Vault + AMC Watch
**Custom: $5,000–$50,000/mo**

**Includes:**
- Starter + Growth + Professional modules
- **AMC Vault** (all 4)
  - V1 Secrets Broker & JIT Credentials
  - V2 DLP Redaction Middleware
  - V3 Honeytokens
  - V4 Secure Memory & RAG Guard
- **AMC Watch** (all 2)
  - W1 Signed Action Receipts Ledger
  - W2 Continuous Assurance Suite
- **Enterprise enablement pack**
  - Dedicated implementation engineer (part-time/standby)
  - Quarterly executive reporting and control attestations
  - Multi-workspace tenant controls, SSO integration (SaaS or dedicated cluster)
  - Incident support + policy hardening sprintups

**Deployment/risk variants covered by quote:**
- number of agents/workspaces
- data residency requirements
- response time SLO
- compliance evidence cadence
- on-prem/self-hosted constraints

**Target:** small-mid enterprise and regulated sectors entering production scale.

---

### 1.5 One-time Compass Sprint
**$5,000 (one-time, no subscription required)**

**What it is:** diagnostic + roadmap package independent of subscription.

**Inclusions:**
- 5 business days baseline + deep risk review
- evidence inventory and 30/60/90 remediation sequence
- prioritized implementation plan tied to current tier readiness
- executive sponsor packet and optional board-safe narrative

**Use cases:**
- pre-purchase due diligence
- interim step before subscription
- budget planning in FY freeze quarters

---

### 1.6 OEM / Marketplace Licensing
**Per-active-agent pricing: $1–$10/active-agent/mo** (minimums/tiers apply)

**What is licensed:** runtime SDK / API / connector package enabling third-party platforms to embed AMC.

**Common starting bands (indicative):**
- SMB toolmakers: **$1–$2/active-agent/mo**
- Mid-market platforms: **$2.50–$5/active-agent/mo**
- Regulated/large ecosystems: **$5–$10/active-agent/mo**

**Optional commercial terms:**
- revenue share on end-customer bundles
- co-branded or white-label licensing
- metered usage cap and overage tiers
- volume floor commitments and annual commitments available

---

## 2) Implementation fees

Implementation fees are one-time onboarding costs with clear tier mapping:

- **$2,000** — Starter onboarding (no enforcement modules)
  - one runtime integration
  - policy baseline templates
  - 1 training session

- **$5,000** — Growth onboarding
  - shield pipelines enabled
  - CI policy guardrails
  - 2 training sessions + baseline hardening

- **$15,000** — Professional onboarding
  - full Shield + Enforce rollout
  - custom policy-as-code and workspace migration
  - 4 training sessions, IR runbook, runbook simulation

- **Custom** — Enterprise onboarding (>$15,000)
  - includes Vault + Watch deployment, SOC evidence workflow, self-hosted architecture, and CISO signoff support
  - scoped via technical discovery and compliance boundaries

**Rule:** implementation is scoped to the selected suite and includes delivery milestones, with paid change-order only for added modules.

---

## 3) Annual subscription discount

**20% annual discount** on all recurring tiers when paid annually in advance.

- $999/mo Starter: **$9,590/year** (instead of $11,988)
- $1,299/mo Growth: **$12,460/year** (instead of $15,588)
- $2,099/mo Professional: **$20,110/year** (instead of $25,188)
- Enterprise quote includes annual discount by seat/agent and SLA band.

Invoice cadence options:
- monthly invoice (default)
- annual prepaid (preferred for 20% discount)
- hybrid with implementation fee + annual subscription

---

## 4) Compare to alternatives

| Option | Typical cost (first year) | Security coverage | Operational maturity impact | Evidence/compliance readiness | Typical failure mode |
|---|---:|---|---|---|---|
| DIY stack | $8k–$40k tools + 200+ engineer hours | Partial, fragmented | High variance by team | Weak; logs fragmented | No single control plane; brittle runbooks |
| Point solutions (SAST + DLP + bot framework guardrails) | $10k–$70k/year | Narrow, siloed | Medium at best | Weak unless manually stitched together | Blind spots between tools and policy bypass |
| AMC Platform (Professional+) | $2,099/mo+ (or custom for enterprise) | End-to-end: Shield/Enforce/Vault/Watch | High: consistent risk-reduction + execution control | Full evidence graph: receipts, compliance checks, audit exports | Siloed controls and manual stitching create policy bypasses |

---

## 5) Objection handling playbook

### "Too expensive"
**Response:**
- “The real comparison is not AMC vs no spend—it’s preventing one uncontrolled incident. A single model-compromise or data exfiltration event usually exceeds this annualized spend by **10x–100x** in recovery, downtime, and trust loss.”
- “Starter starts at $999/month, so this is a controlled pilot path, not a big-bang buy.”
- “If needed, we can start with Growth for runtime safety without touching Vault/Watch first.”

### "We’ll build it ourselves"
**Response:**
- “Building only gives part of the stack; AMC gives five coordinated layers with shared policy language and evidence outputs.”
- “Teams usually underestimate build burden: policy engine, integrations, forensic logging, and audit-ready tamper-evident receipts take months and are maintenance-heavy.”
- “We de-risk your roadmap by letting your team focus on core product while AMC provides the safety plane.”

### "We don’t need this yet"
**Response:**
- “Most teams skip until they hit a controlled incident. AMC’s Starter gives visibility now and prevents expensive retrofits later.”
- “If you’re small, start with Continuous Score + Shield as the minimum viable safety rail.”
- “This is insurance on top of momentum: you can delay deployment modules, but risk grows faster than governance maturity.”

---

## 6) Sales notes for quoting and quoting sequence

- Base quote formula:
  - **Suite recurring fee** + **implementation fee** + **optional custom services**
- Minimum first bill recommendation:
  - Starter or Growth for most mid-size teams
  - Professional for production AI assistants
  - Enterprise for regulated or multi-workspace environments
- Always present a 90-day outcome statement:
  - “What we can prevent in month 1, measure in month 2, prove by month 3.”

---

## Files created/updated
- `AMC_OS/PRODUCT/PRICING_MODEL_v2.md`

## Acceptance checks
- Verify all 5 suite tiers and inclusions are clearly complete.
- Confirm pricing references include one-time Compass Sprint and OEM model.
- Confirm 20% annual discount math is included for recurring tiers.
- Confirm objection playbook is ready for direct sales reuse.

## Next actions
1. Align implementation fee tiers with implementation/technical team capacity bands.
2. Add 12-month contract examples for high-touch enterprise motions.
3. Add legal/compliance review section for privacy-specific jurisdictions.
4. Generate concise one-page pricing sheet for RevOps and SDR usage.
5. Set up quote-automation template with selectable tiers and addons.

## Risks / unknowns
- Enterprise pricing band can drift if module usage profiles are over/under estimated.
- OEM revenue depends on partner volume predictability and true active-agent counting.
- “Watch / assurance” perceived value can be delayed until first audit cycle; requires good customer education.
