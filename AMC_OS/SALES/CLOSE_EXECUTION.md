# CLOSE EXECUTION PACK — REV_ACCOUNT_EXEC_CLOSER

Owner: REV_ACCOUNT_EXEC_CLOSER  
Version: v2  
Date: 2026-02-18  
Primary Lever: **B — Conversion**

## 0) Purpose
Move qualified opportunities (PACT-DO 8–12) from post-call to signed proposal with minimal delay, clear decision plans, and protected margin.

## 1) Entry Criteria (Must Be True Before Close Motion)
Aligned to `AMC_OS/SALES/QUALIFICATION.md`:
- PACT-DO score captured in CRM.
- If score **0–7**: do not run this close pack; return to discovery/nurture.
- If score **8–9**: run standard close motion.
- If score **10–12** + exit criteria: run immediate motion (proposal ≤2 hours, decision call ≤48 hours).

Mandatory exit criteria before proposal:
1. One-sentence business problem + quantified impact.
2. Budget owner identified.
3. Decision process + date documented.
4. Success metric + baseline agreed.
5. Implementation owner identified.

## 2) Call-to-Proposal Timeline (T+0 to T+48h)

### T+0 to T+15 min (right after call)
- Update CRM fields: `pactdo_score`, `dm_name`, `economic_buyer`, `decision_date`, `target_metric`, `implementation_owner`, `offer_path`, `next_step_datetime`.
- Label buying stage: `Discovery Hold` / `Close Motion` / `Immediate Close`.
- Write 5-bullet call debrief:
  1) Pain + cost of delay
  2) Decision committee
  3) Timing pressure
  4) Technical/data constraints
  5) Objections heard

### T+15 to T+60 min
- Select offer path from `AMC_OS/SALES/OFFERS.md`:
  - **Compass Sprint ($5k, 5 days)** when authority/timeline exists but scope confidence is low.
  - **Rapid Pilot ($12k, 14 days)** when one urgent use-case + owner + access exists.
  - **Continuous Maturity ($3k–$15k/mo)** when multi-workflow governance need is explicit.
- Draft commercial narrative: “cost of delay → scoped outcome → start date.”
- Pre-wire champion with one-page summary (problem, offer path, price anchor, decision date).

### T+60 to T+120 min (Immediate Close only; otherwise same-day)
- Issue proposal (using template constraints from `PROPOSAL_TEMPLATE.md` and quality gates):
  - Objective/outcome
  - Scope/deliverables
  - Timeline/milestones
  - Fees/payment terms
  - Acceptance criteria
  - Exclusions/assumptions
  - Decision deadline + kickoff date
- Send calendar hold for decision call (within 48h).

### T+2h to T+24h
- Run stakeholder threading:
  - Champion prep note: 3 likely objections + approved answers.
  - DM note: one-page business case with metric baseline and expected first KPI move.
- Confirm procurement/legal path and expected redlines.

### T+24h to T+48h
- Hold decision call.
- Run trial closes + negotiation guardrails.
- Close outcomes:
  - **Signed** → kickoff confirmation.
  - **Conditional** → mutual action plan with dated conditions.
  - **No-go** → disqualify reason + recycle path.

## 3) Trial-Close Prompt Library (Use in Live Calls)

### A) Commitment Timing
- “Given your target date, are you comfortable deciding by **[date]** so we can start **[kickoff date]**?”
- “On a scale of 1–10, how ready are you to move this forward this week?”
  - Follow-up: “What would make it a 10?”

### B) Stakeholder Alignment
- “Is anyone missing from this decision who could block approval later?”
- “If I send this now, are you willing to sponsor it with the economic buyer today?”

### C) Commercial Confidence
- “Is the current scope the right first step, or should we tighten to the highest-ROI slice?”
- “Do you want to optimize for fastest result (Pilot) or lowest-risk clarity (Sprint)?”

### D) Risk/Execution Confidence
- “Do you see any risk in your team providing access and owner support by kickoff?”
- “If we hit the first milestone by **[date]**, would that validate this investment internally?”

### E) Final Decision Prompt
- “Assuming we include today’s edits, are you prepared to approve by **[decision date]**?”

## 4) Negotiation Guardrails (Protect Margin + Speed)
Aligned to `OFFERS.md` concession ladder.

### Non-Negotiables
- No guaranteed revenue/income claims.
- No open-ended scope language.
- No start date without implementation owner confirmation.
- No discount-first positioning.

### Approved Concession Ladder (in order)
1. **Payment terms flexibility** (split schedule) — keep total fee intact.
2. **Scope narrowing** to highest-ROI workflow.
3. **Path downgrade** (Retainer → Pilot, or Pilot → Sprint).
4. **Time-bound concession** tied to signature deadline.

### Redline Rules
- If buyer asks for guarantee language: replace with measurable acceptance criteria + reporting cadence.
- If buyer asks for major price cut: trade only for reduced scope/term.
- If buyer requests undefined extras: park in “Phase 2 options” table.

### Walk-Away Triggers
- No DM access after two coordinated attempts.
- Refusal to define outcome metric/baseline.
- Request for unethical/compliance-breaking claims.

## 5) 48-Hour Follow-Up Sequences

## Sequence 1: After Proposal Sent (No Response)
**T+4h**  
Subject: Quick alignment on decision timing  
“Sharing this to keep momentum: are you still targeting a decision by **[date]**? If yes, I’ll hold **[two slots]** for final review.”

**T+24h**  
Subject: Cost-of-delay check  
“Each week this remains open, you estimated **[impact]** remains unresolved. Should we keep the current scope, or trim to the fastest-start option?”

**T+48h**  
Subject: Close the loop  
“Happy to proceed with Option **[X]** and kickoff **[date]**. If priorities shifted, reply ‘pause’ and I’ll close this cleanly for now.”

## Sequence 2: Verbal Yes, Pending Internal Approval
**T+2h**: Send internal-forwardable 8-line summary (problem, outcome, scope, fee, timeline, risk controls, decision date, signature link).  
**T+24h**: Ask “What objection should we pre-answer before procurement/legal reviews?”  
**T+48h**: Offer 15-min unblock call with DM/champion.

## Sequence 3: Procurement / Legal Delay
**T+4h**: Confirm redline owner and turnaround SLA.  
**T+24h**: Send redline table with business impact if launch slips.  
**T+48h**: Escalate politely to executive sponsor with two choices: sign current terms or approve revised start date.

## 6) Objection-to-Response Map (Fast Reference)
- **“Price is high”** → Re-anchor to cost of delay + propose scope narrowing, not discount.
- **“Need more proof”** → Re-state acceptance criteria + first milestone evidence plan.
- **“Need more time”** → Ask what decision risk remains; resolve that specific risk only.
- **“Too broad”** → Move to Pilot/Sprint with one KPI-first use case.

## 7) Acceptance Checks (Quality Gate Alignment)
- Proposal includes all PR-01 to PR-05 critical elements from `QUALITY_GATE_CHECKS.md`.
- Offer path explicitly mapped to OFFERS.md with exclusions and assumptions.
- Qualification records satisfy mandatory exit criteria from QUALIFICATION.md.
- Follow-up sequence scheduled in CRM with owner + timestamps.
- No compliance-breaking claims.

## 8) KPI Targets for This Pack
- Primary KPI: **Proposal-to-close rate**.
- Secondary KPI: **Median days from proposal sent to decision**.
- Secondary KPI: **Average discount rate (target down)**.

## 9) Quality Rubric Run (Self-Check + Revision)

### Rubric Pass — v1
Q1 usable in ≤5 min? **Yes** (timeline, scripts, sequences are modular).  
Q2 concrete steps/templates/examples? **Yes** (scripts + timing + ladders).  
Q3 acceptance checks included? **Yes** (Section 7).  
Q4 reduces uncertainty? **Partial** (needed clearer walk-away triggers and stakeholder threading).  
Q5 TOOLS.md compliant? **Yes** (no deceptive claims/instructions).

### Revision Applied (v2)
- Added explicit stakeholder-threading at T+2h to T+24h.
- Added walk-away triggers and procurement/legal delay sequence.
- Tightened concession ladder rules to prevent margin leakage.

### Rubric Pass — v2
Q1 **Yes** | Q2 **Yes** | Q3 **Yes** | Q4 **Yes** | Q5 **Yes**

## 10) Tomorrow Improvement Experiment (One Only)
**Experiment:** Add a mandatory “Decision Date Lock” question before ending every close call.  
- Script: “What exact date will the final decision be made, and who confirms it?”  
- KPI linked: proposal-to-close rate + cycle time.  
- Measure over next 5 qualified opportunities: % with explicit decision date vs close velocity.

---
Files created/updated: AMC_OS/SALES/CLOSE_EXECUTION.md  
Acceptance checks: QUALIFICATION + OFFERS + QUALITY_GATE criticals mapped and embedded in process.  
Next actions:
1. Run this playbook on next 5 PACT-DO 8+ deals.
2. Capture objection frequency to refine prompts.
3. Request review from REV_HEAD_OF_SALES or REV_COMPLIANCE_OFFICER.
Risks/unknowns:
- Actual close lift depends on DM access quality.
- CRM discipline variance may reduce adherence unless enforced.