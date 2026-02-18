# GROWTH EXPERIMENTS — REV_HEAD_OF_GROWTH

## Scope & assumptions
- Time horizon: next 30 days (Day 6–25 execution mode).
- Primary commercial goals: sell **AMC Compass Sprint ($5k)** and convert to **AMC Continuous Maturity ($3k–$15k/mo)**.
- ICP focus: AI-first B2B services firms, mid-market SaaS copilots/agents teams, and agencies needing white-label maturity assessments.
- Constraint: truthful, evidence-based claims only (no guaranteed outcomes).

## North-star growth model
- **Acquisition:** qualified sessions + qualified leads from owned/earned channels.
- **Activation:** % of leads booking Diagnostic Call or Assessment Kickoff.
- **Revenue:** Sprint closes + retainer expansion from sprint graduates.

## Experiment backlog (ranked by ICE)

| ID | Experiment | Funnel stage | Hypothesis | Primary metric | Guardrail metric | ICE (I/C/E) | Owner | Status |
|---|---|---|---|---|---|---|---|---|
| G1 | Offer-led LP variant: “5-Day Compass Sprint” above fold | Visit → Lead | If pricing + tangible outputs are explicit above the fold, lead CVR will rise 20%+ | LP visitor→form CVR | Bounce rate | 9/8/8 = 25 | REV_HEAD_OF_GROWTH + REV_LANDING_PAGE_BUILDER | Planned |
| G2 | CTA split test: “Book Diagnostic” vs “Get Sample Scorecard” | Lead capture | A lower-friction content CTA will increase total leads; booking CTA will increase SQL rate | Lead rate + SQL rate by CTA | Demo no-show % | 8/7/8 = 23 | Growth + Sales | Planned |
| G3 | Proof stack insertion (mini case snippets with evidence language) | Consideration | Evidence snippets increase trust and meeting-book rate | Lead→meeting booked % | Time-on-page | 8/7/7 = 22 | Growth + Brand | Planned |
| G4 | LinkedIn 3-post conversion sequence/week tied to one CTA | Demand gen | Structured sequence will produce more attributable qualified leads than standalone posts | Attributed MQLs/week | Negative feedback rate | 7/8/8 = 23 | REV_SOCIAL_LINKEDIN | Planned |
| G5 | Webinar-to-offer bridge: “Maturity Mistakes That Delay Launch” + fast follow email | MQL→SQL | Webinar attendees offered a 15-min roadmap review convert to SQL at >12% | Attendee→SQL % | Unsubscribes | 7/7/7 = 21 | REV_WEBINAR_PRODUCER + Email | Planned |
| G6 | Sprint close sequence (3-touch post-call follow-up with decision memo) | SQL→Closed Won | Structured follow-up improves close rate by reducing buying friction | SQL→Won % | Sales cycle length | 9/7/7 = 23 | REV_HEAD_OF_SALES + Growth | Planned |
| G7 | Sprint-to-retainer expansion offer at Day 5 readout | Expansion | If expansion offer is introduced with KPI baseline + 90-day gap plan, retainer attach improves 15% | Sprint→Retainer attach % | Churn < 90 days | 10/7/7 = 24 | Account Mgmt + Growth | Planned |
| G8 | Referral trigger program for satisfied sprint clients (non-cash incentive) | Referral | Triggered referral ask after readout yields 1+ qualified referral per 4 completed sprints | Referrals/sprint cohort | CAC payback period | 6/6/8 = 20 | Partnerships + Growth | Planned |

## Detailed experiment cards (Top 5 to execute first)

### G1 — Offer-led Landing Page Variant
- **Problem:** Current messaging may under-communicate concrete commercial value quickly.
- **Change:** New hero: clear problem, offer, price anchor, outputs, CTA; add “Who this is for” and “Who this is not for.”
- **Audience:** ICP segments 1 and 2.
- **Setup:** A/B test 50/50 for at least 500 unique sessions or 14 days.
- **Success criteria:**
  - +20% uplift in visitor→lead CVR (primary)
  - No >10% increase in bounce rate (guardrail)
- **Decision rule:** Ship winner if 90%+ confidence and no guardrail break.

### G2 — CTA Split Test (High-intent vs Low-friction)
- **Problem:** Unclear whether audience is ready to book directly.
- **Variants:**
  - A: “Book a 20-min Diagnostic Call”
  - B: “Get a Sample Evidence Scorecard”
- **Success criteria:**
  - Variant winner selected by weighted score: 60% SQL rate, 40% lead volume
- **Follow-up automation:**
  - Scorecard requesters receive 3-email conversion nurture over 7 days.

### G3 — Proof Stack Insertion
- **Problem:** Buyers may perceive maturity claims as generic consulting talk.
- **Change:** Add 3 concise proof snippets with concrete before/after evidence language and explicit disclaimers (results vary by context).
- **Success criteria:**
  - +15% lift in lead→meeting-booked
  - No compliance/claim violations

### G6 — Sprint Close Sequence Optimization
- **Problem:** Deals stall after positive discovery due to decision ambiguity.
- **Change:** Standard 3-touch sequence:
  1) Same-day recap + fit summary
  2) Day 2 objection-handling memo with scope/ROI logic
  3) Day 4 deadline-based decision prompt with transparent next steps
- **Success criteria:**
  - +10% SQL→Won in 30 days
  - No increase in refund risk indicators

### G7 — Sprint-to-Retainer Expansion Trigger
- **Problem:** Expansion is handled ad hoc, reducing attach rate.
- **Change:** Add “Day 5 Expansion Moment” in readout deck:
  - Baseline maturity score + 90-day risk map
  - 2 retainer plan options with explicit deliverables and exclusions
- **Success criteria:**
  - +15% Sprint→Retainer attach within 21 days of sprint completion

## Instrumentation plan
- **UTM discipline:** channel / campaign / content / CTA_variant mandatory.
- **Weekly KPI cut:**
  - Traffic: unique sessions by source
  - Conversion: visitor→lead, lead→SQL, SQL→Won
  - Expansion: Sprint→Retainer attach
- **Attribution windows:**
  - Self-serve leads: 7-day click
  - Sales-led: first-touch + last-touch dual view

## Operating cadence
- Monday: launch/update experiments
- Wednesday: mid-week read + guardrail checks
- Friday: decision memo (Ship / Iterate / Kill)

## Dependencies
- Sales: SLA for lead follow-up < 24h
- Content/Social: publish sequence on schedule
- Analytics: dashboard views for experiment IDs

---
Files created/updated: AMC_OS/CAMPAIGNS/GROWTH_EXPERIMENTS.md
Acceptance checks:
- 8 experiments documented with hypothesis, metric, owner, and status.
- Top 5 include explicit setup + success criteria + decision rule.
- All experiments map to acquisition/activation/revenue and comply with truthful-claims policy.
Next actions:
1. Build G1/G2 variants with REV_LANDING_PAGE_BUILDER.
2. Create weekly KPI dashboard cut by experiment ID.
3. Align Sales SLA + follow-up templates for G6.
4. Add Day-5 expansion module to sprint readout template for G7.
5. Start first test cycle next Monday.
Risks/unknowns:
- Baseline funnel conversion data is not yet documented in a single dashboard.
- Traffic volume may be insufficient for fast statistical confidence.
- Proof snippet quality depends on available client evidence artifacts.
