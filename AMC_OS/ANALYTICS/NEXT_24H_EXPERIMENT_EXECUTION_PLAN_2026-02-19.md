# NEXT-24H EXPERIMENT EXECUTION PLAN (2026-02-19)

Owner: INNO_GROWTH_EXPERIMENT_SCIENTIST  
Primary lever: **B — Conversion**  
Related strategy files: 
- `AMC_OS/CAMPAIGNS/GROWTH_EXPERIMENTS.md`
- `AMC_OS/ANALYTICS/NEXT_WEEK_CONVERSION_EXPERIMENTS_TOP5.md`

## 1) Objective for next 24 hours
Launch or hard-stage the fastest conversion experiments with clean measurement so Day-2 readouts are decision-ready.

## 2) Experiments in scope (next 24h)

### E1 — Pricing Page Clarity (Plan fit + limits)
- **Status target by +24h:** Variant live at 50/50 split (or feature-flagged for launch)
- **KPI target:** +15% relative lift in pricing CTA clicks (variant vs control)
- **Guardrails:**
  - Bounce rate not worse than +10% relative
  - No spike in support tickets tagged “pricing confusion”
- **Minimum sample gate for first read:** 200 pricing sessions/variant OR 48h (whichever first)

### E2 — CTA Social Proof Near Conversion Moment
- **Status target by +24h:** 3 ICP-matched proof modules published on LP variants
- **KPI target:** +10% relative lift in LP CTA CTR
- **Guardrails:**
  - Core Web Vitals stable (LCP regression < 200ms)
  - Compliance check passed for every proof statement
- **Minimum sample gate for first read:** 300 LP sessions/variant OR 72h

### E3 — Sales Objection Library (Top 10 cards)
- **Status target by +24h:** Library shipped + call script inserted into active sequences
- **KPI target:** +5 percentage-point lift in Reply→Booked
- **Guardrails:**
  - Median call duration does not increase >15%
  - QA call score >= current baseline
- **Minimum sample gate for first read:** 30 qualified replies handled with new library

## 3) 24-hour execution timeline (IST)

### 09:00–10:00 — Pre-flight alignment
- Confirm DRIs:
  - E1: REV_LANDING_PAGE_BUILDER + REV_HEAD_OF_GROWTH
  - E2: REV_BRAND_MESSAGING + REV_COPYWRITER_DIRECT_RESPONSE
  - E3: REV_HEAD_OF_SALES + REV_OBJECTION_COACH
- Freeze hypotheses, success metrics, and guardrails in tracker.

### 10:00–13:00 — Build + QA
- E1/E2 content and page modules implemented.
- E3 objection cards finalized and mapped to 10 common blockers.
- QA pass: link checks, copy compliance, mobile rendering.

### 13:00–14:00 — Instrumentation verification
- Run event-debug pass (see section 4 checklist).
- Validate UTM capture, variant assignment, and CRM/source sync.

### 14:00–16:00 — Go-live window
- Launch E1/E2 split tests.
- Roll E3 assets to SDR/AE team and enable required usage note in call prep.

### 16:00–18:00 — Data sanity + enablement
- Confirm first events appear in dashboard by experiment ID.
- Sales enablement huddle for objection library usage standard.

### 18:00–19:00 — End-of-day checkpoint memo
- Log launch status, blockers, and day-2 read plan in tracker.

## 4) Required instrumentation checks (must-pass before launch)

## A. Tracking schema integrity
- [ ] Every experiment has a unique `experiment_id` (`E1_PRICING_CLARITY`, `E2_CTA_PROOF`, `E3_OBJECTION_LIB`).
- [ ] Mandatory UTM params present on all traffic links:
  - `utm_source`, `utm_medium`, `utm_campaign`, `utm_content`, `utm_term` (optional), `cta_variant`.
- [ ] Variant field captured (`control` vs `variant`) on all conversion events.

## B. Event-level checks
- [ ] E1 events firing: `pricing_view`, `pricing_cta_click`, `trial_start|demo_request`.
- [ ] E2 events firing: `lp_view`, `proof_module_view`, `lp_cta_click`.
- [ ] E3 events firing/logged: `reply_received`, `call_booked`, `objection_card_used` (CRM note/tag acceptable if event bus unavailable).

## C. Funnel join checks
- [ ] Anonymous web session joins to lead record (cookie/session ID -> lead ID where allowed).
- [ ] Lead record joins to opportunity stages in CRM (`MQL`, `SQL`, `Booked`, `Won/Lost`).
- [ ] Attribution view available in both first-touch and last-touch.

## D. Data quality checks
- [ ] Duplicate event rate <2% for key conversion events.
- [ ] Missing-UTM rate <5% on inbound leads.
- [ ] Timestamp consistency: all events in IST or normalized UTC with display conversion.

## E. Dashboard readiness checks
- [ ] Control vs variant chart for each in-scope experiment.
- [ ] Primary KPI + guardrails visible side-by-side.
- [ ] Daily auto-refresh enabled and owner assigned.

## 5) KPI scorecard to monitor (Day 1 launch + Day 2 read)

| Experiment | Primary KPI | Day-1 launch check | Day-2 read target | Guardrail |
|---|---|---|---|---|
| E1 Pricing clarity | Pricing CTA CTR | Event flow live + split balanced 45–55% | Trend toward +15% rel | Bounce <= +10% rel |
| E2 CTA proof | LP CTA CTR | Proof module impressions visible | Trend toward +10% rel | LCP regression <200ms |
| E3 Objection library | Reply→Booked % | 100% active reps have cards | Early lift signal toward +5 pp | Call duration <= +15% |

## 6) Decision rules after first read
- **Ship-forward:** Positive primary trend + no guardrail break.
- **Iterate:** Positive trend but one guardrail warning (change exactly one variable).
- **Kill/pause:** Flat or negative primary KPI with clear guardrail breach.

## 7) Dependency/risk log (next 24h)
- Missing baseline volumes can delay confidence.
- CRM tagging discipline risk for E3 usage measurement.
- Engineering bandwidth risk for variant deployment windows.

---
Files created/updated: `AMC_OS/ANALYTICS/NEXT_24H_EXPERIMENT_EXECUTION_PLAN_2026-02-19.md`  
Acceptance checks:
- 3 launchable experiments specified with KPI targets + guardrails.
- 24h schedule includes owner handoffs and hard checkpoints.
- Instrumentation checklist includes schema, event, join, quality, dashboard checks.
Next actions:
1. Assign DRIs and approve launch windows by 09:30 IST.
2. Complete instrumentation checklist and sign-off before go-live.
3. Publish end-of-day launch memo with first data sanity screenshots.
Risks/unknowns:
- Traffic/reply volume may be insufficient for quick significance.
- Tagging inconsistency may weaken E3 measurement quality.
- Web changes could slip if QA defects emerge late.