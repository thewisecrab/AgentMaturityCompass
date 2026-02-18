# AMC Product Roadmap v2

**Version:** 2.0  
**Date:** 2026-02-18  
**Scope:** Full 25-module platform rollout with 5-suite architecture

---

## Strategic sequencing

This roadmap is engineered for **maximum cash conversion in year one** while delivering a credible end-state platform.

**Launch milestones (global):**
1. **Beta:** 10 design partners onboarded
2. **General Availability (GA):** 50 paying customers
3. **Scale:** **$100k ARR** reached

> Design: build a dependable assessment + enforcement backbone first, then add higher-order assurance and enterprise operations.

---

## Phase 1 (Months 1-3): Foundation

**Build block:** `AMC Score + W1 Receipts + E1 Firewall + S1 Analyzer + V2 DLP`

### Deliverables
- v2 scoring engine ready for continuous assessment and trend scoring
- W1 Signed Action Receipts v1.0 with tamper-evident hash chain
- E1 Tool Policy Firewall MVP (policy-as-code + decision context logs)
- S1 Skill Static Analyzer CLI/API + CI gate mode
- V2 DLP Redaction Middleware (prompt/outbound sanitize)
- Starter + Growth bundles productized and quoteable with onboarding playbooks
- Sales + customer onboarding funnel for 10 design-partner beta

### Success metrics
- 10 design partners activated in beta
- ≥95% ingestion policy logs captured in W1 for beta actions
- 85% reduction in unscanned skill risk score incidents entering runtime
- 100% basic policy evaluation coverage for production tool calls
- Median setup time per design partner: **< 5 business days**

### Revenue milestones
- $0.8M platform pipeline target in qualified opportunities
- 3 monthly Starter/Growth conversions by Month 3 (pilot-to-paid conversion)
- Monthly recurring baseline from design partners: **$9k–$15k** by end of month 3

### Team requirements
- Product Manager: 0.5 FTE
- Fullstack Engineer: 1
- SRE/DevOps: 0.25 FTE
- Security + QA: shared review cadence
- RevOps/Sales support: for beta onboarding and conversion

---

## Phase 2 (Months 4-6): Enforcement expansion

**Build block:** `S2 Sandbox + S3 Signing + S8-S10 Shield modules + E2 Exec Guard + E6 Step-Up`

### Deliverables
- S2 Behavioral Sandbox with randomized behavior replay and report artifacts
- S3 Skill Signing & Publisher Identity (issuer registry, revocation, verification)
- S8 Channel Ingress Shield for message gating and anti-abuse
- S9 Content Sanitization Gateway + S10 Prompt Injection Detector
- E2 Exec Guard for command hardening and policy-based approvals
- E6 Step-Up Authorization (human approval for high-risk actions)
- API SDK v1 stable for inbound policy checks
- Growth-to-Professional upsell collateral and demos

### Success metrics
- 60% of design partner teams using S2/S3/S8-S10 in production flows
- ≥20% drop in high-risk command and content abuse signals
- Step-up approvals <2.5 min average in low-risk workflows and <5 min for high-risk
- >90% policy decision correctness in canary tests
- 2 design partner references ready for marketing

### Revenue milestones
- Professional upsell conversion target: **40–60%** of active Growth beta participants
- Monthly recurring revenue target by end of Month 6: **$35k–$50k/mo** including annualized upsells
- 2–3 strategic OEM pilots initiated

### Team requirements
- Engineering: 1 fullstack + 1 security-focused backend engineer
- Product: 1 PM + 1 solutions engineer
- Security engineer: 0.5 FTE
- QA + Reliability: 1 QA engineer for policy/decision engine test harness
- Sales/Enablement: proposal and proof-of-value support

---

## Phase 3 (Months 7-9): Protection & evidence depth

**Build block:** `V1 Secrets Broker + V3 Honeytokens + V4 RAG Guard + W2 Assurance core`

### Deliverables
- V1 Secrets Broker + JIT token flow + usage telemetry
- V3 Honeytokens + SIEM alerting integration
- V4 Secure Memory & RAG Guard (access control + poisoning signals)
- W2 Continuous Assurance Suite core modules:
  - baseline drift runner
  - policy drift alerts
  - automated security control checks
- Self-service compliance report generator (basic SOC evidence package)
- Professional customers piloting Vault integration patterns

### Success metrics
- 70% of Professional customers with V1 or V3 or V4 enabled by Month 9
- Secrets incident response drill success: **≥95%** within target containment window
- W2 false positive/false negative baseline established and tuned per workspace
- Evidence package generation available for at least 20 live incidents

### Revenue milestones
- Enterprise pipeline at $150k+ annualized close value
- Conversion from Professional to Enterprise: **25%+** among active Professional accounts
- First paying enterprise annual contract(s) signed by Month 9

### Team requirements
- Platform team: 1 fullstack engineer (SDK/API hardening)
- Data engineer: 0.5 FTE (telemetry schema, evidence stores)
- Threat modeling support: 0.25–0.5 FTE
- Product + RevOps: enterprise pricing and scope templates
- Technical writing + QA for assurance documentation

---

## Phase 4 (Months 10-12): Remaining modules + OEM + enterprise readiness

**Build block:** `Remaining modules + OEM SDK + enterprise features`

### Deliverables
- Remaining modules shipped:
  - S4, S5, S6, S7 (Shield extensions)
  - E3, E4, E5, E7, E8, E9 (Enforce extensions)
  - V2 enhancements completed for enterprise templates and redaction policies
  - Full W1/W2 production hardening and retention controls
- OEM/Marketplace packaging + per-active-agent licensing API
- Enterprise controls: tenancy isolation, audit export, region controls, contractual reporting SLAs
- GA readiness runbook and customer success playbooks
- Scale-infra and performance hardening for P99/throughput

### Success metrics
- 100% module availability in product catalog
- 95th percentile deployment of remaining modules passes compliance smoke test
- GA release readiness complete with uptime and runbook criteria met
- 50 paying customers
- **$100k ARR achieved** by Month 12

### Revenue milestones
- Enterprise recurring starts at mid/high range of custom suite and implementation bundles
- 10+ OEM contracts under pilot terms
- Expansion pipeline built into GA launches (referral + partner-led motion)

### Team requirements
- Engineering: 2 fullstack/SDK engineers
- DevOps: 1.0 FTE for release + incident response readiness
- Product: 1 PM + solution architect
- QA: dedicated release QA + security testing
- Customer success + onboarding team: 1–2 specialists

---

## Platform-level delivery cadence (all phases)

- **Monthly roadmap review:** feature completion, policy coverage, module stability
- **Quarterly commercial review:** conversion by tier, churn risks, pilot-to-paying velocity
- **Security + QA gate:** no phase gate without signed-off test pack
- **Go-live standards for each phase:**
  - 95% test pass in decision engine
  - Documented rollback path
  - One-page runbook for operational responders

---

## Milestone timeline

| Milestone | Timeline | Required condition |
|---|---|---|
| Beta launch | Month 3 | 10 design partners, active telemetry + W1 logs |
| Design partner to paying conversion | Month 4–5 | >35% conversion from pilot signups |
| GA launch | Month 10–12 | 50 paying customers + reliability + security gates passed |
| Scale check | Month 12 | ≥$100k ARR sustained for 30 days |

---

## Files created/updated
- `AMC_OS/PRODUCT/PRODUCT_ROADMAP_v2.md`

## Acceptance checks
- All requested phase modules are present with deliverables and success metrics.
- Revenue milestones map to each phase and end-to-end ARR goal.
- Team requirements are specified by phase and role band.
- Milestones explicitly include beta, GA, and scale targets.

## Next actions
1. Set quarterly KPIs per phase owner with explicit owners and deadlines.
2. Add project dependencies across modules in backlog tooling.
3. Publish phase gate checklist for Engineering + QA + RevOps.
4. Build beta partner success plan and feedback loop.
5. Convert into quarter-specific execution boards.

## Risks / unknowns
- Timing risk if OEM SDK work consumes core assurance engineering.
- Under-availability of design partners may delay phase gates.
- Integration complexity could increase with legacy agent stacks.
- $100k ARR depends on enterprise conversion cadence and not just module usage.
