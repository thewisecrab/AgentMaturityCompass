# AMC PRODUCT ROADMAP — 90 Days
**Owner:** REV_PRODUCT_MANAGER  
**Lever:** C (Delivery-readiness) → enables A + B  
**Last updated:** 2026-02-18  
**Cash-first constraint:** Until $5k collected, every feature must reduce buyer risk, shorten deal cycle, or enable delivery of a paid Sprint.

---

## Roadmap Philosophy

### CASH FIRST → then CRAFT → then SCALE
The roadmap is sequenced to maximize near-term cash collection, not long-term platform elegance.

**ICE-S Scoring (used for all prioritization)**
- **I**mpact: 1–5 (effect on $5k goal / client outcomes)
- **C**onfidence: 1–5 (how certain we are it matters)
- **E**ffort: 1–5 (1 = minimal, 5 = huge — LOWER is better)
- **S**peed: 1–5 (how fast value is realized)

**Priority ranking formula:** `(I × C × S) / E`

---

## PHASE 1: Manual Delivery + Sales Enablement (Day 0–30)

### North Star Outcome
Close and collect first 3 Compass Sprints ($15k). Deliver 2 sprints. Demonstrate product value with real clients before any tooling investment.

### Philosophy
Build nothing you can do in a spreadsheet. Every artifact in Phase 1 is a document, template, or process — not code. The goal is prove-the-model, not build-the-platform.

---

### Features / Artifacts

| # | Feature | Format | LEVER | ICE-S | Owner |
|---|---------|--------|-------|-------|-------|
| P1.1 | **Assessment Intake Form** — 7-domain questionnaire (Google Form or Notion) | Doc | C | 4×5×5/2 = 50 | PM + Tech Lead |
| P1.2 | **Scoring Rubric Spreadsheet** — L1–L4 per dimension, auto-computed overall index | Spreadsheet | C | 5×5×4/2 = 50 | PM |
| P1.3 | **Evidence Collection Checklist** — per-domain artifact request list for clients | Doc | C | 4×5×5/1 = 100 | PM |
| P1.4 | **Executive Readout Template** — slide deck: score → gap → roadmap (10 slides) | Slides | B | 5×5×5/2 = 62 | PM + UX |
| P1.5 | **Roadmap Output Template** — top-10 actions, owner, due date, score lift | Spreadsheet | C | 5×5×5/1 = 125 | PM |
| P1.6 | **Compass Sprint Proposal Template** — objective, scope, exclusions, timeline, fee, terms | Doc | B | 5×5×5/1 = 125 | Proposal Specialist |
| P1.7 | **SOW Template** — linked to proposal, payment milestones, acceptance criteria | Doc | B | 5×4×5/1 = 100 | Legal/Contracts |
| P1.8 | **Sales One-Pager** — problem/offer/proof/CTA on one page, PDF-ready | Doc | A | 5×5×5/1 = 125 | Copywriter |
| P1.9 | **Discovery Call Script** — qualification, pain mapping, budget signal, next step | Doc | B | 4×5×5/1 = 100 | Head of Sales |
| P1.10 | **Delivery SOP v1** — end-to-end Sprint runbook (intake → score → readout → close) | Doc | C | 5×5×5/1 = 125 | PM + Implementation |

### Phase 1 Goals
1. All 10 sales/delivery artifacts published and internally reviewed by Day 7.
2. First Sprint delivered end-to-end using manual tooling only.
3. $5k collected before Day 30.
4. Delivery time-to-baseline documented (target: ≤ 12 hours of consultant time per Sprint).

### Phase 1 Success Metrics
| Metric | Target | How to Measure |
|--------|--------|----------------|
| Compass Sprints sold | ≥ 3 | CRM: deals closed-won |
| Cash collected | ≥ $5k | Invoice records |
| Sprints delivered | ≥ 2 | Delivery SOP completion checklist |
| Time-to-baseline (Sprint) | ≤ 12 hrs consultant time | Time-tracked per Sprint |
| Client readout NPS | ≥ 8/10 | Post-readout survey |
| Proposal-to-close rate | ≥ 40% | CRM stage conversion |
| Sales artifact approval | 100% through compliance gate | Compliance review log |

### Phase 1 Dependencies
- Scoring rubric (PRODUCT_DEFINITION.md) ✅ exists as foundation
- Proposal/SOW template from REV_PROPOSAL_SOW_SPECIALIST
- Compliance gate review from REV_COMPLIANCE_OFFICER
- CRM tracking from REV_REVOPS_CRM

### Phase 1 Go/No-Go Gate (Day 30)
**Proceed to Phase 2 only if:**
- [ ] At least $5k collected
- [ ] At least 1 Sprint delivered end-to-end with documented SOP
- [ ] Scoring rubric validated on at least 1 real client dataset
- [ ] All delivery artifacts have passed QA review

---

## PHASE 2: Lightweight Tooling (Day 30–60)

### North Star Outcome
Reduce Sprint delivery time by 50%. Onboard first 3 retainer clients. Enable repeatable scoring without founder as single point of failure.

### Philosophy
Build only what repeatedly slows delivery or increases buyer risk. One lightweight tool at a time. Prefer Notion/Airtable/Google Apps over custom code. Target: 1 additional team member can independently run a Sprint using the tooling.

---

### Features / Artifacts

| # | Feature | Format | LEVER | ICE-S | Owner |
|---|---------|--------|-------|-------|-------|
| P2.1 | **Evidence Vault (Notion/Airtable)** — structured artifact store with owner, date, verification status, control mapping | Notion DB | C | 5×4×4/2 = 40 | Tech Lead |
| P2.2 | **Scoring Calculator v2** — enhanced spreadsheet: confidence sub-scores, coverage/freshness/verification | Spreadsheet | C | 5×5×4/2 = 50 | PM |
| P2.3 | **Client Portal (Notion)** — intake, evidence upload, status view for active Sprint clients | Notion | B+C | 4×4×4/2 = 32 | Tech Lead |
| P2.4 | **Retainer Onboarding Kit** — welcome packet, recurring cadence, evidence refresh schedule, escalation contacts | Doc | C | 4×5×5/1 = 100 | CS Manager |
| P2.5 | **Retainer Reporting Template** — monthly maturity delta, top risks, roadmap velocity, next actions | Slides/Doc | B | 4×5×5/1 = 100 | CS Manager |
| P2.6 | **Automated Evidence Staleness Alerts** — Notion/Zapier automation to flag stale artifacts | Automation | C | 4×4×4/2 = 32 | Ops Engineer |
| P2.7 | **Benchmarking Tracker** — anonymized cross-client score comparisons in spreadsheet | Spreadsheet | A+B | 3×3×4/2 = 18 | Analytics |
| P2.8 | **QA Rubric for Sprint Delivery** — peer review checklist for scoring and readout quality | Doc | C | 5×5×4/1 = 100 | QA Lead |
| P2.9 | **Reviewer Workflow (lightweight)** — named reviewer approval step before final readout | Process | C | 5×4×5/1 = 100 | PM + QA |
| P2.10 | **Retainer → Expansion Playbook** — upsell triggers, timing, conversation guide | Doc | B | 4×4×5/1 = 80 | CS + Sales |

### Phase 2 Goals
1. Sprint delivery time reduced to ≤ 8 hours consultant time.
2. Evidence vault operational for all active clients.
3. 3 retainer clients active ($9k–$21k MRR).
4. Second team member independently delivers a Sprint.
5. QA reviewer gate enforced on all client deliverables.

### Phase 2 Success Metrics
| Metric | Target | How to Measure |
|--------|--------|----------------|
| Sprint delivery time | ≤ 8 hrs | Time-tracked per Sprint |
| Active retainers | ≥ 3 | CRM: retainer stage |
| Retainer MRR | ≥ $9k | Finance records |
| Sprint-to-retainer conversion | ≥ 33% | CRM stage tracking |
| Evidence vault utilization | 100% of active clients | Notion DB row count |
| Reviewer gate pass rate | ≥ 95% first pass | QA review log |
| Team delivery independence | 1 non-founder Sprint | Delivery log |

### Phase 2 Dependencies
- Phase 1 completion (scoring rubric validated on real data)
- Retainer pricing model approved (see PRICING_MODEL.md)
- CS Manager capacity for retainer onboarding
- Notion/Airtable workspace provisioned

### Phase 2 Go/No-Go Gate (Day 60)
**Proceed to Phase 3 only if:**
- [ ] 3+ active retainers generating recurring revenue
- [ ] Evidence vault operational with ≥ 2 client datasets
- [ ] Sprint delivery is repeatable by at least 1 non-founder team member
- [ ] QA reviewer gate enforced on 100% of deliverables

---

## PHASE 3: Repeatable Platform Basics (Day 60–90)

### North Star Outcome
10 clients through the system. Platform-grade assessment flow. Automated scoring. Benchmarking value visible. Retainer churn < 10%.

### Philosophy
Build the platform now that you know exactly what clients need from real delivery experience. Every platform feature must replace a manual process that is already proven to work. No speculative builds.

---

### Features / Artifacts

| # | Feature | Format | LEVER | ICE-S | Owner |
|---|---------|--------|-------|-------|-------|
| P3.1 | **Web-based Assessment Flow** — guided 7-domain questionnaire with progress state | Web app | C | 5×4×3/3 = 20 | Fullstack Eng |
| P3.2 | **Automated Scoring Engine** — deterministic scoring from structured inputs | Backend | C | 5×5×3/3 = 25 | Fullstack Eng |
| P3.3 | **Maturity Dashboard** — domain scores, overall index, confidence, trend vs previous | Web app | B+C | 5×4×3/3 = 20 | Fullstack Eng |
| P3.4 | **Automated Roadmap Generator** — ranked recommendations with score-lift estimates | Web app | C | 5×4×3/3 = 20 | Fullstack Eng |
| P3.5 | **One-click Executive Export** — PDF: summary + domain detail + risks + roadmap + evidence appendix | Web app | B | 4×4×4/2 = 32 | Fullstack Eng |
| P3.6 | **Audit Trail** — immutable log of scoring-impacting changes with actor + timestamp | Backend | C | 5×5×3/3 = 25 | Fullstack Eng |
| P3.7 | **Re-assessment Scheduler** — configure recurring cadence, auto-launch from prior run | Web app | C | 4×4×3/2 = 24 | Eng + Ops |
| P3.8 | **Benchmarking Module** — anonymized cohort comparisons, velocity metrics | Web app | A | 3×3×3/3 = 9 | Analytics Eng |
| P3.9 | **Client Self-serve Portal** — clients can upload evidence and view their own scores | Web app | C | 4×3×3/3 = 12 | Fullstack Eng |
| P3.10 | **Stale Evidence Alerting (platform)** — configurable staleness rules per control domain | Backend | C | 4×4×3/2 = 24 | Eng + Ops |

### Phase 3 Goals
1. 10 clients through the full assessment-to-roadmap flow.
2. Platform-grade assessment flow reduces Sprint delivery time to ≤ 4 hours.
3. Automated scoring engine produces deterministic outputs validated against manual baseline.
4. Benchmarking view available for 3+ clients.
5. Retainer churn ≤ 10%.

### Phase 3 Success Metrics
| Metric | Target | How to Measure |
|--------|--------|----------------|
| Cumulative clients | ≥ 10 | CRM: closed-won count |
| Sprint delivery time (platform) | ≤ 4 hrs | Time-tracked per Sprint |
| Automated scoring accuracy vs manual | ≤ 2% deviation | QA test pack |
| Platform time-to-baseline | ≤ 60 min (first-time) | Measured per session |
| Re-assessment launch time (returning) | ≤ 15 min | Measured per session |
| Retainer MRR | ≥ $30k | Finance records |
| Monthly retainer churn | ≤ 10% | CRM tracking |
| Executive export generation | ≤ 2 min | Platform logs |
| Platform NPS | ≥ 8/10 | In-app survey |

### Phase 3 Dependencies
- Phase 1 + 2 completion
- Tech Lead + Fullstack Engineer capacity allocated
- At least 2 complete real-client datasets for scoring validation
- Security review before client data stored on platform
- DevOps Engineer for hosting/deployment pipeline

### Phase 3 Go/No-Go Gate (Day 90)
**Proceed to SaaS / scale roadmap only if:**
- [ ] 10+ clients through system
- [ ] Platform scoring validated against manual baseline
- [ ] Monthly retainer MRR ≥ $30k
- [ ] Security review completed before public launch
- [ ] Customer success process stable with < 10% monthly churn

---

## Cross-Phase ICE-S Priority Summary

| Phase | Top Priority Feature | ICE-S Score | Lever | Why First |
|-------|----------------------|-------------|-------|-----------|
| P1 | Roadmap Output Template | 125 | C | First thing clients pay for |
| P1 | Sales One-Pager | 125 | A | Enables pipeline at scale |
| P1 | Compass Sprint Proposal | 125 | B | Blocks deal close without it |
| P1 | Delivery SOP v1 | 125 | C | Enables repeatable Sprint delivery |
| P2 | Retainer Onboarding Kit | 100 | C | Converts Sprint to recurring revenue |
| P2 | Retainer Reporting Template | 100 | B | Justifies retainer renewal |
| P2 | QA Rubric for Sprint Delivery | 100 | C | Reduces buyer risk, builds trust |
| P3 | Automated Scoring Engine | 25 | C | Enables scale beyond founder |

---

## What This Roadmap Does NOT Include (Intentional Deferrals)
See FEATURE_PRIORITIZATION.md → Cut List for full rationale.

- SaaS self-serve onboarding
- Regulatory framework auto-mapping (SOC2, ISO 27001, EU AI Act)
- AI-powered recommendation engine
- Multi-tenant enterprise architecture
- SSO / enterprise auth
- Third-party tool integrations (automated evidence ingestion)
- Mobile app
- White-label capabilities
- Public API

---

## Milestone Calendar

| Date | Milestone | Phase | Cash Signal |
|------|-----------|-------|-------------|
| Day 7 | All Phase 1 sales + delivery artifacts reviewed and approved | P1 | — |
| Day 14 | First Compass Sprint delivered using manual tooling | P1 | Invoice sent |
| Day 21 | $5k collected (first Sprint) | P1 | **CASH FIRST hit** |
| Day 30 | 3 Sprints sold; Phase 1 go/no-go gate | P1 | $15k target |
| Day 45 | Evidence vault live; first retainer client onboarded | P2 | MRR begins |
| Day 60 | 3 retainers active; Phase 2 go/no-go gate | P2 | $9k+ MRR |
| Day 75 | Platform assessment flow live; automated scoring in test | P3 | — |
| Day 90 | 10 clients through system; $30k+ MRR target | P3 | Scale begins |

---

## Files created/updated
- `AMC_OS/PRODUCT/PRODUCT_ROADMAP.md`

## Acceptance checks
- [ ] Every feature maps to LEVER A, B, or C
- [ ] Every phase has measurable success metrics
- [ ] Go/no-go gates defined before phase transitions
- [ ] ICE-S scores computed consistently
- [ ] Deferrals explicitly listed

## Next actions
1. Assign owners to all Phase 1 artifacts and set Day 7 completion target
2. Validate scoring rubric with REV_QA_LEAD before first Sprint delivery
3. Get Phase 1 sales artifacts through REV_COMPLIANCE_OFFICER review gate
4. Set up CRM stage tracking to measure conversion rates
5. Define time-tracking method for Sprint delivery hours

## Risks/unknowns
- Scoring rubric calibration requires real client data — may shift after first Sprint
- Phase 2 timeline depends on retainer conversion rate (not guaranteed at 33%)
- Phase 3 engineering timeline assumes dedicated fullstack capacity (not yet confirmed)
- Client willingness to provide evidence artifacts is assumed but unvalidated
