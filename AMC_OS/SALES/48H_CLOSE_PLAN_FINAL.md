# 48-Hour Close Plan (Final)

Date: 2026-02-18  
Owner: Sales Manager (execution lead with REV_HEAD_OF_SALES + AE pod)  
Asset basis: `QUALIFICATION.md`, `CLOSE_EXECUTION.md`, `CRM_PIPELINE_OPS.md`, `OFFERS.md`, `PROPOSAL_TEMPLATE.md`, `SOW_TEMPLATE.md`, `COMMAND_BRIEF_PIPELINE_ACCELERATION.md`

## Objective (next 48h)
Convert highest-intent opportunities faster while protecting scope and margin.

Primary KPI targets:
- 100% active opps have PACT-DO score + decision date + next step datetime
- >=70% of PACT-DO 10–12 opps receive proposal same day (<=2h from qualified call)
- 100% of PACT-DO 8+ opps have decision call booked <=48h

---

## Execution Clock

### 0–6h: Pipeline control + routing
1. Run mandatory CRM hygiene pass (block stage movement if critical fields missing).
2. Re-score every active opportunity with PACT-DO (0–12).
3. Route by band:
   - 0–5: DQ/Nurture
   - 6–7: Gap-closure discovery
   - 8–9: Standard close motion
   - 10–12: Immediate close motion
4. Form the 48h close cohort from all 8+ opps.

### 6–24h: Proposal production + stakeholder threading
1. For each 10–12 opp with exit criteria true: proposal out <=2h post-call.
2. For 8–9 opps: run gap-closure call, then same-day commercial draft if criteria completed.
3. Use offer-path fit:
   - Compass Sprint ($5k)
   - Rapid Pilot ($12k)
   - Continuous Maturity ($3k–$15k/mo)
4. Pre-wire champion + economic buyer with one-page business case and decision date lock.

### 24–48h: Decision conversion
1. Hold decision calls for all close-cohort opportunities.
2. Use trial-close prompts and approved concession ladder (terms -> scope narrow -> path downgrade -> time-bound concession).
3. Convert outcomes into: Signed / Conditional MAP / No-go recycle.
4. Push close outcomes to SCOREBOARD + DECISIONS log same day.

---

## Top 10 Opportunities — Selection Criteria (rank order)
Use these criteria to rank all active opportunities and choose top 10 close-focus accounts.

1. **PACT-DO total score** (higher first; minimum threshold 8)
2. **Authority quality** (direct budget owner access + champion present)
3. **Decision date certainty** (specific date inside 14 days)
4. **Problem economic severity** (clear cost of delay quantified)
5. **Outcome clarity** (agreed KPI + baseline available now)
6. **Implementation readiness** (named owner + stack/integration path confirmed)
7. **Commercial fit to offer path** (clean mapping to Sprint/Pilot/Retainer)
8. **Procurement/legal friction level** (fewer expected redline rounds prioritized)
9. **Cycle velocity signal** (recent response speed + stakeholder attendance quality)
10. **Margin quality** (low discount pressure, high scope clarity, realistic acceptance criteria)

Tie-breakers:
- Strategic logo value for ICP credibility
- Multi-workflow expansion potential in 90 days
- Faster kickoff feasibility (<=7 days)

---

## Proposal Cadence (by intent band)

### Band A — Immediate Close (PACT-DO 10–12)
- T+0–15m: CRM + call debrief complete
- T+15–60m: offer path + one-page commercial narrative
- T+60–120m: proposal sent (template complete)
- T+2–24h: stakeholder threading + procurement path check
- T+24–48h: decision call + final terms

### Band B — Standard Close (PACT-DO 8–9)
- Day 0: run gap-closure call for missing exit criteria
- Same day: draft proposal skeleton + send if criteria completed
- +24h: objection-preempt follow-up (business case + acceptance criteria)
- +48h: decision review slot booked or recycle to discovery with clear gap plan

### Message rhythm after proposal
- +4h: decision timing confirmation
- +24h: cost-of-delay check + scope trim option
- +48h: close-the-loop prompt (proceed / pause)

---

## Unblock List (owners + SLA)

1. **Missing DM/economic buyer access**  
   - Owner: AE + REV_HEAD_OF_SALES  
   - SLA: escalate within 4h; stop proposal if unresolved after 2 attempts

2. **No decision date lock**  
   - Owner: AE  
   - SLA: must be captured before proposal send

3. **No KPI baseline / weak data access**  
   - Owner: AE + client implementation owner  
   - SLA: baseline agreed within same business day or move to gap-closure stage

4. **Implementation owner not named (client side)**  
   - Owner: AE  
   - SLA: mandatory exit criterion; block close motion until named

5. **Proposal scope ambiguity**  
   - Owner: REV_PROPOSAL_SOW_SPECIALIST  
   - SLA: same-day rewrite with explicit in/out scope + assumptions

6. **Redline/legal delay**  
   - Owner: REV_LEGAL_CONTRACTS + AE  
   - SLA: redline owner + turnaround ETA documented within 4h

7. **Discount-first pressure**  
   - Owner: AE + REV_HEAD_OF_SALES  
   - SLA: follow concession ladder; trade only for scope/term adjustments

8. **CRM hygiene non-compliance**  
   - Owner: REV_REVOPS_CRM  
   - SLA: daily audit before standup; block stage changes with null critical fields

9. **No next step datetime on active opp**  
   - Owner: opportunity owner  
   - SLA: fix within same day or manager escalation

10. **Handoff risk post-signature**  
   - Owner: REV_CUSTOMER_SUCCESS_MANAGER + Implementation Specialist  
   - SLA: kickoff slot + owner confirmation within 48h of signature

---

## Governance Snapshot (next 2 days)
- Standup 1 (start Day 1): close-cohort confirm + owner assignment
- Midday Day 1: proposal velocity checkpoint
- EOD Day 1: scoreboard update + unblock escalations
- Midday Day 2: procurement/decision-risk review
- EOD Day 2: wins/slips/postmortem + next-wave shortlist

---
Files created/updated: `AMC_OS/SALES/48H_CLOSE_PLAN_FINAL.md`  
Acceptance checks:
- Plan uses latest AMC_OS sales assets and PACT-DO stage rules
- Includes explicit top-10 selection criteria, proposal cadence, and unblock list
- Contains owner/SLA for major conversion blockers
- Matches compliance guardrails (no deceptive or guaranteed claims)

Next actions:
1. Apply the criteria to current active pipeline and publish top-10 account list in CRM.
2. Assign AE owner + decision date for each selected opportunity.
3. Execute Band A/B cadence and log timestamps for proposal speed tracking.
4. Run unblock escalation during each checkpoint and resolve within SLA.
5. Update `AMC_OS/HQ/SCOREBOARD.md` at EOD with close-sprint metrics.

Risks/unknowns:
- Current leads file appears sparse/incomplete for a full top-10 account list without CRM enrichment.
- DM access gaps can still suppress close rates despite high PACT-DO scores.
- Legal/procurement variability may extend decisions beyond 48h for enterprise-style accounts.
