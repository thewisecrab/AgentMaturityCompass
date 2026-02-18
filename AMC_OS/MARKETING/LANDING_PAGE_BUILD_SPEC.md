# AMC Compass Sprint — Landing Page Build Spec (Implementation-Ready)

Owner: REV_LANDING_PAGE_BUILDER  
Date: 2026-02-18  
Primary Lever: **B — Conversion**  
Source assets: `ASSETS/landing_page_copy.md`, `AMC_OS/MARKETING/MESSAGING_HOUSE.md`

## 1) Goal, KPI, and Audience

## Goal
Convert qualified ASC/AMC leadership visitors into booked fit calls.

## KPI Targets (primary + leading)
- **Primary KPI:** Fit-call booking rate (sessions → confirmed calls)
- **Leading KPI 1:** Hero primary CTA click-through rate
- **Leading KPI 2:** Scroll depth to Process + FAQ sections
- **Leading KPI 3:** Form completion rate (if embedded scheduler/form)

## ICP (on-page intent)
- ASC/AMC executive leaders
- Physician owners / operating partners
- Growth, strategy, operations stakeholders evaluating near-term expansion priorities

## Messaging guardrail
Use evidence-backed, compliance-safe claims only. No guarantees of revenue, outcomes, or “risk-free” language.

---

## 2) Information Architecture + Section Specs

## S0 — Global Header (sticky optional)
**Purpose:** Orientation + persistent conversion path  
**Components:** Logo, nav anchors, Primary CTA button (`Book a 20-minute Fit Call`)  
**Notes:** Keep nav minimal: Overview, Deliverables, Process, FAQ.

## S1 — Hero
**Objective:** Clarify offer in first viewport and drive first CTA click.

**Copy**
- H1: “Stop guessing your next AMC move. Get a clear, compliant 90-day growth roadmap.”
- Subhead: “The AMC Compass Sprint is a focused strategy engagement for Ambulatory Surgery Center leaders who want practical direction on service-line growth, referral pathways, and operational readiness—without months of consulting.”
- Primary CTA: “Book a 20-minute Fit Call”
- Secondary CTA: “See What’s Included” (anchor to S4)
- Microcopy: “No long-term commitment. No implementation lock-in. Just a clear plan you can execute.”

**UX notes**
- Desktop: left copy / right visual card with 2–3 bullets (“2–3 week sprint”, “90-day roadmap”, “executive readout”).
- Mobile: CTA stack above fold; microcopy visible without expanding accordions.

## S2 — Problem Framing
**Heading:** “If growth feels fragmented, it usually is.”

**Bullets (exact themes):**
- Unprioritized growth ideas
- Referral dependence concentration
- Capacity/staffing constraints
- Marketing with unclear impact
- Leadership misalignment

**Close line:** “The Compass Sprint closes that gap with a practical roadmap built for your market and your team.”

## S3 — Offer Definition
**Heading:** “What is the AMC Compass Sprint?”

**Body:** 2–3 week strategic sprint resulting in a decision-ready 90-day plan.  
**Sub-block:** “Ideal For” bullet list (executive leaders, physician owners, growth/ops teams).

## S4 — Deliverables
**Heading:** “What you get”

Use 5 card/list items with icon + 1-line outcome:
1. Strategic Assessment Snapshot
2. Priority Opportunity Map
3. 90-Day Action Roadmap
4. Risk & Constraint Notes
5. Leadership Readout Session

**Secondary CTA placement:** Inline button under cards: “Schedule Your Fit Call”.

## S5 — Process Timeline
**Heading:** “How it works”

5-step timeline:
1) Fit & Scope (Week 0)  
2) Discovery (Week 1)  
3) Analysis & Prioritization (Week 1–2)  
4) Roadmap Build (Week 2)  
5) Executive Readout (Week 2–3)

**Implementation note:** Use progressive disclosure on mobile (accordion per step).

## S6 — Proof / Trust Framing
**Heading:** “Built on pattern recognition, not generic templates.”

**Body:** Tailored recommendations; no inflated claims.  
**Trust signals module:** leave placeholders for verified credentials/logos only.

## S7 — Primary CTA Band
**Heading:** “Get clarity before your next planning cycle.”

- Primary CTA: “Schedule Your Fit Call”
- Supporting copy: “We’ll determine fit, answer questions, and outline the fastest route to a decision-ready roadmap.”

## S8 — FAQ
Include 6 FAQs from source copy:
- timeline (2–3 weeks)
- inputs needed
- strategy vs implementation scope
- fit for smaller/single-site
- no guaranteed outcomes
- not legal/financial/clinical advice

## S9 — Compliance Footer
Include recommended disclaimer block exactly (or legal-approved variant).

---

## 3) Component Map (Design → Build)

| Component ID | Type | Content Source | Props / Data | Acceptance Criteria |
|---|---|---|---|---|
| `lp.header.v1` | Sticky header | this spec | navLinks[], primaryCTA | CTA always visible after 50% scroll |
| `lp.hero.v1` | Hero section | source copy | h1, subhead, ctaPrimary, ctaSecondary, microcopy | H1 + primary CTA visible above fold (desktop/mobile) |
| `lp.problem.v1` | Problem bullets | source copy | heading, bullets[] | Exactly 5 bullets, no rewritten claims |
| `lp.offer.v1` | Offer explainer | source copy | heading, body, idealFor[] | Offer duration shown as 2–3 weeks |
| `lp.deliverables.v1` | Cards/list | source copy | items[5] {title, desc} | All 5 deliverables present |
| `lp.process.v1` | Timeline | source copy | steps[5] {name, window, details} | Sequencing matches Week 0→2/3 |
| `lp.proof.v1` | Trust framing | source copy + approved proof | body, trustSignals[] | No unverified logos/claims rendered |
| `lp.cta_band.v1` | CTA strip | source copy | heading, body, cta | Click routes to scheduler/form |
| `lp.faq.v1` | Accordion | source copy | qa[] | Includes outcomes disclaimer FAQ |
| `lp.footer_compliance.v1` | Disclaimer | source copy | disclaimerText | Visible on all breakpoints |

---

## 4) CTA + Event Tracking Spec

## Event naming standard
`lp_compass_<section>_<action>`

## Core events
1. `lp_compass_hero_primary_click`
   - Trigger: Hero primary CTA click
   - Params: `cta_text`, `page_variant`, `device_type`

2. `lp_compass_hero_secondary_click`
   - Trigger: Hero secondary CTA click
   - Params: `target_section="deliverables"`, `page_variant`

3. `lp_compass_deliverables_cta_click`
   - Trigger: CTA click below deliverables
   - Params: `cta_text`, `scroll_pct`

4. `lp_compass_mid_cta_click`
   - Trigger: CTA band click (S7)
   - Params: `cta_text`, `scroll_pct`, `device_type`

5. `lp_compass_scheduler_open`
   - Trigger: scheduler modal open or external booking URL load
   - Params: `source_cta`, `page_variant`

6. `lp_compass_booking_submit`
   - Trigger: successful booking/form submit
   - Params: `source_cta`, `meeting_type`, `page_variant`

7. `lp_compass_faq_expand`
   - Trigger: each FAQ item open
   - Params: `faq_id`, `faq_topic`

8. `lp_compass_scroll_75`
   - Trigger: first reach 75% scroll depth
   - Params: `page_variant`, `time_on_page_sec`

## Reporting cuts (minimum)
- CTA CTR by section and device
- Booking conversion by CTA source
- Drop-off between scheduler open and booking submit

---

## 5) QA Checklist (Pre-Launch)

## Copy + Compliance QA
- [ ] All claims match `ASSETS/landing_page_copy.md`
- [ ] No guaranteed outcomes language
- [ ] Disclaimer block present and readable
- [ ] “Not legal/financial/clinical advice” statement included

## UX + Functional QA
- [ ] Primary CTA visible above fold on mobile and desktop
- [ ] All CTA targets resolve correctly (scheduler or form)
- [ ] Anchor links navigate to intended sections
- [ ] FAQ accordion keyboard accessible
- [ ] Page passes responsive checks at 375/768/1024/1440 widths

## Analytics QA
- [ ] All 8 events firing once per interaction
- [ ] `source_cta` parameter populated on scheduler open + submit
- [ ] Variant parameter available for A/B tests
- [ ] Dashboard view confirms event ingestion

## Performance + Technical QA
- [ ] LCP < 2.5s on primary template
- [ ] No layout shift on hero CTA load
- [ ] Metadata title/description aligned to offer intent
- [ ] Basic schema markup (Organization + Service) included if supported

---

## 6) Assumptions + Dependencies

## Assumptions
- Scheduler tool supports source attribution parameter passing.
- Brand/legal owner will provide approved trust signals before launch.
- CMS/component system supports reusable section blocks.

## Dependencies
- Final approved logos/case snippets (if any)
- Analytics workspace access for event validation
- Reviewer sign-off from `REV_BRAND_MESSAGING` (content) and `REV_COMPLIANCE_OFFICER` (claims)

---

## 7) Quality Rubric Run (required) + Revision Pass

## V1 self-check
- Q1 usable in ≤5 min? **Mostly yes** (needed clearer component IDs)
- Q2 concrete steps/templates/examples? **Yes**
- Q3 acceptance checks included? **Yes**
- Q4 reduces next-step uncertainty? **Mostly yes** (needed stricter event naming)
- Q5 TOOLS.md compliant? **Yes**

## Revision applied (V2)
- Added strict component IDs + acceptance criteria table.
- Standardized event namespace + required params for attribution.
- Expanded QA with compliance + analytics validation gates.

## V2 self-check
- Q1 **Yes**
- Q2 **Yes**
- Q3 **Yes**
- Q4 **Yes**
- Q5 **Yes**

---

## 8) Tomorrow Improvement Experiment (one only)

**Experiment:** Hero CTA copy A/B test  
- Control: “Book a 20-minute Fit Call”  
- Variant: “Get Your 90-Day Growth Roadmap”  
- KPI moved: Hero CTA CTR → booking rate (primary conversion funnel)  
- Success threshold: +15% relative lift in hero CTA CTR with no drop in booking-submit rate.
