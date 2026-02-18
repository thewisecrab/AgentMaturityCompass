# COMPASS SPRINT DELIVERY SOP
## 5-Day AI Maturity Assessment — Standard Operating Procedure

**Version:** 1.0 | **Owner:** REV_IMPLEMENTATION_SPECIALIST  
**Peer Review Required By:** REV_QA_LEAD  
**Lever:** C — Delivery-Readiness  

---

## Purpose
This SOP gives a new consultant everything needed to execute a Compass Sprint confidently, from kickoff call to final readout. Follow it in order. Flag deviations in the risk log (Day 1). Confidence = cash — a predictable delivery process reduces buyer hesitation and accelerates close.

## Sprint Overview
| Day | Theme | Primary Owner | Client Touch |
|-----|-------|---------------|-------------|
| 1 | Kickoff + Evidence Collection | Implementation Specialist | Kickoff call (60 min) |
| 2 | Deep-Dive Interviews | Implementation Specialist | Stakeholder interviews (3–4 hrs) |
| 3 | Scoring + Gap Analysis | Implementation Specialist + QA | Async — no client call required |
| 4 | Roadmap Construction | Implementation Specialist | Optional mid-sprint check-in (30 min) |
| 5 | Readout Prep + Delivery | Implementation Specialist + CSM | Readout call (90 min) |

**Total client time commitment: ~6–8 hours across the week.**

---

## PRE-SPRINT GATE (Day 0)
> Must be complete before Day 1 begins. See ONBOARDING_CHECKLIST.md.

**Owner:** CSM / Implementation Specialist  
**Gate criteria (all must be ✅ before Day 1):**
- [ ] Signed SOW received and countersigned
- [ ] Kickoff calendar invite accepted by primary stakeholder + at least 2 SMEs
- [ ] ONBOARDING_CHECKLIST.md submitted by client (≥80% complete)
- [ ] Evidence intake folder shared and accessible
- [ ] AMC workspace provisioned (client instance created)
- [ ] Scoring guide loaded and calibrated for client's industry context

**If gate fails:** Do not proceed. Notify CSM + escalate to REV_PROGRAM_MANAGER. Gate failure = sprint delay; document in HQ/BLOCKERS.md.

---

## DAY 1 — KICKOFF + EVIDENCE COLLECTION

### Owner Actions
| # | Action | Time Est. | Output |
|---|--------|-----------|--------|
| 1 | Send Day 1 agenda email to all stakeholders (use template below) | 15 min | Agenda email sent |
| 2 | Run kickoff call (60 min, agenda below) | 60 min | Call notes doc |
| 3 | Open evidence intake folder; validate completeness vs. checklist | 30 min | Evidence gap list |
| 4 | Send follow-up email with outstanding evidence requests | 20 min | Follow-up email sent |
| 5 | Create sprint risk log in AMC workspace | 15 min | Risk log initialized |
| 6 | Update AMC workspace: create client assessment, input tech stack and stakeholder map | 30 min | Assessment created |

**Total Day 1 effort: ~3 hours (consultant)**

### Kickoff Call Agenda (60 min)
```
0:00–0:10   Introductions + roles (who does what on each side)
0:10–0:20   Sprint goals and what success looks like at Day 5 readout
0:20–0:30   Walk through the 7 maturity dimensions — set shared vocabulary
0:30–0:45   Evidence walkthrough — what you shared, what's still needed
0:45–0:55   Interview scheduling for Day 2 (confirm slots + SME attendees)
0:55–1:00   Q&A + housekeeping (Slack/comms channel, emergency contacts)
```

### Client Touchpoints — Day 1
- **Kickoff call** (60 min): Required. Reschedule trigger: <2 client stakeholders confirmed 24h prior.
- **Follow-up email** (async): Sent within 2 hours of kickoff call end.

### Artifacts to Produce — Day 1
1. `AMC_OS/CUSTOMER_SUCCESS/[CLIENT]/DAY1_KICKOFF_NOTES.md` — verbatim action items + decisions
2. `AMC_OS/CUSTOMER_SUCCESS/[CLIENT]/EVIDENCE_GAP_LIST.md` — what's missing, who owns it, deadline
3. `AMC_OS/CUSTOMER_SUCCESS/[CLIENT]/SPRINT_RISK_LOG.md` — initialized with Day 1 risks

### Acceptance Gates — Day 1
- [ ] Kickoff notes shared with client within 4 hours of call end
- [ ] Evidence gap list has owner + deadline for every missing item
- [ ] Assessment exists in AMC workspace with client name, date, and tech stack fields populated
- [ ] At least 3 interview slots confirmed for Day 2

### Risk Flags — Day 1
| Risk | Likelihood | Mitigation |
|------|------------|------------|
| Key stakeholder no-show on kickoff | Medium | Require rescheduled kickoff; do not proceed to evidence collection without it |
| Client submits incomplete evidence pre-sprint | High | Issue evidence gap list same day; set 48-hr hard deadline |
| Interview SMEs unavailable for Day 2 | Medium | Identify 2 backup contacts during kickoff; schedule backup slots |
| Scope creep request on Day 1 | Low | Acknowledge, park in "future engagement" list, stay on sprint scope |

---

## DAY 2 — DEEP-DIVE STAKEHOLDER INTERVIEWS

### Owner Actions
| # | Action | Time Est. | Output |
|---|--------|-----------|--------|
| 1 | Review all evidence submitted; pre-annotate scoring worksheet | 45 min | Pre-populated scoring worksheet |
| 2 | Run stakeholder interviews (3–4 sessions, 45 min each) | 3–4 hrs | Interview transcripts/notes |
| 3 | Cross-reference interview responses against evidence artifacts | 30 min | Discrepancy log |
| 4 | Send "thank you + next steps" to interviewees | 10 min | Async comms sent |
| 5 | Update AMC workspace with interview findings per dimension | 45 min | Workspace updated |

**Total Day 2 effort: ~6–7 hours (consultant)**

### Interview Guide (45-min session)
```
0:00–0:05   Intro: purpose of interview, how data will be used, confidentiality
0:05–0:30   Dimension-specific questions (use AMC_SCORING_GUIDE_v1.md as prompt bank)
0:30–0:40   Evidence validation: "We received X — can you walk us through how it's maintained?"
0:40–0:44   Open floor: anything we missed that we should know?
0:44–0:45   Confirm follow-up evidence requests if any
```

### Recommended Interview Schedule (Day 2)
| Session | Recommended Attendee | Dimensions to Cover |
|---------|---------------------|---------------------|
| Session A (9:00–9:45) | AI/ML Lead or Engineering Lead | Observability, Reliability, Evaluation |
| Session B (10:00–10:45) | Security/Compliance Lead | Security Posture, Autonomy Controls |
| Session C (11:00–11:45) | Ops/Platform Lead | Operational Discipline, Cost |
| Session D (14:00–14:45) | CTO/COO/Head of AI | Human Oversight, Governance, Strategic intent |

### Client Touchpoints — Day 2
- **4 interviews** (3–4 hours total): Required. Minimum 3 interviews to proceed.
- **Thank-you + next steps email** (async): Sent within 2 hours of last interview.

### Artifacts to Produce — Day 2
1. `AMC_OS/CUSTOMER_SUCCESS/[CLIENT]/DAY2_INTERVIEW_NOTES.md` — notes per session, organized by dimension
2. `AMC_OS/CUSTOMER_SUCCESS/[CLIENT]/DISCREPANCY_LOG.md` — where interview responses conflict with evidence
3. Updated AMC workspace: control-level responses entered for all 7 dimensions

### Acceptance Gates — Day 2
- [ ] At least 3 of 4 interview sessions completed
- [ ] Every maturity dimension has at least one data point (interview or evidence)
- [ ] Discrepancy log created and reviewed (empty is OK, must be explicit)
- [ ] AMC workspace control fields populated for ≥70% of all controls

### Risk Flags — Day 2
| Risk | Likelihood | Mitigation |
|------|------------|------------|
| Interview session runs over time | Medium | Keep strict time; park extras in async follow-up doc |
| Interviewee gives inconsistent answers | Medium | Document discrepancy; flag in DISCREPANCY_LOG; resolve via follow-up evidence |
| Critical SME cancels Day 2 | Medium | Request async written responses; schedule async call by EOD |
| Evidence submitted overnight is poor quality | High | Score as L1/unverified; flag in scoring notes |

---

## DAY 3 — SCORING + GAP ANALYSIS

### Owner Actions
| # | Action | Time Est. | Output |
|---|--------|-----------|--------|
| 1 | Score each control across all 7 dimensions using AMC_SCORING_GUIDE_v1.md | 2–3 hrs | Completed scoring worksheet |
| 2 | Calculate dimension scores and overall maturity index | 30 min | Score summary table |
| 3 | Identify top gaps (controls scoring L1 or L2 with high impact) | 45 min | Gap analysis doc |
| 4 | Confidence check: flag any dimension with <50% evidence coverage | 20 min | Confidence flags |
| 5 | Peer review: QA Lead reviews scoring for 2 highest-stakes dimensions | 30 min | QA sign-off |
| 6 | Send brief async status update to client sponsor | 10 min | Status email |

**Total Day 3 effort: ~5 hours (consultant) + 30 min (QA Lead)**

### Scoring Rules
- Use AMC_SCORING_GUIDE_v1.md as the single source of truth for level definitions
- Every control must map to a score AND at least one of: evidence artifact, interview note, or explicit "gap/not observed"
- Never score above L2 without verified documentary evidence
- When evidence conflicts with interview response, score conservatively (lower) and flag
- Confidence indicator = (verified controls / total controls) × coverage factor

### Client Touchpoints — Day 3
- **Async status email only** (5–10 lines): Confirm sprint is on track; flag any outstanding evidence requests with same-day deadline.
- No call required. If client asks for preliminary scores, decline politely ("We want to give you a complete, verified picture at the Day 5 readout").

### Artifacts to Produce — Day 3
1. `AMC_OS/CUSTOMER_SUCCESS/[CLIENT]/SCORING_WORKSHEET.md` — control-by-control scores with evidence citations
2. `AMC_OS/CUSTOMER_SUCCESS/[CLIENT]/GAP_ANALYSIS.md` — top gaps ranked by impact × maturity deficit
3. `AMC_OS/CUSTOMER_SUCCESS/[CLIENT]/CONFIDENCE_FLAGS.md` — dimensions with low evidence coverage
4. `AMC_OS/INBOX/REVIEWS/[CLIENT]_SCORING__review.md` — QA Lead peer review record

### Acceptance Gates — Day 3
- [ ] Every control has a score (L1–L4) and a citation (evidence ID, interview note, or gap flag)
- [ ] Overall maturity index calculated and spot-checked (sum formula verified)
- [ ] QA Lead has reviewed and signed off on the 2 highest-stakes dimensions
- [ ] No dimension scored entirely from interview alone (no documentary evidence at all) without a confidence flag
- [ ] Status email sent to client sponsor

### Risk Flags — Day 3
| Risk | Likelihood | Mitigation |
|------|------------|------------|
| Insufficient evidence for key dimension | High | Score conservatively; recommend evidence-gathering as first roadmap action |
| Scoring disagreement between consultant and QA | Low | Escalate to REV_PRODUCT_MANAGER using scoring guide as arbiter |
| Client requests early preview of scores | Medium | Decline; explain complete picture at readout avoids misinterpretation |
| Time overrun on scoring | Medium | Prioritize high-impact dimensions first; use time-box of 25 min/dimension |

---

## DAY 4 — ROADMAP CONSTRUCTION

### Owner Actions
| # | Action | Time Est. | Output |
|---|--------|-----------|--------|
| 1 | Import gap analysis into roadmap generator; generate initial action list | 30 min | Raw action list |
| 2 | Prioritize top 10 actions by impact/confidence/effort (ICE scoring) | 45 min | Prioritized roadmap |
| 3 | Assign suggested owners and 90-day target dates to each action | 30 min | Roadmap with owners + dates |
| 4 | Identify "quick wins" (high impact, low effort, completable in 30 days) | 20 min | Quick wins callout |
| 5 | Map actions to 90-day timeline: 30-day / 60-day / 90-day buckets | 20 min | Phased roadmap |
| 6 | Draft retainer pitch section (connect roadmap to ongoing engagement options) | 30 min | Retainer framing notes |
| 7 | Optional mid-sprint check-in with client sponsor (30 min) | 30 min | Check-in notes |
| 8 | Begin building readout deck (populate data slides) | 60 min | Draft readout deck (partial) |

**Total Day 4 effort: ~4.5 hours (consultant)**

### ICE Scoring for Roadmap Prioritization
```
Impact (1–5):    How much does this improve overall maturity index?
Confidence (1–5): How confident are we this action will work given client context?
Effort (1–5):    How much effort is required? (1 = low effort, 5 = very high)

ICE Score = (Impact × Confidence) / Effort
Rank actions highest ICE first.
```

### Optional Mid-Sprint Check-In Agenda (30 min — Day 4)
```
0:00–0:05   Confirm sprint is on track, readout on schedule
0:05–0:15   Preview: "We're seeing strengths in X and gaps in Y" (no scores yet)
0:15–0:25   Confirm stakeholder attendance for Day 5 readout
0:25–0:30   Logistics: will they need the deck in advance? Executive attendee names?
```

### Client Touchpoints — Day 4
- **Optional check-in call** (30 min): Recommended if client is anxious or if major surprises emerged from scoring. Skip if sprint is proceeding smoothly.
- **Readout invite confirmation** (async): Confirm Day 5 calendar, attendee list, and any AV/logistics needs.

### Artifacts to Produce — Day 4
1. `AMC_OS/CUSTOMER_SUCCESS/[CLIENT]/ROADMAP_v1.md` — prioritized 10-action roadmap with ICE scores, owners, dates, and phasing
2. `AMC_OS/CUSTOMER_SUCCESS/[CLIENT]/QUICK_WINS.md` — 3–5 actions completable within 30 days
3. Draft readout deck (from SPRINT_READOUT_DECK_TEMPLATE.md) — data slides populated

### Acceptance Gates — Day 4
- [ ] Roadmap has exactly 10 (or more) prioritized actions with ICE scores, owners, and due dates
- [ ] At least 3 quick wins identified (completable ≤30 days)
- [ ] 90-day phased timeline created (30/60/90 buckets)
- [ ] Readout deck data slides drafted (maturity scores, top risks, top opportunities populated)
- [ ] Day 5 readout confirmed with client (calendar accepted, ≥2 stakeholders confirmed)

### Risk Flags — Day 4
| Risk | Likelihood | Mitigation |
|------|------------|------------|
| Roadmap actions feel generic | Medium | Pull from gap analysis specifics; tie each action to a specific control score |
| Client sponsor cancels check-in | Low | Async update acceptable; keep check-in optional |
| Too many L1/L2 scores — roadmap is overwhelming | Medium | Cluster into themes; present as phased program, not todo list |
| Retainer pitch feels premature | Low | Frame as "supporting your roadmap" — evidence-based, not sales pressure |

---

## DAY 5 — READOUT PREP + DELIVERY

### Owner Actions
| # | Action | Time Est. | Output |
|---|--------|-----------|--------|
| 1 | Finalize readout deck (all slides complete, proofread) | 60 min | Final readout deck |
| 2 | Rehearse readout delivery (solo or with CSM) — time it | 20 min | Run of show confidence |
| 3 | Prepare handout: one-page summary (maturity score, top 3 risks, top 3 opps) | 20 min | One-pager |
| 4 | Send deck to client sponsor 1 hour before readout (if requested) | 5 min | Deck delivered |
| 5 | Run readout call (90 min, agenda below) | 90 min | Recorded readout call |
| 6 | Send post-readout follow-up email within 2 hours | 20 min | Follow-up email |
| 7 | Archive all sprint artifacts in AMC workspace | 30 min | Sprint archive complete |
| 8 | Internal debrief: what went well, what to improve | 20 min | Debrief notes |

**Total Day 5 effort: ~5.5 hours (consultant)**

### Readout Call Agenda (90 min)
```
0:00–0:05   Welcome + agenda overview; introductions if new executives attending
0:05–0:15   Executive summary: what we assessed, methodology, confidence level
0:15–0:35   Maturity scores by dimension (walk through each, highlight key evidence)
0:35–0:45   Top 3 risks (root cause, business impact, urgency)
0:45–0:55   Top 3 opportunities (what's possible, expected score lift)
0:55–1:10   90-day roadmap (walk through phases, owners, quick wins)
1:10–1:20   Next engagement options (retainer / implementation support)
1:20–1:30   Q&A + next steps; confirm action items
```

### Post-Readout Follow-Up Email (Template)
```
Subject: Compass Sprint Readout — [CLIENT NAME] — Summary + Next Steps

Hi [Sponsor Name],

Thank you for a productive sprint week. Key outputs are attached:
- Final readout deck
- 90-day roadmap (with action owners + due dates)
- One-page maturity summary

Top 3 next steps we recommend:
1. [Quick win #1 — assign owner by [date]]
2. [Quick win #2 — assign owner by [date]]
3. [Schedule 30-day check-in — proposed: [date]]

We're ready to support [retainer option / next engagement]. Reply to this email or book time at [link].

[Consultant name]
```

### Client Touchpoints — Day 5
- **Readout call** (90 min): Required. Cannot be shortened below 60 min without sponsor sign-off.
- **Post-readout email** (async): Must go out within 2 hours of call end. Strike while engagement is hot.

### Artifacts to Produce — Day 5
1. `AMC_OS/CUSTOMER_SUCCESS/[CLIENT]/READOUT_DECK_FINAL.pdf` — finalized readout deck
2. `AMC_OS/CUSTOMER_SUCCESS/[CLIENT]/ONE_PAGER.md` — one-page maturity summary
3. `AMC_OS/CUSTOMER_SUCCESS/[CLIENT]/POST_READOUT_EMAIL.md` — follow-up email record
4. `AMC_OS/CUSTOMER_SUCCESS/[CLIENT]/SPRINT_ARCHIVE/` — all sprint artifacts archived
5. `AMC_OS/CUSTOMER_SUCCESS/[CLIENT]/DEBRIEF_NOTES.md` — internal lessons learned

### Acceptance Gates — Day 5
- [ ] Readout deck proofread by second person (CSM or QA Lead)
- [ ] Every maturity score in deck matches the scoring worksheet exactly
- [ ] Readout call delivered with all major agenda sections covered
- [ ] Post-readout email sent within 2 hours of call end
- [ ] Next engagement options presented (retainer pitch made)
- [ ] All sprint artifacts archived and accessible in AMC workspace
- [ ] Client has confirmed receipt of deck + roadmap

### Risk Flags — Day 5
| Risk | Likelihood | Mitigation |
|------|------------|------------|
| Decision-maker no-show at readout | Medium | Record session; send recording + personal follow-up within 24hr |
| Client disputes a score | Medium | Walk back to evidence; do not change score on the call without re-review |
| Client wants to negotiate scope of retainer on the call | Low | Welcome it; have pricing options ready (see SALES/PRICING) |
| Technical issues with deck / screen share | Low | Have PDF backup ready; practice screen share before call |
| Readout runs over 90 min | Medium | Keep Q&A to 10 min; park extended questions in follow-up |

---

## POST-SPRINT (Day 6+)

### Owner Actions
| # | Action | Deadline | Output |
|---|--------|----------|--------|
| Internal debrief filed | EOD Day 5 | `DEBRIEF_NOTES.md` |
| IMPACT_LOG updated | EOD Day 5 | `AMC_OS/OPS/IMPACT_LOG/REV_IMPLEMENTATION_SPECIALIST.md` |
| Retainer proposal sent (if interest expressed) | Day 7 | Proposal doc |
| 30-day check-in scheduled | Day 7 | Calendar invite accepted |
| Sprint learnings fed back to SPRINT_DELIVERY_SOP.md | Day 10 | SOP updated (v1.x) |

---

## SPRINT COMMUNICATION CADENCE SUMMARY

| When | What | Channel | Owner |
|------|------|---------|-------|
| Day 1 AM | Kickoff call | Video call | Impl. Specialist |
| Day 1 PM | Evidence gap follow-up | Email | Impl. Specialist |
| Day 2 | Interview sessions | Video call | Impl. Specialist |
| Day 3 | Status check-in | Email | CSM |
| Day 4 (optional) | Mid-sprint check-in | Video call | Impl. Specialist |
| Day 4 PM | Readout logistics confirm | Email | CSM |
| Day 5 AM | Deck sent (if requested) | Email | Impl. Specialist |
| Day 5 | Readout call | Video call | Impl. Specialist + CSM |
| Day 5 PM | Post-readout follow-up | Email | Impl. Specialist |

---

## ESCALATION PATHS

| Situation | Escalate To | SLA |
|-----------|-------------|-----|
| Sprint gate failure | REV_PROGRAM_MANAGER | Same day |
| Scoring dispute | REV_QA_LEAD | 4 hours |
| Client goes dark (>24hr no response) | REV_CUSTOMER_SUCCESS_MANAGER | Same day |
| Legal / compliance question | REV_LEGAL_CONTRACTS | Same day |
| Scope change request | REV_PROGRAM_MANAGER + REV_ACCOUNT_EXEC_CLOSER | Same day |

---

## FILES CREATED/UPDATED
- `AMC_OS/CUSTOMER_SUCCESS/SPRINT_DELIVERY_SOP.md` (this file)

## ACCEPTANCE CHECKS
- New consultant can execute sprint using only this SOP + linked templates
- Every day has explicit owner actions, time estimates, client touchpoints, artifacts, and gates
- Escalation paths are defined for all foreseeable failure modes

## NEXT ACTIONS
1. Pilot this SOP on next signed client; debrief at Day 5 using DEBRIEF_NOTES template
2. Create `AMC_OS/CUSTOMER_SUCCESS/[CLIENT]/` folder structure template for consistent archiving
3. REV_QA_LEAD peer review: `AMC_OS/INBOX/REVIEWS/SPRINT_DELIVERY_SOP__review.md`
4. Link this SOP to SALES onboarding materials — showing clients the process increases close rate
5. Schedule SOP review after 3 sprints; increment to v1.1

## RISKS/UNKNOWNS
- Evidence quality from first clients will likely be inconsistent; scoring guide must be calibrated early
- Interview SME availability is the #1 sprint schedule risk; pre-commit during onboarding
- Retainer conversion rate from readout call is unknown; instrument and track from Sprint 1
