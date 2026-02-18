# TOMORROW COMMAND RHYTHM — 2026-02-19
Owner: REV_COO_ORCH (Ops Manager)
Objective: Convert operating baseline into measurable pipeline movement while maintaining QA/compliance controls.

## 1) Command rhythm (time-boxed)
- **09:15–09:30 Pre-standup prep (RevOps + COO)**
  - Refresh SCOREBOARD prior-day actuals and stage conversion row.
  - Flag any metric drift >20% and add note in DECISIONS.md draft.
- **09:30–09:45 Daily Standup (all revenue/delivery leads)**
  - Commit today targets by owner.
  - Confirm top blocker per function + same-day owner for unblock.
  - Reconfirm compliance constraints for outbound claims.
- **11:30–11:40 QA quick gate (QA Lead + function owners)**
  - Spot-check first outbound batch + proposal draft against QUALITY_GATE_CHECKS.
- **12:30–12:45 Midday pipeline check (Sales + RevOps + COO)**
  - Compare target vs actual: outbound, replies, booked calls, data hygiene.
  - If any KPI is <50% of midday pacing, trigger correction in-session.
- **15:30–15:40 Experiment pulse check (Growth + Sales + COO)**
  - Review active experiment signal quality and instrumentation status.
  - Confirm one variable only changed per experiment.
- **17:30–17:50 EOD close-out (COO + all owners)**
  - Update SCOREBOARD actuals.
  - Log one decision + one bottleneck + one next-day action.
- **18:00–18:20 Compliance/risk gate (Compliance + QA + Sales/Growth)**
  - Review outbound claims language, proposal terms, and exceptions.
  - Approve, hold, or rewrite assets.

## 2) Tomorrow KPI command board (minimum)
- Outbound actual vs target
- Meaningful replies vs target
- Calls booked and held
- Proposals sent
- Weighted pipeline ($)
- Data hygiene %
- Compliance exceptions count
- QA critical fails count

## 3) Trigger-based operating rules
- **Pacing trigger:** If by midday outbound <50% of plan, reallocate capacity to SDR pods immediately.
- **Quality trigger:** Any QA critical fail blocks release until fixed and re-tested.
- **Compliance trigger:** Any red-tier claim blocks send/publish same day.
- **Forecast trigger:** Pipeline value movement >20% day-over-day requires DECISIONS.md note.
- **Escalation trigger:** >30% miss for 2 consecutive days triggers corrective plan owner assignment.

## 4) RACI-lite for cadence
- Standup owner: REV_COO_ORCH
- Scoreboard/data hygiene: REV_REVOPS_CRM
- QA gate owner: REV_QA_LEAD
- Compliance gate owner: REV_COMPLIANCE_OFFICER
- Experiment pulse owner: REV_HEAD_OF_GROWTH
- Sales execution owner: REV_HEAD_OF_SALES

## 5) Definition of done (tomorrow)
1. SCOREBOARD updated with actuals by 17:50.
2. No outbound/proposal asset shipped with unresolved critical QA/compliance flags.
3. At least one active experiment has valid instrumentation and a next decision date.
4. DECISIONS.md updated with material deviations and actions.

---
Files created/updated: AMC_OS/HQ/TOMORROW_COMMAND_RHYTHM_2026-02-19.md
Acceptance checks:
- Contains explicit timeline, owners, triggers, and release controls.
- Maps QA/compliance/scoreboard into one daily command system.
- Includes measurable DoD for end-of-day verification.
Next actions:
1. Run 09:30 standup using this schedule.
2. Enforce midday trigger logic without exception.
3. Require gate approvals before any external publish/send.
Risks/unknowns:
- Baseline conversion data still sparse; early signals may be noisy.
- Owner bandwidth conflicts can delay midday correction loops.