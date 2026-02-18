# PRICING EXPERIMENTS — AMC COMPASS SPRINT
**Owner:** INNO_PRICING_EXPERIMENTER  
**Lever:** B — Conversion  
**Version:** 1.0 | **Date:** 2026-02-18  
**Peer Review Required By:** REV_HEAD_OF_SALES + REV_CFO_FINANCE

---

## Context & Assumptions
- Current anchor price: $5,000 fixed fee for Compass Sprint (5 business days)
- ICP segments: AI-first B2B services firms, mid-market SaaS copilot/agent teams, agencies (white-label)
- Goal: increase signed Sprint conversion rate without eroding margin or brand integrity
- Assumption: baseline close rate from SQL → Won is currently unknown; treat as ~20–30% (document actuals in IMPACT_LOG)
- All experiments are truthful, evidence-based; no guaranteed outcome promises

---

## EXPERIMENT P1 — Anchor Framing (High-Price Anchor vs Current Flat)

### Hypothesis
If we present a higher-priced "comprehensive" option alongside the standard Sprint, buyers perceive the $5k Sprint as the rational, value-right choice — increasing Sprint close rate without discounting.

### Variants
| Variant | Structure | Price Presented |
|---------|-----------|-----------------|
| **Control (A)** | $5,000 Sprint — single option | $5,000 flat |
| **Variant B** | 3-tier menu: Sprint / Sprint+ / Full Maturity Program | $5k / $7.5k / $15k |

**Sprint+ ($7,500) extras (real scope additions, not phantom):**
- Day 4 live mid-sprint executive briefing (30 min)
- Written risk memo (board/investor-ready format)
- 2 follow-up async scoring reviews (30-day check)
- Priority scheduling (kickoff within 24h of signature)

**Full Maturity Program ($15,000):** Sprint + 2-month retainer starter block. Real deliverables, not puffery.

### Primary Metric
Sprint offer acceptance rate (SQL → Won %)

### Guardrail Metrics
- Average deal value must not drop below $4,800
- Refund/dispute rate stays < 5%
- Sales cycle length does not increase >3 days

### Decision Rule
- **Ship:** Variant B shows ≥15% relative lift in SQL→Won with no guardrail breach at 90% confidence
- **Iterate:** Positive trend but guardrail on cycle length → simplify Sprint+ extras
- **Kill:** No lift after 20 SQLs per variant; revert to single-tier

### Duration
21 days or 20 SQLs per variant (whichever is first)

### Setup Notes
- Present 3-tier via proposal page and verbal call sequence
- Track which tier was pitched and which was accepted in CRM
- Document assumption: Sprint+ scope additions are deliverable at stated quality (verify with REV_IMPLEMENTATION_SPECIALIST)

---

## EXPERIMENT P2 — Payment Structure Framing (Upfront vs Split)

### Hypothesis
If we offer a payment split option (50% upfront, 50% on readout delivery), then close rate increases among budget-constrained buyers without reducing total revenue — because perceived financial risk drops.

### Variants
| Variant | Structure | Cash Impact |
|---------|-----------|-------------|
| **Control (A)** | $5,000 due upfront on signature | $5k day 0 |
| **Variant B** | $2,500 on signature + $2,500 on Day 5 readout delivery | $2.5k day 0, $2.5k day 5 |
| **Variant C** | $4,000 upfront + $1,000 30-day retainer credit (only usable as retainer) | Retainer attach incentive |

### Primary Metric
SQL → Won conversion rate; also track "payment objection rate" (explicit price objection mentions in CRM notes)

### Guardrail Metrics
- Total collected per deal ≥ $5,000
- Days to full payment collection ≤ 10 days
- No increase in deal abandonment after partial payment

### Decision Rule
- **Ship B:** ≥10% relative lift in close rate; full payment collected within 7 days in ≥90% of cases
- **Ship C:** Sprint→Retainer attach increases by ≥20% within 30 days
- **Kill:** Any variant that increases payment collection risk (>5% partial-pay abandonment)

### Duration
28 days or 15 closed deals per variant

### Setup Notes
- Variant C is a retainer expansion play embedded in pricing — coordinate with G7 experiment
- REV_CFO_FINANCE must approve cash flow exposure before launch
- CRM must track payment schedule by deal ID

---

## EXPERIMENT P3 — Price Anchoring via Cost-of-Delay Framing

### Hypothesis
If we reframe the Sprint price relative to the cost of shipping a misconfigured AI agent (business risk quantification), then $5,000 feels cheap relative to the alternative — improving close rate without changing the number.

### Variants
| Variant | Framing Used in Proposal & Sales Call |
|---------|---------------------------------------|
| **Control (A)** | Standard: "AMC Compass Sprint — $5,000 for 5 days" |
| **Variant B** | Risk anchor: "One undiscovered AI failure mode can cost [$50k–$500k] in incident remediation, regulatory exposure, and customer trust loss. The Sprint is $5,000 — 1–10% of that floor." |
| **Variant C** | Time-cost anchor: "Your team is spending ~$X/week maintaining AI systems without a maturity baseline. The Sprint pays back in [weeks] if it surfaces one major gap." [Use client's own headcount data from discovery] |

**Assumptions to label explicitly:**  
- B: $50k–$500k failure cost figures are illustrative ranges based on publicly known AI incident analyses; must be framed as "ranges vary by context" not guaranteed
- C: X is calculated from discovery call notes (headcount × burdened cost estimate); always labeled "estimated"

### Primary Metric
Proposal → Won conversion rate (delta between framing variants)

### Guardrail Metrics
- No compliance violations (REV_COMPLIANCE_OFFICER must pre-approve claim language)
- No increase in "feels like a scare tactic" feedback in post-call CRM notes
- Proposal send → call-booked rate unchanged (framing shouldn't repel)

### Decision Rule
- **Ship:** Variant B or C shows ≥15% relative lift in Proposal→Won; compliant claims confirmed
- **Iterate:** One variant works better — A/B between B and C only
- **Kill:** Any claim language flagged by REV_COMPLIANCE_OFFICER; revert to control

### Duration
21 days or 30 proposals sent per variant

### Setup Notes
- Write 2 cost-of-delay paragraph templates (for B and C) approved by REV_COMPLIANCE_OFFICER BEFORE testing
- Sales team uses framing naturally in call; variant B/C language embedded in proposal email template
- CRM note: which framing was used on each deal

---

## EXPERIMENT P4 — "Early-Bird" Urgency Pricing (Deadline-Gated Discount)

### Hypothesis
If we introduce a time-limited "founding client rate" ($4,500 vs $5,000) with explicit expiry, then deals in negotiation close faster — reducing average sales cycle length without materially reducing deal value.

### Variants
| Variant | Offer | Expiry Mechanic |
|---------|-------|-----------------|
| **Control (A)** | $5,000, no deadline anchor | Standard |
| **Variant B** | $4,500 "Founding Client Rate" — available for deals signed before [rolling 5-day window] | Explicit date in proposal + follow-up email |

**Important guardrails on this experiment:**
- "Founding Client Rate" must be truthfully limited (not fake urgency). Used for first N clients only — cap at 5 deals then retire this variant.
- Discount is $500 (10%) — within concession ladder parameters
- Frame the discount as: "We're in early commercialization; we offer a lower rate to our first cohort in exchange for a brief case study reference after sprint completion." This is authentic.

### Primary Metric
Sales cycle length (days from SQL → Won); secondary: close rate

### Guardrail Metrics
- Average deal value ≥ $4,500 (no further concessions on top)
- Case study reference commitment obtained in writing (separate to SOW)
- Total Founding Client slots cap tracked; revert once 5 filled

### Decision Rule
- **Ship:** Cycle length reduced by ≥2 days with acceptable deal value; reference commitment secured in ≥80% of cases
- **Kill:** If buyers use the offer as leverage for further concessions (second discount request >20% of cases)

### Duration
Run until 5 Founding Client slots filled OR 30 days, whichever first. One-time experiment — do not repeat.

### Setup Notes
- This variant is a time-limited, authentic early-adopter program, not a manufactured pressure tactic
- REV_LEGAL_CONTRACTS must confirm case study reference language in SOW/addendum
- Track in CRM as "Founding Client" deal type

---

## EXPERIMENT P5 — Value-Add Bundling vs Cash Discount (Which Moves More Deals?)

### Hypothesis
If we offer value-adds (non-cash extras: additional stakeholder seats, async follow-up support, priority scheduling) instead of cash concessions, then close rate improves while protecting average revenue per deal better than a straight discount.

### Variants
| Variant | Offer When Buyer Hesitates |
|---------|---------------------------|
| **Control (A)** | Hold price; offer to narrow scope as concession |
| **Variant B** | Add value: "We'll add a 30-day async follow-up session (30 min) and one additional stakeholder interview at no extra cost" |
| **Variant C** | Cash discount: reduce from $5,000 to $4,500 (10% off) |

### Primary Metric
Hesitation-to-close conversion rate (% of "hesitant" deals that close within 5 days of concession offer)

### Guardrail Metrics
- Average deal value: B should be ≥$5,000 (no cash concession), C floors at $4,500
- Delivery effort for value-adds must be pre-approved by REV_IMPLEMENTATION_SPECIALIST (scope feasibility)
- Concession rate (% of deals requiring any offer) tracked; target <40%

### Decision Rule
- **Ship B:** Hesitation→Close rate ≥80% AND average deal value ≥$5,000 → value-add bundle wins; add to standard concession playbook
- **Ship C:** C closes more deals than B AND average deal value difference is <$300 → cash discount may be simpler; evaluate margin impact
- **Kill:** Neither shows hesitation-to-close >60%; problem is likely in earlier funnel (positioning, ICP fit)

### Duration
30 days or 20 hesitant deal events logged per variant

### Setup Notes
- Define "hesitation event" in CRM: any deal where prospect says "let me think about it," "budget concern," or similar — tagged at call notes level
- REV_OBJECTION_COACH coordinates with REV_HEAD_OF_SALES to ensure consistent variant delivery

---

## Summary Table

| ID | Name | Primary Lever | Primary Metric | Duration | Risk Level |
|----|------|--------------|----------------|----------|------------|
| P1 | Anchor Framing (3-tier) | B | SQL→Won % | 21 days / 20 SQLs | Medium |
| P2 | Payment Split Structure | B | Close rate + payment risk | 28 days / 15 deals | Medium |
| P3 | Cost-of-Delay Reframe | B | Proposal→Won % | 21 days / 30 proposals | Low-Medium |
| P4 | Early-Bird Urgency (Founding Client) | B | Sales cycle days | Until 5 slots filled | Low |
| P5 | Value-Add vs Cash Discount | B | Hesitation→Close % | 30 days / 20 events | Low |

**Recommended run order:** P4 → P3 → P1 → P5 → P2 (P4 first for speed; P2 last due to CFO sign-off needed)

---

## Files Created/Updated
- `AMC_OS/ANALYTICS/PRICING_EXPERIMENTS.md` (this file)

## Acceptance Checks
- [ ] 5 experiments each have: hypothesis, variants with explicit pricing, primary metric, guardrail, decision rule, duration
- [ ] Anchoring experiment (P1) and framing experiment (P3) included
- [ ] All claim language flagged for compliance review
- [ ] No guaranteed outcome promises; all figures labeled as targets or illustrative ranges
- [ ] All experiments map to Lever B (Conversion)

## Next Actions
1. REV_HEAD_OF_SALES: approve P3 cost-of-delay claim language with REV_COMPLIANCE_OFFICER before any test run
2. REV_CFO_FINANCE: approve P2 split-payment cash-flow exposure
3. REV_LEGAL_CONTRACTS: draft case study reference clause for P4 Founding Client SOW
4. REV_REVOPS_CRM: add CRM fields for experiment variant, concession type, and payment schedule
5. Start P4 immediately (requires no system change; verbal + email update only)

## Risks/Unknowns
- Baseline SQL→Won rate unknown; first 10 SQLs will establish baseline before drawing conclusions
- Sprint+ extras in P1 must be validated as deliverable without quality degradation
- Urgency pricing (P4) risks brand perception if not executed authentically
- Value-add bundle (P5) requires delivery team to absorb extra scope; capacity check required
