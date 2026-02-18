# Growth Experiment Queue — Post G1-G8

Date: 2026-02-18  
Owner: INNO_RETENTION_ANALYST + INNO_GROWTH_EXPERIMENT_SCIENTIST  
Primary objective: **close the $5k collection gap fastest** with the highest-confidence, lowest-risk experiments.

## Scoring method
`ICE-S score = (Impact × Confidence × Strategic fit) / Effort`  (Effort is inverse: 1 = easiest).

> Assumption: no post-sale retainer baseline is yet proven in-system, so B/C-priority experiments should still prioritize sprint close outcomes until repeatable Sprint revenue is reliable.

## Top 10 experiments (ranked by priority)

| Rank | Experiment ID | ICE-S (I/C/E/S) | Priority | Lever | Hypothesis | Primary success metric | Duration | Dependencies | Owner |
|---:|---|---|---|---|---|---|---|---|
| 1 | **G9** | **5×5×5/1 = 25** | **25** | **B** | If every qualifying diagnostic call has a **mandatory decision-date lock** and 48-hour follow-up reminder cadence, proposal-to-close improves because momentum and owner ambiguity are reduced. | Proposal → Closed Won rate; proposal dwell time from T+1 to T+2 | 7 days | Update close script in `SALES/CLOSE_EXECUTION.md`; CRM field `decision_due_date` required | `REV_HEAD_OF_SALES` + `REV_ACCOUNT_EXEC_CLOSER` |
| 2 | **G10** | **5×4×5/1 = 20** | **B** | If sprint proposals are sent within 2 hours for all calls that qualify (PACT-DO gate), conversion improves by reducing post-call delay and re-qualification gaps. | % Qualified calls with proposal sent within 2h; Call → Proposal within 24h | 7 days | Proposal template lock, SOW prefill fields, CRM workflow update | `REV_ACCOUNT_EXEC_CLOSER` + `REV_PROPOSAL_SOW_SPECIALIST` |
| 3 | **G11** | **4×4×5/1 = 20** | **C** | If readout includes a one-page **Continuation Decision Pack** (score baseline + 90-day drift risks + 2 retainer options), Sprint→Retainer conversion rises by making continuity decision simple. | Sprint→Retainer proposal within 21 days | 10 days | Readout template update + CRM readiness score fields | `REV_CUSTOMER_SUCCESS_MANAGER` + `REV_ACCOUNT_MANAGER_EXPANSION` |
| 4 | **G12** | **4×4×5/1 = 20** | **C** | If retainer options are reduced to 2 starter-growth tiers with explicit exclusions, objection friction drops and more clients reach directional yes at Day 14. | Directional expansion yes-no at Day 14 follow-up rate | 12 days | EXPANSION_PLAYBOOK simplification; pricing clarity from `SALES/OFFERS.md` | `REV_ACCOUNT_MANAGER_EXPANSION` |
| 5 | **G13** | **4×4×4/1 = 16** | **B** | If every held call follow-up includes one-line owner assignment + next-step action within 12h, conversion improves because next call quality rises and “who decides” is clarified. | Call held → Proposal sent; objection recovery rate | 7 days | Calendar + call-notes SOP refresh; follow-up template |
| 6 | **G14** | **4×3×5/1 = 12** | **C** | If Sprint handoff triggers a mandatory 7-day + 14-day owner-review check-in, retention-ready clients are identified before momentum decays. | Number of clients reaching Expansion-ready score ≥13 by Day 14 | 14 days | Owner map field in readout deck; post-readout task automation | `REV_CUSTOMER_SUCCESS_MANAGER` |
| 7 | **G15** | **3×4×5/1 = 12** | **A** | If every outbound prospect with high-intent reply receives a **continuity proof pack** (scope, risks, example outcomes), qualified lead-to-call-booked rate increases within 48h. | Reply → Call Booked (+ lead quality score) | 7 days | Updated outreach assets; proof module from social proof stack | `REV_HEAD_OF_GROWTH` + `REV_LANDING_PAGE_BUILDER` |
| 8 | **G16** | **3×3×5/1 = 9** | **B** | If top 3 objections are embedded directly into proposal cover memo and decision memo, buyer indecision windows shrink and cycle time improves. | Proposal→Won cycle time; objection repeat frequency | 10 days | Objection library in `SALES/OBJECTION_PLAYBOOK.md` version update; AE enablement | `REV_HEAD_OF_SALES` + `REV_ACCOUNT_EXEC_CLOSER` |
| 9 | **G17** | **4×3×4/1 = 12** | **A** | If outbound sequencing targets only prospects with explicit governance pain language (governance/compliance/quality incidents), conversion per message improves due to stronger self-selection. | Qualified leads/day; lead quality conversion to replies | 10 days | Updated SDR scoring + ICP filters | `REV_SDR_MIDMARKET` + `REV_SDR_AGENCY` |
| 10 | **G18** | **3×3×4/1 = 9** | **C** | If Sprint readout meetings auto-produce a 30-day continuity action map, churn risk in newly signed sprint clients decreases and expansion follow-through increases. | % Sprint clients reaching Day-30 continuity review | 12 days | CRM task automation + reporting template | `REV_CUSTOMER_SUCCESS_MANAGER` + `REV_IMPLEMENTATION_SPECIALIST` |

---

## Execution order (next 2 cycles)

### Cycle A (first 7 days)
1. G9, G10, G13, G15 (quick conversion levers)
2. Parallel support: G17 for cleaner lead quality in the next outbound wave

### Cycle B (days 8–21)
1. G11, G12, G14 (continuity + expansion readiness)
2. G16, G18 as close of the gap risk control loop

---

## Assumptions and guardrails
- **Assumption:** No hard proof of retainer conversion exists yet, so C experiments are treated as qualification-quality improvements until first 1–2 retainers close.
- **Guardrail:** no output may imply guaranteed outcomes, fixed ROI, or irreversible commitments.
- **Decision rule:** ship if primary metric shows directional improvement and no trust/compliance regression.

## Files created/updated
- `AMC_OS/ANALYTICS/GROWTH_EXPERIMENT_QUEUE.md`

## Acceptance checks
- Ten experiments are ranked and each includes ICE-S score, lever, hypothesis, metric, duration, dependencies, owner.
- All experiments are post-G1–G8 and explicitly mapped to A/B/C.
- Ranking is reproducible from the score column and aligned to $5k closure urgency.
- Dependencies are explicit enough to make each experiment actionable next sprint.

## Next actions
1. Launch Cycle A immediately after G1–G8 decision meeting.
2. Assign execution owners in a 15-min standing standup and confirm one CRM owner per experiment.
3. Add `expansion_readiness_score` and `decision_due_date` fields to CRM to support G9/G10/G11 measurement.
4. Run Friday gate review with ship/iterate/kill for top 4 by default; pause if no directional lift or risk signal rises.

## Risks/unknowns
- Small sample size may delay statistical confidence (especially for retainer metrics).
- Over-testing communication variants could create inconsistent messaging if owners are not strictly coordinated.
- Retainer-related experiments depend on legal-safe language in `OPS/CLAIM_REGISTRY.md` and offer boundaries in `SALES/PROPOSAL_TEMPLATE.md`.