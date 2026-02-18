# AMC KPI DASHBOARD SPEC — $5K SPRINT GOAL
**Owner:** REV_ANALYTICS_ENGINEER  
**Version:** 1.0 | **Date:** 2026-02-18  
**Lever:** B (Conversion) + A (Pipeline)  
**Peer Review Required By:** REV_COO_ORCH  
**Purpose:** Single-pane view of every metric that determines whether AMC collects $5,000 within the sprint window. Updated daily until goal is hit, then shifts to weekly cadence.

---

## Dashboard Overview

**Dashboard Name:** AMC Revenue Sprint Dashboard — $5k Goal  
**Primary Audience:** REV_COO_ORCH, REV_HEAD_OF_SALES, REV_ACCOUNT_EXEC_CLOSER  
**Secondary Audience:** All REV_* roles (read-only)  
**Refresh Cadence:** Daily (automated where possible, manual update EOD for CRM metrics)  
**Location:** Airtable dashboard (primary) + daily SCOREBOARD.md update (manual record)  
**Alert Channel:** Slack #revenue-ops (threshold breach notifications)

---

## SECTION 1 — NORTH STAR METRIC

### Metric: `Cumulative Cash Collected ($)`

| Field | Value |
|---|---|
| **Definition** | Total USD cash received in AMC's bank account from paying clients. Not billed, not signed — cash in bank. Sum of all `payment_received` events. |
| **Data Source** | Accounting tool (QuickBooks / FreshBooks) → HubSpot activity log → SCOREBOARD.md |
| **Update Frequency** | Real-time (accounting tool) / Daily (SCOREBOARD.md) |
| **Current Value** | $0 (baseline 2026-02-18) |
| **Sprint Target** | **$5,000** |
| **Alert Threshold** | Alert at $2,500 (50% milestone — "halfway!") and $5,000 (goal hit — "🎯 GOAL ACHIEVED") |
| **Visualization** | Large single-number gauge with progress bar from $0 → $5,000 |
| **Formula** | `SUM(payment_received.amount_collected)` |

---

## SECTION 2 — PIPELINE METRICS

### Metric 2.1: `Pipeline Velocity ($)`

| Field | Value |
|---|---|
| **Definition** | Rate at which new dollar value is progressing through the pipeline per day/week. Combines pipeline size, win rate, deal value, and cycle length. Formula: `(# Qualified Opportunities × Win Rate × Average Deal Value) / Average Sales Cycle Days` |
| **Data Source** | HubSpot CRM (deal stage data) |
| **Update Frequency** | Daily |
| **Sprint Target** | Pipeline Velocity ≥ $1,000/day (to hit $5k within 5 business days from a single signed deal; or ≥ $500/day for a 10-day runway) |
| **Alert Threshold** | 🔴 <$250/day → immediate bottleneck review; 🟡 $250–$999/day → AE coaching trigger; 🟢 ≥$1,000/day → on track |
| **Visualization** | Trend line (daily velocity over rolling 7 days) |
| **Formula** | `(count(deals WHERE stage ∈ [SQL, Proposal, Negotiation]) × win_rate_pct × avg_deal_value) / avg_cycle_days` |
| **Notes** | Win rate and average deal value use rolling best-estimate (updated weekly). Before sufficient history, use targets from REVENUE_MODEL.md (22% win rate, $5k deal value). |

---

### Metric 2.2: `Weighted Pipeline ($)`

| Field | Value |
|---|---|
| **Definition** | Sum of all active deal values weighted by stage probability. Gives a risk-adjusted view of expected revenue. |
| **Data Source** | HubSpot CRM |
| **Update Frequency** | Daily |
| **Sprint Target** | ≥ $25,000 weighted pipeline by end of first week |
| **Alert Threshold** | 🔴 < $10,000 → pipeline is too thin to hit $5k even at optimistic win rate; 🟡 $10k–$24,999 → marginal; 🟢 ≥ $25,000 → healthy |
| **Visualization** | Bar chart by deal stage with stage probability labels |
| **Formula** | `SUM(deal.value × stage_probability)` where stage_probability = SQL: 15%, Proposal Sent: 30%, Negotiation: 60%, Verbal Yes: 85% |
| **Notes** | Stage probabilities are AMC assumptions (v1). Update after 10+ deals with actual data. |

---

### Metric 2.3: `New Qualified Leads Added (Daily / Weekly)`

| Field | Value |
|---|---|
| **Definition** | Count of net-new leads tagged as ICP-qualified and added to the pipeline in a given period. Qualified = ICP segment match + has a clear AI initiative + has decision-making authority confirmed. |
| **Data Source** | HubSpot CRM (filtered by `icp_segment ≠ null AND stage ≥ Contacted`) |
| **Update Frequency** | Daily |
| **Sprint Target** | ≥ 10 qualified leads/day; ≥ 50/week |
| **Alert Threshold** | 🔴 < 5/day for 2 consecutive days → SDR capacity or targeting issue; 🟡 5–9/day → borderline; 🟢 ≥ 10/day → healthy |
| **Visualization** | Bar chart (daily), cumulative line (weekly) |
| **Formula** | `COUNT(leads WHERE created_date = today AND icp_qualified = true)` |

---

### Metric 2.4: `Outbound Volume (Daily / Weekly)`

| Field | Value |
|---|---|
| **Definition** | Total number of personalized outbound touches sent (email + LinkedIn) in the period. Does not count automated broadcast blasts — only ICP-targeted, personalized touches. |
| **Data Source** | Instantly.ai / Apollo send logs + HubSpot LinkedIn activity log |
| **Update Frequency** | Daily |
| **Sprint Target** | ≥ 40 touches/day; ≥ 200 touches/week |
| **Alert Threshold** | 🔴 < 20/day → execution gap; SDR standup required; 🟡 20–39/day → below target; 🟢 ≥ 40/day → on track |
| **Visualization** | Daily bar chart with trend line vs target |
| **Formula** | `COUNT(email_sent) + COUNT(linkedin_message_sent) WHERE date = today` |

---

## SECTION 3 — FUNNEL CONVERSION RATES

### Metric 3.1: `Visitor → Lead Conversion Rate (%)`

| Field | Value |
|---|---|
| **Definition** | Percentage of unique website visitors who complete the intake form submission OR book a call directly. |
| **Data Source** | GA4 (sessions) → HubSpot (leads created) |
| **Update Frequency** | Daily |
| **Sprint Target** | ≥ 3% (industry baseline for B2B landing pages is 2–5%) |
| **Alert Threshold** | 🔴 < 1% → landing page copy, offer, or traffic quality issue; 🟡 1–2.9% → optimize; 🟢 ≥ 3% → healthy |
| **Visualization** | Funnel bar with absolute counts and conversion % labels |
| **Formula** | `(intake_form_submitted + call_booked_from_LP) / unique_sessions × 100` |
| **Notes** | Separate inbound (LP) from outbound (SDR-sourced) leads in reporting. This metric applies to inbound only. |

---

### Metric 3.2: `Lead → Reply Rate (%) — Outbound`

| Field | Value |
|---|---|
| **Definition** | Percentage of outbound leads contacted who reply with any response (including negative or OOO). Separate breakdown: positive-reply rate = replies with genuine interest. |
| **Data Source** | Instantly.ai / Apollo → HubSpot |
| **Update Frequency** | Daily |
| **Sprint Target** | Overall reply rate ≥ 8%; positive reply rate ≥ 3% |
| **Alert Threshold** | 🔴 < 4% → targeting, first-line, or subject line failure; 🟡 4–7.9% → test improvements; 🟢 ≥ 8% → on track |
| **Visualization** | Stacked bar: positive / negative / OOO replies as percentage of sends |
| **Formula** | `COUNT(email_replied WHERE reply_sentiment = 'positive') / COUNT(email_sent) × 100` |

---

### Metric 3.3: `Reply → Call Booked Rate (%)`

| Field | Value |
|---|---|
| **Definition** | Of all positive replies received, what percentage result in a booked discovery call? |
| **Data Source** | HubSpot (positive-reply events → call_booked events, same lead_id) |
| **Update Frequency** | Daily |
| **Sprint Target** | ≥ 40% of positive replies book a call |
| **Alert Threshold** | 🔴 < 20% → follow-up copy or booking friction issue; 🟡 20–39% → test Calendly link placement; 🟢 ≥ 40% → healthy |
| **Visualization** | Funnel step with absolute counts |
| **Formula** | `COUNT(call_booked WHERE lead.prior_event = email_replied_positive) / COUNT(email_replied_positive) × 100` |

---

### Metric 3.4: `Call Booked → Call Held Rate (%)`

| Field | Value |
|---|---|
| **Definition** | Of all booked discovery calls, what percentage are actually held (not cancelled, not no-show)? |
| **Data Source** | Calendly + HubSpot (call_booked vs call_completed with outcome ≠ no-show/cancelled) |
| **Update Frequency** | Daily |
| **Sprint Target** | ≥ 75% |
| **Alert Threshold** | 🔴 < 60% → reminder sequence or lead quality issue; 🟡 60–74% → investigate ICP segment; 🟢 ≥ 75% → healthy |
| **Visualization** | Funnel step with no-show count called out |
| **Formula** | `COUNT(call_completed WHERE outcome ≠ 'no-show') / COUNT(call_booked) × 100` |

---

### Metric 3.5: `Call Held → Proposal Sent Rate (%)`

| Field | Value |
|---|---|
| **Definition** | Of all calls held, what percentage result in a proposal being sent? |
| **Data Source** | HubSpot (call_completed → proposal_sent, same deal_id) |
| **Update Frequency** | Daily |
| **Sprint Target** | ≥ 50% (not every call will qualify — some leads are not a fit) |
| **Alert Threshold** | 🔴 < 25% → qualification script or ICP targeting issue; 🟡 25–49% → acceptable, improve call script; 🟢 ≥ 50% → strong |
| **Visualization** | Funnel step |
| **Formula** | `COUNT(proposal_sent) / COUNT(call_completed WHERE outcome = 'qualified') × 100` |

---

### Metric 3.6: `Proposal → Closed Won Rate (%)` — Win Rate

| Field | Value |
|---|---|
| **Definition** | Of all proposals sent, what percentage result in a signed deal and payment? (True win rate.) |
| **Data Source** | HubSpot (proposal_sent → deal_won, same deal_id) |
| **Update Frequency** | Weekly (low sample size initially; report weekly to avoid noise) |
| **Sprint Target** | ≥ 30% (target from REVENUE_MODEL.md baseline is 22%; optimize toward 30%+ with strong proposals) |
| **Alert Threshold** | 🔴 < 15% → proposal quality, pricing, or objection handling issue; 🟡 15–29% → review objection log; 🟢 ≥ 30% → strong |
| **Visualization** | Win rate gauge + trend line (weekly) |
| **Formula** | `COUNT(deal_won) / COUNT(proposal_sent) × 100` |

---

## SECTION 4 — OUTBOUND RESPONSE RATE (DETAILED)

### Metric 4.1: `Outbound Response Rate (%) — by ICP Segment`

| Field | Value |
|---|---|
| **Definition** | Reply rate broken down by ICP segment (AI-First/SaaS-Copilot/Agency). Identifies which segment responds best to outbound sequences. |
| **Data Source** | HubSpot (reply events grouped by `icp_segment`) |
| **Update Frequency** | Weekly |
| **Sprint Target** | Identify highest-responding segment within first 200 touches; double down on that segment |
| **Alert Threshold** | If any segment has 0 replies after 30 touches → immediate messaging review for that segment |
| **Visualization** | Grouped bar chart (segments × positive-reply rate) |
| **Formula** | `FOR EACH segment: COUNT(email_replied_positive WHERE icp_segment = X) / COUNT(email_sent WHERE icp_segment = X) × 100` |

---

### Metric 4.2: `Email Open Rate (%) — by Sequence Step`

| Field | Value |
|---|---|
| **Definition** | Percentage of sent emails opened, broken down by sequence step (Step 1, 2, 3, etc.). Used to identify which steps get attention vs get buried. Note: open rates are directional only due to Apple Mail Protection. |
| **Data Source** | Instantly.ai / Apollo |
| **Update Frequency** | Daily |
| **Sprint Target** | Step 1 ≥ 40% open rate (subject line quality benchmark); Step 2+ ≥ 25% |
| **Alert Threshold** | 🔴 Step 1 < 20% → subject line failure; test 3 variants immediately |
| **Visualization** | Line chart by sequence step (Step 1 → N) |
| **Formula** | `COUNT(email_opened WHERE sequence_step = N) / COUNT(email_sent WHERE sequence_step = N) × 100` |

---

### Metric 4.3: `Link Click Rate (%) — Outbound Emails`

| Field | Value |
|---|---|
| **Definition** | Percentage of delivered emails where recipient clicks any tracked link. More reliable than open rate as an engagement signal. |
| **Data Source** | Instantly.ai / Apollo |
| **Update Frequency** | Daily |
| **Sprint Target** | ≥ 4% click rate on primary CTA link (book-a-call link) |
| **Alert Threshold** | 🔴 < 2% → CTA copy, link placement, or offer clarity issue |
| **Visualization** | Bar chart by sequence step and link label |
| **Formula** | `COUNT(email_link_clicked WHERE link_label = 'book-a-call') / COUNT(email_sent) × 100` |

---

## SECTION 5 — DEAL CYCLE METRICS

### Metric 5.1: `Average Deal Cycle (Days) — First Touch to Closed Won`

| Field | Value |
|---|---|
| **Definition** | Mean number of calendar days from the first tracked outreach touch to the deal being marked Closed Won and invoice sent. |
| **Data Source** | HubSpot (deal created date vs deal_won date) |
| **Update Frequency** | Weekly (updated as deals close) |
| **Sprint Target** | ≤ 14 days average deal cycle for Compass Sprint (fixed-scope $5k product should close fast) |
| **Alert Threshold** | 🔴 > 30 days → deal is stalling; investigate if offer clarity or authority is the bottleneck; 🟡 15–30 days → acceptable but improve; 🟢 ≤ 14 days → fast sales motion |
| **Visualization** | Histogram of deal cycle lengths by won deals |
| **Formula** | `AVG(deal_won.timestamp - first_touch.timestamp) IN DAYS` |

---

### Metric 5.2: `Time in Stage (Days) — by Stage`

| Field | Value |
|---|---|
| **Definition** | Average number of days deals spend in each pipeline stage (Contacted, Replied, Call Booked, SQL, Proposal Sent, Negotiation). Identifies where the pipeline is clogging. |
| **Data Source** | HubSpot (stage entry/exit timestamps per deal) |
| **Update Frequency** | Weekly |
| **Sprint Target** | Contacted → Replied: ≤ 3 days; Reply → Call Booked: ≤ 2 days; Proposal Sent → Won: ≤ 7 days |
| **Alert Threshold** | Any stage where avg time exceeds 2× target = bottleneck, escalate to COO |
| **Visualization** | Horizontal bar chart (stages × avg days) with target line overlay |
| **Formula** | `FOR EACH stage: AVG(stage_exit_date - stage_entry_date) IN DAYS` |

---

### Metric 5.3: `Proposal-to-Close Days`

| Field | Value |
|---|---|
| **Definition** | Mean days from `proposal_sent` to `deal_won` or `deal_lost`. Measures how long buying decisions take after seeing the offer. |
| **Data Source** | HubSpot |
| **Update Frequency** | Weekly |
| **Sprint Target** | ≤ 7 days (Compass Sprint is a defined offer; should not require extended evaluation) |
| **Alert Threshold** | 🔴 > 14 days → proposal objections unresolved or decision-maker not engaged |
| **Visualization** | Box plot (median + quartiles) |
| **Formula** | `AVG(deal_won.timestamp - proposal_sent.timestamp) IN DAYS` |

---

## SECTION 6 — WIN RATE BY ICP

### Metric 6.1: `Win Rate by ICP Segment (%)`

| Field | Value |
|---|---|
| **Definition** | Proposal → Closed Won conversion rate, segmented by ICP category (AI-First B2B / SaaS Copilot Team / Agency). Identifies which segment has the highest close probability and shortest cycle. |
| **Data Source** | HubSpot (deal_won + deal_lost grouped by `icp_segment`) |
| **Update Frequency** | Weekly |
| **Sprint Target** | Identify top-performing segment by end of Week 2; concentrate outbound on that segment |
| **Alert Threshold** | If any segment has 0 wins after 5 proposals → pause outreach to that segment pending messaging review |
| **Visualization** | Grouped bar chart (ICP segment × win rate %) |
| **Formula** | `FOR EACH segment: COUNT(deal_won WHERE icp_segment = X) / COUNT(proposal_sent WHERE icp_segment = X) × 100` |

---

### Metric 6.2: `Average Deal Value by ICP Segment ($)`

| Field | Value |
|---|---|
| **Definition** | Mean deal value (at close) segmented by ICP. Determines which segment is worth prioritizing from a revenue-per-close perspective. |
| **Data Source** | HubSpot |
| **Update Frequency** | Weekly |
| **Sprint Target** | All segments at or above $5,000 (Compass Sprint is fixed price; watch for discount leakage) |
| **Alert Threshold** | If avg deal value for any segment falls below $4,500 → discount discipline issue; flag to REV_HEAD_OF_SALES |
| **Visualization** | Bar chart |
| **Formula** | `FOR EACH segment: AVG(deal_won.deal_value WHERE icp_segment = X)` |

---

### Metric 6.3: `Loss Reason Distribution`

| Field | Value |
|---|---|
| **Definition** | Breakdown of closed-lost deals by loss reason category. Shows where the offer, messaging, or process is failing. |
| **Data Source** | HubSpot (deal_lost.loss_reason — required field on stage change) |
| **Update Frequency** | Weekly |
| **Sprint Target** | No single loss reason > 40% of losses (concentration suggests a fixable, singular problem) |
| **Alert Threshold** | If "price" > 40% of losses → pricing or value communication problem; if "timing" > 40% → urgency triggers needed |
| **Visualization** | Pie chart or horizontal bar by loss reason |
| **Formula** | `COUNT(deal_lost GROUP BY loss_reason) / COUNT(deal_lost) × 100` |

---

## SECTION 7 — DELIVERY QUALITY METRICS

*(Relevant after first deal closed — for post-close quality tracking)*

### Metric 7.1: `Sprint Delivery On-Time Rate (%)`

| Field | Value |
|---|---|
| **Definition** | Percentage of Compass Sprints delivered (final readout held) within the agreed 5-business-day window. |
| **Data Source** | HubSpot (sprint_kickoff_held date vs readout_call_held date) |
| **Update Frequency** | Per sprint |
| **Target** | 100% (any delay is a risk flag) |
| **Alert Threshold** | Any delay beyond Day 5 triggers escalation to REV_PROGRAM_MANAGER |

---

### Metric 7.2: `Client Satisfaction Score (post-readout)`

| Field | Value |
|---|---|
| **Definition** | Post-readout survey score (1–10 NPS or CSAT) collected within 48 hours of readout call. |
| **Data Source** | Typeform survey → HubSpot |
| **Update Frequency** | Per sprint |
| **Target** | ≥ 8/10 average |
| **Alert Threshold** | Any score ≤ 6 triggers CSM recovery plan within 24 hours |

---

## DASHBOARD LAYOUT WIREFRAME

```
┌─────────────────────────────────────────────────────────────┐
│  AMC REVENUE SPRINT DASHBOARD — $5K GOAL          [date]   │
├──────────────────────────┬──────────────────────────────────┤
│  💰 CASH COLLECTED       │  🎯 WEIGHTED PIPELINE            │
│     $0 / $5,000          │     $0 / $25,000 target          │
│  ████░░░░░░░░░░ 0%       │  ████░░░░░░░░░░ 0%               │
├──────────────────────────┴──────────────────────────────────┤
│  FUNNEL CONVERSION RATES                                    │
│  Visitor→Lead: --%  |  Lead→Reply: --%  |  Reply→Booked: --% │
│  Booked→Held: --%   |  Held→Proposal: --%  |  Proposal→Won: --% │
├─────────────────────────────────────────────────────────────┤
│  DAILY ACTIVITY               │  PIPELINE VELOCITY          │
│  Outbound: 0 / 40 target      │  $0/day (target: $1k/day)   │
│  Replies: 0 / 8 target        │                             │
│  Calls Booked: 0 / 3 target   │  [trend line — 7d rolling]  │
│  Proposals: 0                  │                             │
├───────────────────────────────┴─────────────────────────────┤
│  WIN RATE BY ICP              │  AVG DEAL CYCLE             │
│  AI-First: --%                │  -- days (target: ≤14)      │
│  SaaS Copilot: --%            │  Proposal→Close: -- days    │
│  Agency: --%                  │                             │
├───────────────────────────────┴─────────────────────────────┤
│  LOSS REASON BREAKDOWN        │  OUTBOUND RESPONSE RATE     │
│  [pie chart — loss reasons]   │  Open: --% | Click: --%     │
│                               │  Reply: --% | Positive: --% │
└─────────────────────────────────────────────────────────────┘
```

---

## ALERT CONFIGURATION

| Alert | Trigger Condition | Channel | Recipient |
|---|---|---|---|
| 🎯 Goal Hit | `cumulative_collected ≥ $5,000` | Slack #general + email | Entire org |
| 🔴 Pipeline Too Thin | `weighted_pipeline < $10,000` for 2 consecutive days | Slack #revenue-ops | COO, Head of Sales |
| 🔴 Outbound Gap | `outbound_volume < 20` by 3pm local | Slack #revenue-ops | SDR leads + COO |
| 🔴 No Replies in 48h | `email_replied count = 0` for 48 hours | Slack #revenue-ops | COO, SDR leads |
| 🟡 No Calls Booked in 24h | `call_booked count = 0` for 24h | Slack #revenue-ops | AE, COO |
| 🔴 Open Rate Crash | `email_open_rate < 20%` on Step 1 | Slack #revenue-ops | SDR leads, Copywriter |
| 🔴 Deal Stale | `deal in stage = Proposal Sent AND days_in_stage > 7` | Slack #revenue-ops | AE owner |
| 🔴 Discount Alert | `deal_won.deal_value < $4,500` | Slack #revenue-ops | Head of Sales |

---

## DATA UPDATE RESPONSIBILITIES

| Metric Group | Owner | How Updated | SLA |
|---|---|---|---|
| Cash collected | REV_CFO_FINANCE | Accounting tool sync | Same day |
| HubSpot stage + activity | REV_ACCOUNT_EXEC_CLOSER | Manual entry after each touch | Within 1 hour |
| Outbound volume | REV_SDR leads | Instantly.ai / Apollo auto-sync | Real-time |
| Email engagement | REV_REVOPS_CRM | Auto-sync from email tools | Hourly |
| Call outcomes | REV_ACCOUNT_EXEC_CLOSER | Manual log after each call | Within 1 hour |
| Loss reasons | REV_ACCOUNT_EXEC_CLOSER | HubSpot required field | At stage change |
| ICP segment | REV_REVOPS_CRM | Auto-tagged from intake form | At lead creation |
| GA4 web metrics | REV_DATA_ENGINEER | GA4 auto | Real-time |

---

## V2 PLAN (if this dashboard underperforms)

If the dashboard is not preventing missed targets:
- **Variable to change:** Add a "daily forecast" model that projects end-of-week pipeline based on current velocity, so the team can course-correct mid-week rather than only reviewing at EOD.
- **Metric to add:** Outbound `first-line quality score` (manual SDR rating 1–5 per sequence variant) to correlate message quality with reply rate.

---

## Files Created/Updated
- `AMC_OS/ANALYTICS/KPI_DASHBOARD_SPEC.md` (this file)

## Acceptance Checks
- Every metric has: definition, data source, update frequency, sprint target, alert threshold ✅
- North star metric (`cumulative_collected`) is the first and most prominent metric ✅
- Funnel conversion rates cover all 5 stage transitions ✅
- Win rate by ICP segment is defined with actionable alert logic ✅
- Dashboard layout wireframe gives implementer a clear visual spec ✅
- Data ownership and SLA table prevents metric staleness ✅
- Alert configuration is specific (not "send an alert when things go wrong") ✅
- No guaranteed outcome claims ✅

## Next Actions
1. REV_ANALYTICS_ENGINEER: Build Airtable or Notion dashboard using layout wireframe above
2. REV_REVOPS_CRM: Configure HubSpot Slack alerts for deal_stale and discount conditions
3. REV_CFO_FINANCE: Confirm accounting tool → HubSpot sync path for `payment_received` (same-day update required)
4. REV_COO_ORCH: Review alert thresholds; adjust if targets shift after Week 1 data comes in
5. All SDR roles: Confirm email tool Slack integration is active for daily outbound volume alert

## Risks/Unknowns
- Pipeline velocity formula requires stable win rate + avg deal value estimates; both are assumptions until ≥5 deals are tracked
- Email open rate metric is directionally useful but unreliable for Apple Mail users (plan to weight click rate more)
- Airtable/BI tool selection for live dashboard build is unconfirmed — may need REV_TECH_LEAD input
- Loss reason data quality depends entirely on AE compliance — must enforce as required HubSpot field
