# Command Brief — Sales Pipeline Acceleration (Revenue Manager)

Date: 2026-02-18  
Objective: Increase pipeline velocity and conversion within the next 48 hours using existing AMC_OS operating assets.

## Top 3 Actions (in priority order)

### 1) Enforce stage discipline + data hygiene today (Pipeline control)
- **Command:** Run a same-day pipeline scrub; block stage movement if mandatory fields are missing (`next_step`, due date, owner, ICP segment, trigger).
- **Why now:** Current scoreboard baseline is zeroed; hygiene and SLA compliance are prerequisite to any lift.
- **Primary files:**
  - `AMC_OS/SALES/CRM_PIPELINE_OPS.md`
  - `AMC_OS/HQ/SCOREBOARD.md`

### 2) Re-score all open opportunities with PACT-DO and fast-route by score (Speed to SQL/close)
- **Command:** Reclassify all active deals into 0–5 DQ/Nurture, 6–7 Gap-closure, 8–9 Standard close motion, 10–12 Immediate close motion.
- **Why now:** Forces focus on high-intent pipeline and prevents low-probability proposal waste.
- **Primary files:**
  - `AMC_OS/SALES/QUALIFICATION.md`
  - `AMC_OS/INBOX/REV_HEAD_OF_SALES.md`

### 3) Trigger 48-hour close sprint on PACT-DO 8+ opportunities (Conversion acceleration)
- **Command:** For score 10–12, send proposal within 2 hours and book decision call ≤48h; for 8–9, run standard close timeline with decision date lock.
- **Why now:** Compresses proposal-to-decision cycle and raises win probability on active intent.
- **Primary files:**
  - `AMC_OS/SALES/CLOSE_EXECUTION.md`
  - `AMC_OS/SALES/OUTREACH_SEQUENCES.md`

## Command KPIs (next 48h)
- 100% active opps with required CRM fields + PACT-DO score
- ≥70% of PACT-DO 10+ deals receive same-day commercial package
- Decision date logged on 100% of PACT-DO 8+ deals

---
Files created/updated: `AMC_OS/SALES/COMMAND_BRIEF_PIPELINE_ACCELERATION.md`  
Acceptance checks: (1) Each action maps to an executable AMC_OS playbook; (2) each action includes file path + KPI intent; (3) sequence supports pipeline first, conversion second.  
Next actions:
1. Assign owners (REV_HEAD_OF_SALES, REV_REVOPS_CRM, AE/SDR team) against each action.
2. Run first pipeline scrub and post deltas in `AMC_OS/HQ/SCOREBOARD.md`.
3. Launch 48h close sprint cohort for all PACT-DO 8+ deals.
Risks/unknowns:
- Baseline pipeline may be under-instrumented, slowing re-score completion.
- DM access gaps can block immediate close motion even with high scores.
- Team adherence to CRM logging SLA may vary without manager enforcement.
