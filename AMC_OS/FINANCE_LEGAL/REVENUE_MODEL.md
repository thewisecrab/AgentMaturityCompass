# REVENUE MODEL (REV_CFO_FINANCE)

## 1) Business model summary
AMC operates a **productized B2B AI implementation + growth execution** model with two primary revenue streams:
1. **Implementation Sprint (one-time setup)**
2. **Managed Growth Retainer (ongoing execution + optimization)**

Secondary streams:
- Add-on automation scopes
- Partner/referral sourced deals
- Upsell from SMB to Mid-Market plans

---

## 2) Pricing architecture (INR)

### Core offers
- **Starter Sprint (SMB):** ₹1,20,000 one-time (2–3 weeks)
- **Growth Sprint (Mid-Market):** ₹2,40,000 one-time (3–4 weeks)
- **SMB Retainer:** ₹75,000 / month
- **Mid-Market Retainer:** ₹1,50,000 / month

### Typical contract mix assumption
- 60% SMB logos, 40% Mid-Market logos
- 70% of sprint clients convert to retainer within 30 days
- 15% of retained clients purchase one add-on per quarter (avg ₹60,000)

---

## 3) Unit economics assumptions (realistic baseline)

### Funnel + conversion assumptions
- Avg qualified opportunities/month: 18
- Win rate from qualified: 22%
- New clients/month: ~4
- Deal mix per month: 2 SMB sprint + 2 Mid-Market sprint

### Delivery capacity assumptions
- Active sprint capacity at quality bar: 6 concurrent
- Active retainer capacity per pod: 14 clients
- Gross margin target:
  - Sprint: 52–58%
  - Retainer: 60–68%

### Collection assumptions
- Sprint payment terms: 70% upfront, 30% at delivery signoff
- Retainer terms: monthly advance (1st–5th), 7-day grace
- Realized collections vs billed (net of delays/disputes): 92–95%

---

## 4) 6-month target ladder (bookings, billings, cash)

> All numbers are planning assumptions, not guarantees.

| Month | New Sprints (count) | New MRR Added | Total MRR Exit | One-time Sprint Billings | Total Billings | Target Cash Collections |
|---|---:|---:|---:|---:|---:|---:|
| M1 | 4 | ₹2,25,000 | ₹2,25,000 | ₹7,20,000 | ₹9,45,000 | ₹8,40,000 |
| M2 | 5 | ₹3,00,000 | ₹5,25,000 | ₹9,00,000 | ₹14,25,000 | ₹12,80,000 |
| M3 | 6 | ₹3,75,000 | ₹9,00,000 | ₹10,80,000 | ₹19,80,000 | ₹18,00,000 |
| M4 | 6 | ₹3,75,000 | ₹12,75,000 | ₹10,80,000 | ₹23,55,000 | ₹21,60,000 |
| M5 | 7 | ₹4,50,000 | ₹17,25,000 | ₹12,60,000 | ₹29,85,000 | ₹27,30,000 |
| M6 | 8 | ₹5,25,000 | ₹22,50,000 | ₹14,40,000 | ₹36,90,000 | ₹33,70,000 |

### Ladder gates (must-hit checkpoints)
1. **Gate A (by end M2):** ₹5L MRR exit + >90% on-time collections
2. **Gate B (by end M4):** ₹12L+ MRR exit + DSO < 18 days
3. **Gate C (by end M6):** ₹20L+ MRR exit + 3-month cash runway visibility

---

## 5) Weekly cashflow checkpoint system

### Weekly operating cadence (Friday CFO checkpoint)
Track each week:
1. **Opening cash balance**
2. **Inflow (actual collected this week)**
3. **Outflow (payroll, tools, contractors, ads, tax reserves)**
4. **Net weekly burn / net generation**
5. **Closing cash balance**
6. **Receivables aging (0–7 / 8–15 / 16–30 / 31+)**
7. **Next 14-day committed inflow vs committed outflow**

### Weekly threshold rules
- **Green:** Next 14-day inflow >= 1.3x outflow
- **Amber:** Next 14-day inflow 1.0x–1.29x outflow
- **Red:** Next 14-day inflow < outflow

### Mandatory actions by status
- **Green:** continue planned hiring/spend
- **Amber:** freeze discretionary spend; pull forward collections
- **Red:** no new discretionary spend; founder-level collection calls within 24h; payment-plan negotiations on payable side

---

## 6) Revenue risk controls
- No delivery start without signed SoW + initial payment proof
- Credit terms only for approved accounts (max 15 days, one invoice cycle)
- Client concentration cap: no single client >18% of monthly billings
- Minimum gross margin floor per new deal: 50%
- Tax reserve ringfence: 12% of gross collections moved weekly

---

## 7) KPI dashboard (weekly + monthly)

### Weekly
- New bookings (₹)
- Cash collected (₹)
- Collection efficiency (%) = collected / due
- DSO (days)
- Gross margin realized (%)
- Cash runway (months)

### Monthly
- MRR opening, expansion, churn, closing
- Sprint-to-retainer conversion (%)
- Revenue by channel (direct, partner, referral)
- CAC payback estimate
- Net revenue retention (when historical base stabilizes)

---

## 8) Finance operating assumptions to review monthly
- Win rate variance by segment
- Discount leakage (% vs list price)
- Delivery cost creep by account type
- Payment delay pattern by client cohort
- Capacity utilization vs quality SLA

---

## Files created/updated
- `AMC_OS/FINANCE_LEGAL/REVENUE_MODEL.md`

## Acceptance checks
- Contains explicit pricing, funnel, and margin assumptions
- Includes a month-by-month target ladder with numeric billings and cash collections
- Defines weekly cashflow checkpoint fields and escalation triggers

## Next actions
1. Align this model with `AMC_OS/SALES/PRICING.md` and `AMC_OS/SALES/OFFERS.md` for one source of truth.
2. Create a live weekly cash tracker in sheet format using these fields.
3. Validate collection assumptions against first 8–12 signed invoices.
4. Recalibrate conversion and margin assumptions at month-end.

## Risks/unknowns
- Early-stage data is thin; assumptions may shift materially in first 60 days.
- Mid-Market sales cycles can delay MRR ramp timing.
- Collection cycle risk increases if enterprise terms are extended without controls.
