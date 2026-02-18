# EXPERIMENT TRACKER — DAILY OPERATIONS TEMPLATE
Owner: REV_HEAD_OF_GROWTH (with REV_COO_ORCH oversight)
Purpose: Run one-variable-at-a-time experiments with clean decisioning tied to revenue/delivery levers.

## Usage rules
1. One major variable changed per experiment cycle.
2. Every experiment must declare lever mapping (A Pipeline / B Conversion / C Delivery-readiness).
3. Every experiment must include stop/ship/iterate decision date.
4. If compliance risk appears, pause experiment until reviewed.

## Daily tracker table

| Date | Exp ID | Lever (A/B/C) | Hypothesis | Variable Changed | Control/Baseline | Primary Metric | Guardrail Metric | Midday Signal | EOD Signal | Decision Date | Owner | Status | Notes/Actions |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| 2026-02-19 | G1 | A | Offer-led LP hero clarity improves visitor→lead CVR | Hero structure (problem/offer/proof/CTA) | Current LP hero | Visitor→Lead CVR | Bounce rate | TBD | TBD | 2026-02-21 | REV_HEAD_OF_GROWTH | Active | Validate UTM + CTA event tags |
| 2026-02-19 | G2 | A/B | Lower-friction CTA increases lead volume without hurting SQL quality | CTA text (Book Diagnostic vs Sample Scorecard) | Diagnostic-only CTA | Lead rate + SQL rate | No-show rate | TBD | TBD | 2026-02-21 | REV_HEAD_OF_GROWTH + REV_HEAD_OF_SALES | Active | Weighted winner score: 60% SQL, 40% lead volume |
| 2026-02-19 | G6 | B | Structured 3-touch follow-up improves SQL→Won | Follow-up sequence structure | Current ad-hoc follow-up | SQL→Won % | Sales cycle days | TBD | TBD | 2026-02-26 | REV_HEAD_OF_SALES | Planned | Enforce same-day recap SLA |

## Daily operating checklist
- [ ] Instrumentation verified (UTM + event names + CRM stage mapping)
- [ ] Midday read captured by 15:40
- [ ] EOD read captured by 17:50
- [ ] Compliance check completed for experiment assets
- [ ] QA check completed for modified assets
- [ ] Next-day action logged

## Decision rubric (apply on decision date)
- **Ship:** Primary metric improved and no guardrail breach.
- **Iterate:** Signal positive but confidence/volume insufficient.
- **Kill:** No meaningful lift or guardrail breach persists.

---
Files created/updated: AMC_OS/OPS/EXPERIMENT_TRACKER_DAILY.md
Acceptance checks:
- Enforces one-variable experiment rule with owner, metric, guardrail, and decision date.
- Includes daily cadence checkpoints tied to command rhythm.
- Integrates QA and compliance gates directly into experimentation workflow.
Next actions:
1. Fill Midday/EOD signal fields tomorrow.
2. Log decision outcomes in CAMPAIGNS/GROWTH_EXPERIMENTS.md weekly.
3. Escalate any guardrail breach in standup same day.
Risks/unknowns:
- Low traffic/reply volume may delay statistical confidence.
- CRM attribution hygiene must remain strict to avoid false wins.