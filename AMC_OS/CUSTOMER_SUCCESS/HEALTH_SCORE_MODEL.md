# CLIENT HEALTH SCORE MODEL
## Compass Sprint — Simple, Actionable Health Tracking

**Version:** 1.0 | **Owner:** REV_CUSTOMER_SUCCESS_MANAGER  
**Lever:** C — Delivery-Readiness  
**Assessed by:** CSM, updated daily during sprint / weekly post-sprint  

---

## PURPOSE

Give the CSM a fast, consistent way to assess client health at any point in the engagement — from kickoff through retainer. Avoid subjective "feel" assessments. Use observable signals. Drive actions before problems escalate.

---

## SCORING OVERVIEW

**4 dimensions scored 1–3 per dimension. Maximum total: 12 points.**

| Score Band | Label | Color | Meaning |
|---|---|---|---|
| 10–12 | Healthy | 🟢 GREEN | On track; watch for expansion signals |
| 6–9 | At Risk | 🟡 YELLOW | Warning signals present; intervene proactively |
| 1–5 | Critical | 🔴 RED | Escalate now; risk of failed sprint or churn |

> **Rule:** If ANY single dimension scores 1, treat the client as 🔴 RED regardless of total score.

---

## DIMENSION 1 — ENGAGEMENT LEVEL

*Are the right people showing up and participating?*

| Score | Label | Observable Signals |
|---|---|---|
| **3** | Active | Sponsor + ≥2 SMEs attended kickoff; interviews booked within 24h; evidence submitted on time; client asks clarifying questions; async comms answered same day |
| **2** | Passive | Sponsor attended kickoff; interviews scheduled but took >24h to confirm; some evidence late or incomplete; responses take >1 business day |
| **1** | Disengaged | Sponsor absent from kickoff; interviews not confirmed by Day 2; no evidence submitted; no response to CSM within 24h |

**Action by score:**
- **Score 3:** No action needed. Log any referral or expansion signals.
- **Score 2:** CSM sends proactive check-in. Remind sponsor of upcoming deadlines. Offer to reschedule interviews if needed.
- **Score 1:** Immediate CSM outreach to sponsor within 2 hours. If no response in 4 hours, escalate to REV_PROGRAM_MANAGER. Do not proceed with scoring on incomplete evidence without explicit CSM decision.

---

## DIMENSION 2 — SPRINT PROGRESS

*Is the delivery on track to meet Day 5 gate criteria?*

| Score | Label | Observable Signals |
|---|---|---|
| **3** | On Track | All milestones completed on day; evidence coverage ≥70% by Day 3; QA review completed; readout confirmed with ≥2 stakeholders |
| **2** | Minor Delay | 1–2 milestones delayed ≤1 day; evidence coverage 50–69%; QA review pending but in progress; readout confirmed but low attendance |
| **1** | Behind / At Risk | ≥2 milestones missed; evidence coverage <50% by Day 3; QA review not started; readout not confirmed by Day 4 |

**Action by score:**
- **Score 3:** Maintain pace. Impl. Specialist confirms Day 5 readout logistics.
- **Score 2:** CSM flags delay in risk log. Impl. Specialist triages: can delay be recovered same day? If not, CSM notifies sponsor with revised timeline.
- **Score 1:** CSM escalates to REV_PROGRAM_MANAGER. Sprint delay protocol activated. Sponsor notified using "Delay Notification" template (see SUPPORT_PLAYBOOK.md). Document in SPRINT_RISK_LOG.md.

---

## DIMENSION 3 — SATISFACTION SIGNALS

*Is the client feeling confident and positive about the engagement?*

| Score | Label | Observable Signals |
|---|---|---|
| **3** | Positive | Sponsor uses positive language in calls ("this is exactly what we needed"); shares readout with additional stakeholders; asks about next steps proactively; no complaints |
| **2** | Neutral | Sponsor engaged but non-committal; no explicit complaints but also no enthusiasm; may be internally skeptical about ROI; minimal questions |
| **1** | Negative | Sponsor expresses frustration, confusion, or disappointment; disputes methodology; asks for things outside scope; or has gone silent after an interaction that felt tense |

**Signals to watch for:**

| Positive Signal | Negative Signal |
|---|---|
| "Our CTO is excited to see the results" | "We're not sure this is giving us what we need" |
| Adds new stakeholders to calls voluntarily | Drops stakeholders from scheduled interviews |
| Responds enthusiastically to email updates | Short or terse responses; delays replies |
| Asks "what happens after Day 5?" | Asks "when will this be done?" with frustration |
| Refers a colleague mid-sprint | Mentions competitor alternatives |

**Action by score:**
- **Score 3:** Reinforce positive momentum. Prime sponsor for referral conversation post-readout.
- **Score 2:** CSM schedules brief optional check-in call. Ask: "What would make this sprint a 10/10 for you?" Address gaps within current scope.
- **Score 1:** Immediate CSM call with sponsor. Use "Issue Acknowledgment" template. Identify root cause: unmet expectation, delivery issue, or scope mismatch. Escalate to REV_HEAD_OF_SALES if recovery unclear within 24h.

---

## DIMENSION 4 — EXPANSION READINESS

*How likely is this client to buy a follow-on engagement?*

| Score | Label | Observable Signals |
|---|---|---|
| **3** | Ready | Client has expressed interest in post-sprint support; roadmap complexity is high; budget signals present; sponsor is a champion internally; >2 expansion signals logged in SUCCESS_PLAN |
| **2** | Possible | Client has not said no to follow-on; some budget/timing hints; roadmap is clear but client hasn't commented on execution capacity; 1 expansion signal logged |
| **1** | Unlikely | Client is focused only on sprint deliverable; stated "we'll do this internally"; no budget signals; or expressed dissatisfaction that makes retention unlikely |

**Action by score:**
- **Score 3:** CSM primes retainer pitch for Day 5 readout. Impl. Specialist flags options in Slide 9. After readout, CSM follows up within 24h with proposal.
- **Score 2:** CSM presents retainer options on Day 5 without pressure. Frame as "here's how we support clients who want to move faster." Follow up with written options after readout.
- **Score 1:** Do not pitch retainer aggressively. Deliver exceptional sprint value. Schedule 30-day check-in; circumstances may change. Log as low expansion probability in CRM.

---

## HEALTH SCORE SUMMARY CARD

> *Complete this card daily during sprint, weekly post-sprint. Store in `AMC_OS/CUSTOMER_SUCCESS/[CLIENT]/HEALTH_SCORE_LOG.md`.*

```
CLIENT: ____________________________  DATE: ______________  DAY: ____

DIMENSION SCORES (circle one per row):
  Engagement Level:      1 — 2 — 3      Notes: ________________________
  Sprint Progress:       1 — 2 — 3      Notes: ________________________
  Satisfaction Signals:  1 — 2 — 3      Notes: ________________________
  Expansion Readiness:   1 — 2 — 3      Notes: ________________________

  TOTAL: _____ / 12

OVERALL STATUS:
  [ ] 🟢 GREEN (10–12)   [ ] 🟡 YELLOW (6–9)   [ ] 🔴 RED (1–5)
  [ ] 🔴 RED — Override (single dimension scored 1)

KEY SIGNAL THIS PERIOD:
  ____________________________________________________________

ACTION TRIGGERED:
  [ ] None — continue monitoring
  [ ] Proactive CSM outreach (comms log below)
  [ ] Escalation to: ____________________
  [ ] Sprint delay protocol activated
  [ ] Expansion conversation primed
  [ ] Recovery call scheduled

COMMS LOG (today):
  [ ] Email sent at ______ re: ____________________
  [ ] Call at ______ with ____________; outcome: ___________________

NEXT ASSESSMENT DATE: ______________  NEXT CSM TOUCH: ______________
```

---

## HEALTH TREND TRACKER

> *Paste this table into `[CLIENT]/HEALTH_SCORE_LOG.md`. Plot trend across days.*

| Day | Engagement | Progress | Satisfaction | Expansion | Total | Status |
|---|---|---|---|---|---|---|
| Day 0 (pre) | | | | | | |
| Day 1 | | | | | | |
| Day 2 | | | | | | |
| Day 3 | | | | | | |
| Day 4 | | | | | | |
| Day 5 | | | | | | |
| Day 14 (NPS) | | | | | | |
| Day 30 (check-in) | | | | | | |
| Day 90 | | | | | | |

---

## QUICK REFERENCE — ACTIONS BY STATUS

### 🟢 GREEN — Actions

1. Continue standard sprint delivery; no intervention needed
2. Log expansion signals actively in SUCCESS_PLAN_TEMPLATE Section 6
3. Prime retainer pitch for Day 5 if Expansion = 3
4. Capture testimonial/referral signals for post-sprint NPS outreach
5. Internal note: "client on track" to REV_COO_ORCH in weekly sync

### 🟡 YELLOW — Actions

1. CSM sends proactive "checking in" message within 4 business hours
2. Identify which specific dimension dropped to 2 and target that dimension
3. If Progress = 2: review sprint timeline; can recovery happen same day?
4. If Satisfaction = 2: schedule optional check-in call this day; do not wait
5. If Engagement = 2: send reminder email with clear action + deadline
6. Log yellow flag in SPRINT_RISK_LOG.md with mitigation action
7. Reassess in 24 hours; if not improved → escalate as RED

### 🔴 RED — Actions

1. **Stop and escalate.** Do not let red state persist >4 hours.
2. CSM contacts sponsor directly by phone or urgent email
3. Use Issue Acknowledgment template (SUPPORT_PLAYBOOK.md)
4. Activate escalation chain: CSM → REV_PROGRAM_MANAGER → REV_COO_ORCH
5. Document root cause in SPRINT_RISK_LOG.md
6. Identify recovery action with clear owner and 24h deadline
7. If client satisfaction = 1: loop in REV_HEAD_OF_SALES for relationship recovery
8. If sprint cannot complete as planned: trigger sprint delay protocol; communicate to client within same business day

---

## CALIBRATION NOTES (update after each sprint)

> *After each Compass Sprint, the CSM logs what surprised them in health scoring. Used to improve signal definitions.*

| Sprint # | Client Segment | Signal That Was Missed | Proposed Dimension Update |
|---|---|---|---|
| `[1]` | `[SMB / Mid-Market / Enterprise]` | `[e.g., "Client scored 3 on Satisfaction but NPS came in at 6"]` | `[e.g., "Add 'asks no questions' as a neutral/negative signal"]` |

---

## FILES CREATED/UPDATED
- `AMC_OS/CUSTOMER_SUCCESS/HEALTH_SCORE_MODEL.md` (this file)

## ACCEPTANCE CHECKS
- [ ] Every score has observable, non-subjective signals (not "feels engaged")
- [ ] Every score has a triggered action — no dimension left as "just watch"
- [ ] Single-dimension RED override rule is explicit and cannot be ignored
- [ ] Summary card is printable/fillable in under 5 minutes per assessment

## NEXT ACTIONS
1. CSM completes first health assessment at end of Day 1 kickoff for every new sprint
2. Store health logs in `AMC_OS/CUSTOMER_SUCCESS/[CLIENT]/HEALTH_SCORE_LOG.md`
3. After 5 sprints: review calibration notes and update signal definitions
4. REV_QA_LEAD peer review: `AMC_OS/INBOX/REVIEWS/HEALTH_SCORE_MODEL__review.md`
5. Consider automating health score prompts via CRM reminders (REV_REVOPS_CRM)

## RISKS/UNKNOWNS
- Expansion readiness scoring is the most subjective dimension; needs calibration examples after real engagements
- Clients who appear "fine" verbally may still score low NPS — add Day 3 satisfaction pulse as leading indicator
- CSM may skip assessments under time pressure; build into daily standup checklist
