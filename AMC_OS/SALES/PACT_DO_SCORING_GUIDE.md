# PACT-DO SCORING GUIDE — Live Call Worksheet
> Version: 1.0 | Owner: REV_ACCOUNT_EXEC_CLOSER | Lever: B — Conversion  
> Use during or immediately after every discovery/qualification call. Score takes <5 min.

---

## HOW TO USE
1. Score each dimension **0, 1, or 2** while the prospect is talking.
2. Sum the six scores (max = 12).
3. Apply routing rule at the bottom.
4. Log score in CRM field `pactdo_score` within 15 min of call end.

---

## DIMENSION SCORING RUBRIC

### P — PROBLEM SEVERITY
*Is the pain costing them measurably right now, or is it a "nice-to-fix someday"?*

| Score | Signal | Real Examples |
|-------|--------|---------------|
| **0** | Nice-to-have. No visible cost, no urgency. | "We'd like to automate some reports eventually." / "It's a bit inefficient but we manage." |
| **1** | Clear pain, but tolerated. Cost is felt but not quantified. | "Our manual QA is slow, it adds a day to every sprint." / "We lose leads sometimes in the handoff." |
| **2** | Pain is costly and visible NOW. Revenue loss, compliance/trust risk, or exec escalation. | "We're losing ~$40k/mo in rework because agents hallucinate in 15% of cases." / "Leadership put this on the Q1 board-level risk register." |

**Probe:** *"What breaks today if this isn't fixed in 30 days — in dollars, headcount, or risk?"*  
**Score 2 requires:** Named dollar/time/risk impact + stated urgency.

---

### A — AUTHORITY ACCESS
*Can you get to the economic buyer in this deal cycle, or are you stuck with a gatekeeper?*

| Score | Signal | Real Examples |
|-------|--------|---------------|
| **0** | No path to decision-maker. Prospect can't sponsor the deal internally. | "I'd need to float this upward but I don't know who handles this." / Contact is a junior analyst with no procurement relationship. |
| **1** | Influencer present, DM uncertain or unavailable. Prospect has visibility but limited power. | "My VP would need to approve — I can try to get them on a call next month." / "We're in a budget freeze; CFO is involved but I haven't worked with her on vendor decisions." |
| **2** | Direct access to budget owner + champion present and willing to co-sell internally. | "I can bring our CTO and CFO to the next call — they've asked me to find a solution by end of Feb." / Prospect IS the economic buyer and signs contracts directly. |

**Probe:** *"Who signs the contract, and who else must be confident before that happens?"*  
**Score 2 requires:** Named DM role/person + champion willing to act as internal sponsor.

---

### C — COMMITMENT TIMELINE
*Is there a real decision window, or are they browsing?*

| Score | Signal | Real Examples |
|-------|--------|---------------|
| **0** | Vague or deferred. No real date, no internal driver. | "Probably sometime this quarter." / "We're in planning mode." / "Maybe after our product launch." |
| **1** | Month-targeted but weak urgency. Internal deadline exists but is flexible. | "We'd like to start this month if we find the right partner." / "Q1 target, but it's not hard." |
| **2** | Decision in ≤14 days, start in ≤30 days. External or executive driver locking the date. | "Our board review is March 1st — I need a plan before then." / "We have a go-live committed for March 15 and need to start by Feb 28." |

**Probe:** *"What date do you want this live, and why that specific date?"*  
**Score 2 requires:** Named date ≤14 days to decision + a business reason (not just preference).

---

### T — TECHNICAL READINESS
*Do they know what they need to integrate, and do they have an owner for it?*

| Score | Signal | Real Examples |
|-------|--------|---------------|
| **0** | No stack clarity. No owner. Integration path is undefined. | "We haven't figured out which tools are involved." / "IT hasn't been involved yet." |
| **1** | Stack is known, but implementation owner is unclear or shared with other priorities. | "We use HubSpot, Salesforce, and a few internal APIs — but I'd have to check who would own the integration." |
| **2** | Stack + named internal owner + integration path confirmed. | "Our VP Eng owns this. We're on GCP, use LangChain and Pinecone — he's already mapped the API surfaces we'd need to expose." |

**Probe:** *"Which systems must we touch in week 1, and who is your internal owner for implementation and adoption?"*  
**Score 2 requires:** Named owner + identified stack + integration path (even high-level).

---

### D — DATA AVAILABILITY
*Do they have baseline metrics and will they give us access to what we need?*

| Score | Signal | Real Examples |
|-------|--------|---------------|
| **0** | No baseline metrics. No data access. Flying blind. | "We don't really track that right now." / "Our data is in multiple systems and not cleaned." |
| **1** | Partial baseline, but access is delayed or incomplete. | "We have some dashboards but they're manual pull — it takes a week to get the right numbers." |
| **2** | Baseline metrics exist + instrumentation accessible now (or within 2 business days). | "We have Looker dashboards live with agent success rates — I can pull the last 90 days right now." / "Our data team already pulled a baseline for this initiative." |

**Probe:** *"What metric moves first if we win? What's the current baseline, and can you share that data now?"*  
**Score 2 requires:** Specific metric with current value + access confirmed within 2 days.

---

### O — OUTCOME URGENCY
*Is there a quantified target tied to executive accountability, or is this someone's personal initiative?*

| Score | Signal | Real Examples |
|-------|--------|---------------|
| **0** | No quantified target. No accountability structure. | "We just want to improve things generally." / "It would be nice to be faster." |
| **1** | Target exists, but low accountability. Not tied to exec priority or OKR. | "We want to reduce QA time by 50% — it's on my roadmap but it's not a formal KPI yet." |
| **2** | Quantified target tied to executive priority (OKR, board metric, or personal performance review). | "Our CPO's Q1 OKR is reducing agent error rate from 15% to <3% — this is directly on his performance review." / "We have a $2M revenue target blocked by this workflow issue — it's the CEO's top 3." |

**Probe:** *"What metric must move in the first 30 days for this to be a win? Is that tied to anyone's executive goal?"*  
**Score 2 requires:** Quantified target (number + timeframe) + named exec accountable.

---

## SCORING WORKSHEET (Fill During Call)

```
Prospect Name: ________________________________
Company: _____________________________________
Call Date: ____________________________________
AE: __________________________________________

[ P ] Problem Severity     ___  /2
[ A ] Authority Access     ___  /2
[ C ] Commitment Timeline  ___  /2
[ T ] Technical Readiness  ___  /2
[ D ] Data Availability    ___  /2
[ O ] Outcome Urgency      ___  /2
                          ————
    TOTAL PACT-DO SCORE   ___  /12

Routing Decision: ______________________________
Next Step + Owner: ____________________________
Next Step Datetime: ___________________________
```

---

## ROUTING RULES

### 🔴 0–5 — DISQUALIFY / NURTURE
**Immediate action:** Do NOT send proposal. Do NOT run close motion.  
**Routing:**
- If 0–3: Disqualify. Log reason in CRM. Move to nurture sequence (quarterly touchpoint).
- If 4–5: Identify the 1–2 lowest-scoring dimensions. Set a 30-day gap-closure target.
- Send a "Nurture Value Email" — educational content, no pitch.

**Script:** *"Based on where things stand, I don't think now is the right time to run a formal project together — and I'd rather be honest than waste your time. Let me send you [relevant content] and we can revisit in [X weeks] when [specific gap] is resolved. Does that make sense?"*

---

### 🟡 6–7 — HOLD IN DISCOVERY / GAP-CLOSURE
**Immediate action:** Identify the dimension(s) holding the score below 8. Assign gap-closure action to a named owner with a deadline.  
**Routing:**
- Run a gap-closure call within 5 business days.
- Do not issue proposal until score reaches 8+.
- Common gaps at this band: A (no DM access), C (no decision date), D (no baseline data).

**Script:** *"We're close — I can see a strong case here. Before we move to a formal proposal, I need [specific gap: e.g., 'a 20-min call with your VP Eng to confirm integration path']. Can we get that done by [date]? Once that's resolved, I can have a proposal to you within 24 hours."*

---

### 🟢 8–9 — STANDARD CLOSE MOTION
**Immediate action:** Verify all 5 mandatory exit criteria are met (see below). Issue proposal same day or next business day.  
**Routing:**
- Select offer path: Sprint / Pilot / Retainer based on scope confidence.
- Book decision call within 48 hours of proposal send.
- Run trial-close prompts and standard follow-up sequence.

**Script:** *"This is a strong fit. I'm going to recommend [offer path] — here's why it's the right first step. I'll send the proposal today and I'd like to schedule a 30-min decision call for [date] — does [time] work?"*

---

### 🔵 10–12 — IMMEDIATE CLOSE MOTION
**Immediate action:** Proposal out within 2 hours of call end. Decision call booked within 48 hours.  
**Routing:**
- Confirm all 5 mandatory exit criteria are met ON the call before hanging up.
- Offer path likely: Rapid Pilot or Compass Sprint with expansion path.
- Pre-wire champion during call: *"I'll send you a one-paragraph summary you can forward to [DM name] immediately."*
- Lock start date on the call itself.

**Script:** *"Everything you've described tells me we should move fast. I'm going to send the proposal and SOW within the next two hours, and I'd like to get [DM name] on a 20-minute call by [tomorrow/day-after]. I'll also send you a short brief you can forward to them right now. Are you available [time slot] for that call?"*

---

## MANDATORY EXIT CRITERIA (Block Proposal If Any Are Missing)
Before issuing ANY proposal, confirm all 5:

- [ ] **1. Business problem** stated in one sentence with quantified impact.
- [ ] **2. Budget owner** identified by name and role.
- [ ] **3. Decision process + date** documented (who approves, what's the step, what's the date).
- [ ] **4. Success metric + baseline** agreed (what we measure + current number).
- [ ] **5. Implementation owner** named on client side.

**If any are missing:** Do not send proposal. Set a gap-closure action with a 48-hour deadline.

---

## AUTO-DISQUALIFY RED FLAGS
Stop the close motion immediately if any of these are present (unless explicitly corrected):

- ❌ Wants "free strategy session" with no buying intent stated.
- ❌ No DM access after 2 coordinated attempts.
- ❌ Demands guaranteed revenue/ROI claims.
- ❌ Scope undefined and prospect refuses discovery discipline.
- ❌ Timeline mismatch: wants to start immediately but has no named internal owner.
- ❌ Procurement/legal process extends beyond 60 days with no champion to accelerate.

---

## QUICK REFERENCE (Pocket Card)

| Dimension | 0 | 1 | 2 |
|-----------|---|---|---|
| **P** Problem | Nice-to-have | Felt, not quantified | Costly + visible now |
| **A** Authority | No DM path | Influencer only | Budget owner + champion |
| **C** Commitment | "Maybe Q-something" | This month, soft | ≤14 days, named reason |
| **T** Technical | No stack clarity | Stack known, owner unclear | Stack + owner + path confirmed |
| **D** Data | No baseline | Partial, delayed | Baseline + access now |
| **O** Outcome | No target | Target, no exec tie | Exec OKR/KPI with number |

| Score | Route |
|-------|-------|
| 0–5 | 🔴 DQ / Nurture |
| 6–7 | 🟡 Gap-closure discovery |
| 8–9 | 🟢 Standard close motion |
| 10–12 | 🔵 Immediate close — proposal ≤2h |

---

## KAIZEN NOTE
- **Peer review:** REV_HEAD_OF_SALES or REV_OBJECTION_COACH
- **Review path:** `AMC_OS/INBOX/REVIEWS/PACT_DO_SCORING_GUIDE__review.md`
- **v2 experiment:** Track which single dimension most frequently blocks 6→8 upgrades. Invest objection coaching in that dimension.

---
**Files created:** `AMC_OS/SALES/PACT_DO_SCORING_GUIDE.md`  
**Acceptance checks:** All 6 dimensions scored 0/1/2 with examples; routing rules map to QUALIFICATION.md stage bands; worksheet is fill-in-the-blank usable on a live call.  
**Lever:** B — Conversion  
**Next actions:**
1. Print/pin the Quick Reference card for every AE.
2. Add PACT-DO score as mandatory CRM field gating stage advancement.
3. Run scoring calibration session: 3 AEs score same call recording independently, compare + align.
4. Track which dimension most often blocks score 8+ — feed into objection coaching.
5. Request peer review from REV_HEAD_OF_SALES within 48h.
