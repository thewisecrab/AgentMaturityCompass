# AMC FEATURE PRIORITIZATION
**Owner:** REV_PRODUCT_MANAGER  
**Lever:** C (Delivery-readiness) → B (Conversion) → A (Pipeline)  
**Last updated:** 2026-02-18  
**Constraint:** CASH FIRST mode. Every feature scored against $5k collection probability impact.

---

## Scoring Methodology

### Dimensions
| Dimension | Scale | Description |
|-----------|-------|-------------|
| **LEVER** | A / B / C | A = Pipeline, B = Conversion, C = Delivery-readiness |
| **Impact on $5k Goal** | 1–5 | Direct effect on collecting $5k in ≤ 30 days |
| **Customer Pain Severity** | 1–5 | How acutely clients feel the absence of this feature |
| **Effort** | 1–5 | 1 = < 1 day, 2 = 1–3 days, 3 = 3–7 days, 4 = 1–3 weeks, 5 = > 3 weeks |
| **ICE-S Score** | Formula | `(Impact × Pain × (6 - Effort)) / 3` — normalized for comparison |

> **Note on Effort:** Inverted (6 - Effort) so that lower effort = higher score. Max possible = `(5 × 5 × 5) / 3 = 41.7`. Scores below 15 are in the "defer" zone.

---

## TOP 20 FEATURES — Ranked Backlog

### TIER 1: SHIP NOW — Direct path to $5k (Score ≥ 30)

| Rank | Feature | LEVER | Impact | Pain | Effort | Score | Phase |
|------|---------|-------|--------|------|--------|-------|-------|
| 1 | **Compass Sprint Proposal Template** — scope, timeline, fee, payment terms, acceptance criteria | B | 5 | 5 | 1 | 41.7 | P1 |
| 2 | **Delivery SOP v1** — end-to-end Sprint runbook (intake → score → readout → invoice) | C | 5 | 5 | 1 | 41.7 | P1 |
| 3 | **Scoring Rubric Spreadsheet** — L1–L4 per 10 dimensions, auto-weighted index | C | 5 | 5 | 1 | 41.7 | P1 |
| 4 | **Sales One-Pager** — problem/offer/proof/CTA, PDF-ready, compliance-approved | A | 5 | 4 | 1 | 38.3 | P1 |
| 5 | **Roadmap Output Template** — top-10 actions, owner, due date, expected score lift | C | 5 | 5 | 1 | 41.7 | P1 |
| 6 | **Executive Readout Deck Template** — 10-slide structure: score → gap → roadmap → next step | B | 5 | 5 | 1 | 41.7 | P1 |
| 7 | **Evidence Collection Checklist** — per-domain artifact request list, client-facing | C | 4 | 5 | 1 | 38.3 | P1 |
| 8 | **SOW Template** — linked to proposal, payment milestones, change-control clause | B | 5 | 4 | 1 | 38.3 | P1 |
| 9 | **Discovery Call Script** — qualification questions, pain mapping, objection handlers, next-step close | B | 5 | 4 | 1 | 38.3 | P1 |
| 10 | **QA Review Checklist for Deliverables** — peer review gate before client delivery | C | 4 | 4 | 1 | 32.0 | P1 |

> **Tier 1 insight:** All 10 are documents/templates buildable in < 1 day each. Combined they represent the complete path from prospect → signed SOW → delivered readout → collected payment. Zero code required.

---

### TIER 2: SHIP BY DAY 30–60 — Retainer enablement + delivery efficiency (Score 20–30)

| Rank | Feature | LEVER | Impact | Pain | Effort | Score | Phase |
|------|---------|-------|--------|------|--------|-------|-------|
| 11 | **Retainer Onboarding Kit** — welcome packet, cadence, evidence refresh schedule | C | 4 | 5 | 1 | 38.3 | P2 |
| 12 | **Retainer Reporting Template** — monthly delta, risks, roadmap velocity, next actions | B | 4 | 4 | 1 | 32.0 | P2 |
| 13 | **Evidence Vault (Notion/Airtable)** — structured store with owner, date, control mapping, verification status | C | 4 | 4 | 2 | 26.7 | P2 |
| 14 | **Reviewer Workflow (lightweight)** — named approver gate before final client delivery | C | 4 | 4 | 1 | 32.0 | P2 |
| 15 | **Client Portal (Notion)** — intake, evidence upload, status view for active Sprint clients | B+C | 3 | 4 | 2 | 20.0 | P2 |
| 16 | **Retainer → Expansion Playbook** — upsell triggers, timing, conversation scripts | B | 4 | 3 | 1 | 28.0 | P2 |
| 17 | **Scoring Calculator v2** — confidence sub-scores (coverage/freshness/verification), automated index | C | 4 | 4 | 2 | 26.7 | P2 |

---

### TIER 3: SHIP BY DAY 60–90 — Platform basics (Score 10–20)

| Rank | Feature | LEVER | Impact | Pain | Effort | Score | Phase |
|------|---------|-------|--------|------|--------|-------|-------|
| 18 | **Web-based Assessment Flow** — guided 7-domain form with progress persistence | C | 5 | 4 | 4 | 13.3 | P3 |
| 19 | **Automated Scoring Engine** — deterministic scoring from structured inputs | C | 5 | 4 | 4 | 13.3 | P3 |
| 20 | **One-click Executive PDF Export** — summary + domain detail + roadmap + evidence appendix | B | 4 | 4 | 3 | 17.8 | P3 |

---

## FEATURE SCORING DETAIL

### Feature 1: Compass Sprint Proposal Template
- **LEVER:** B (Conversion) — directly enables close
- **Impact on $5k:** 5 — cannot collect without signed proposal
- **Customer Pain:** 5 — buyers won't sign ambiguous scope
- **Effort:** 1 — 2-4 hours; adapt from existing SOW format
- **Acceptance criteria:** Scope, exclusions, timeline, fee, payment terms, acceptance criteria, change-control clause, liability cap all present; passes compliance review
- **Owner:** REV_PROPOSAL_SOW_SPECIALIST

### Feature 2: Delivery SOP v1
- **LEVER:** C (Delivery-readiness) — enables repeatable execution
- **Impact on $5k:** 5 — without SOP, first Sprint may fail or drag, destroying retainer path
- **Customer Pain:** 5 — client experience quality depends on structured delivery
- **Effort:** 1 — aggregate existing docs into runbook format
- **Acceptance criteria:** Any trained team member can run Sprint independently; 5-step checklist passes QA gate
- **Owner:** REV_IMPLEMENTATION_SPECIALIST + PM

### Feature 3: Scoring Rubric Spreadsheet
- **LEVER:** C (Delivery-readiness) — the scoring heart of the product
- **Impact on $5k:** 5 — without scores, there is no deliverable
- **Customer Pain:** 5 — clients need objective, auditable scoring
- **Effort:** 1 — rubric design complete; needs spreadsheet implementation
- **Acceptance criteria:** Same inputs produce same outputs in 3 consecutive runs; all 10 dimensions have L1–L4 descriptors and weights; generates overall maturity index
- **Owner:** REV_PRODUCT_MANAGER

### Feature 4: Sales One-Pager
- **LEVER:** A (Pipeline) — enables outbound at scale
- **Impact on $5k:** 5 — gate to getting prospects into pipeline
- **Customer Pain:** 4 — prospects want a leave-behind to share internally
- **Effort:** 1 — copywriting + design; 1 day
- **Acceptance criteria:** Problem → offer → proof → CTA clear in 60 seconds; compliance-approved; no unverified claims
- **Owner:** REV_COPYWRITER_DIRECT_RESPONSE + REV_BRAND_MESSAGING

### Feature 5: Roadmap Output Template
- **LEVER:** C (Delivery-readiness) — primary deliverable value
- **Impact on $5k:** 5 — roadmap is what the client buys
- **Customer Pain:** 5 — AI teams need prioritized, owned action plan
- **Effort:** 1 — templated spreadsheet or slides
- **Acceptance criteria:** Top-10 actions, each with owner role, due date, expected score lift, effort estimate; exports to PDF; client-presentable without formatting work
- **Owner:** REV_PRODUCT_MANAGER

### Features 6–10: (abbreviated for brevity — full scoring in Tier 1 table above)
All are single-day template/document builds. Full detailed acceptance criteria in DELIVERY_SOPS.md and the respective role playbooks.

---

## CUT LIST — What NOT to Build Before First 10 Clients

> These features are frequently discussed but will destroy CASH FIRST momentum if built prematurely. They belong in a future roadmap cycle after 10 clients and $50k+ MRR.

### CUT: SaaS Self-Serve Onboarding
- **Why not now:** Clients in first 10 are enterprise/mid-market buyers. They want white-glove delivery, not self-serve. Self-serve requires extensive UX, edge case handling, support infrastructure. 
- **Opportunity cost:** 4–8 weeks of engineering time that could deliver 15+ Sprints manually.
- **When to revisit:** After 10 clients and documented repeatable delivery process.

### CUT: Regulatory Framework Auto-Mapping (SOC2, ISO 27001, EU AI Act, NIST AI RMF)
- **Why not now:** Regulatory mapping is a legal liability if wrong. Requires deep domain expertise per framework. Each framework is a multi-month project. Adds complexity without improving $5k collection speed.
- **Opportunity cost:** Distraction from core AMC maturity assessment value prop.
- **When to revisit:** When 3+ clients specifically request it and are willing to co-fund development.

### CUT: AI-Powered Recommendation Engine
- **Why not now:** Hallucination risk on client-specific technical recommendations destroys trust. Manual expert recommendations are higher quality. AI engine requires training data from real assessments (need 50+ first).
- **Opportunity cost:** Trust and quality risk in first client engagements.
- **When to revisit:** After 50+ assessments providing training signal.

### CUT: Multi-Tenant Enterprise Architecture
- **Why not now:** Overengineered for current scale. First 10 clients can use separate Notion workspaces. Premature architecture creates technical debt and slows iteration.
- **When to revisit:** When active concurrent client count exceeds 15.

### CUT: SSO / Enterprise Auth (SAML, OIDC)
- **Why not now:** No client in pipeline has requested it yet. Enterprise procurement cycle is too long for CASH FIRST mode. Adds 2–4 weeks engineering work.
- **When to revisit:** When enterprise deal requires it as procurement condition.

### CUT: Automated Evidence Ingestion (third-party tool integrations)
- **Why not now:** Integration engineering is expensive and fragile. Manual evidence collection works fine for first 10 clients. Clients need to control evidence quality anyway.
- **Connectors that are NOT in scope:** GitHub, Jira, Datadog, Splunk, AWS CloudTrail, PagerDuty.
- **When to revisit:** When 5+ clients cite evidence ingestion as primary friction point.

### CUT: Mobile App
- **Why not now:** Maturity assessments are serious, deliberate work — not mobile-native use cases. No buyer has requested it.
- **When to revisit:** Never (within 90-day horizon).

### CUT: White-Label / Client Reseller Capability
- **Why not now:** Reseller channel requires legal agreements, brand standards, support tiers. Premature without a proven core product.
- **When to revisit:** After 10 direct clients and revenue baseline established.

### CUT: Public API / Webhook Framework
- **Why not now:** API design requires stable data model. Data model will change through first 10 client assessments. Breaking API changes create support burden.
- **When to revisit:** After data model is stable (≥ 10 assessments, ≥ 3 reassessment cycles).

### CUT: Benchmarking Module (full platform)
- **Why not now:** Benchmarking requires at least 10 client datasets to be meaningful. Currently have 0. A benchmarking module with 1-2 datasets provides false signals.
- **Phase 2 exception:** Manual benchmarking spreadsheet is acceptable in Phase 2 as a sales tool ("here's how others score") if labeled as directional, not statistical.
- **When to revisit:** Phase 3, with ≥ 5 datasets, clearly labeled confidence intervals.

---

## Feature Backlog Health Check

| Category | Features in Backlog | Tier 1 (Ship Now) | Tier 2 (30-60d) | Tier 3 (60-90d) | Deferred |
|----------|--------------------|--------------------|-----------------|-----------------|---------|
| Sales/Conversion | 5 | 4 | 1 | 0 | 3 |
| Delivery/Product | 8 | 5 | 3 | 0 | 5 |
| Platform/Engineering | 9 | 0 | 3 | 3 | 3 |
| **Total** | **22** | **9** | **7** | **3** | **11** |

---

## Lever Alignment Check

| Lever | Features in Top 20 | % of Backlog |
|-------|-------------------|--------------|
| A (Pipeline) | 2 | 10% |
| B (Conversion) | 6 | 30% |
| C (Delivery-readiness) | 10 | 50% |
| B+C (dual) | 2 | 10% |

> **Interpretation:** Heavy Delivery-readiness weighting is correct for CASH FIRST mode — every delivery risk eliminated directly increases close probability. Balance will shift toward A (Pipeline) in Phase 2 as we build outbound scale.

---

## Files created/updated
- `AMC_OS/PRODUCT/FEATURE_PRIORITIZATION.md`

## Acceptance checks
- [ ] Top 20 features all have LEVER, Impact, Pain, Effort scores
- [ ] ICE-S formula applied consistently
- [ ] Cut list has explicit rationale and "when to revisit" condition
- [ ] Every Tier 1 feature has owner identified
- [ ] No feature in top 10 requires > 3 days of effort

## Next actions
1. Assign owners to all Tier 1 features and set Day 7 ship date
2. Compliance gate review for all external-facing features (1-pager, proposal, SOW)
3. QA Lead to define acceptance test format for scoring rubric determinism check
4. Revisit cut list after each Sprint delivery — client feedback may reprioritize
5. Add effort actuals to backlog after Phase 1 delivery to calibrate future estimates

## Risks/unknowns
- First client Sprint may reveal missing rubric dimensions — scoring rubric may need iteration
- Sales one-pager effectiveness is unproven — treat as hypothesis, A/B test messaging
- Cut list assumes direct sales motion — if partner/agency channel emerges, white-label may move up
