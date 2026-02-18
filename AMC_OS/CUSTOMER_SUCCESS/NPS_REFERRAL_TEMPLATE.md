# POST-SPRINT NPS & REFERRAL PROCESS

## Scope
This process runs after Compass Sprint readout (Day 5). Survey and follow-ups are sent **on Day 6 (one day after readout)**.

## 1) 5-question survey (send Day 6)
Send via email + Slack/thread or CRM form.

1) **“How likely are you to recommend this assessment to a peer?”**
- 0–10 scale

2) **“What was most valuable in the sprint for your team?”**
- Open-ended

3) **“What was the least clear or least useful part?”**
- Open-ended

4) **“How confident are you in the top 3 recommendations and where they map to your business priorities?”**
- 1–5 scale

5) **“Would you like us to stay involved in roadmap execution?”**
- Yes / Maybe / No + preferred cadence

## 2) Response handling
- Log responses in client file: `AMC_OS/CUSTOMER_SUCCESS/[CLIENT]/NPS_SURVEY.md`.
- Tag Day 14 and 30 follow-up in client calendar.
- For low scores (0–6), trigger recovery call within 24 business hours.

## 3) Branch logic by NPS score

### A) NPS **9–10** (advocates)
**Goal:** Ask for referral naturally and specifically.

**Email template (human tone):**

Subject: Quick ask from your team — you were kind enough to share feedback

Hi [Name],

Thanks again for taking time to review the sprint. I’m really glad the assessment was useful to your team.

If this is a fair reflection, would you be comfortable introducing us to one peer or colleague who is also building AI in production and might benefit from this kind of review?

A quick note is all it takes: “We worked with [Your Company] for a Compass Sprint.”

No pressure at all. Even if now isn’t a good time, I appreciate the honest feedback you gave.

Thanks,
[Your Name]

### B) NPS **7–8** (neutral)
**Goal:** Improve confidence + set up soft retainer conversation.

**Email/DM template:**

Subject: Thanks for the feedback — can we make this even more useful?

Hi [Name],

Thanks for the honest feedback. I’m glad parts of the sprint were useful, and your score suggests there is room to make this even stronger.

Would you be open to a short 15-minute alignment on two things?
- Which recommendation should move first
- Whether a light execution-support option makes sense right now

If useful, we can keep it practical: monthly planning support, roadmap governance, and check-ins tied directly to your top 3 priorities.

Only if it helps you execute faster.

Best,
[Your Name]

### C) NPS **0–6** (at risk)
**Goal:** Recover trust and reframe expectations.

**Recovery call script (first 15 minutes)**

**Opening (1–2 min):**
- “Thanks for giving the sprint score. I want to make sure we fix the parts that fell short.”

**Exploration (5–6 min):**
- “What specifically did not work for your team?”
- “What did we promise in the readout that didn’t land?”
- “If we could improve one thing in the next 48 hours, what would it be?”

**Ownership (4–5 min):**
- Restate 2–3 concrete issues from their feedback.
- Confirm one immediate correction in follow-up (document + date).

**Recovery commitment (2–3 min):**
- “Here is what we will do by [date]: [action], [owner], [expected result].”

**Close (1–2 min):**
- “I appreciate the feedback. We want to earn your trust back. I’ll share our revised plan by [time].”

**Post-call action:**
- Send same-day written recap with 1-week correction plan and owners.

## 4) Follow-up timing summary
| Day | Action |
|---|---|
| Day 6 | NPS survey sent (10–12 minute read) |
| Day 6 (within 24h of low score) | Recovery call for ≤6 |
| Day 7 | Referral or retainer thread for 9–10 and 7–8 |
| Day 14 | Health/status check and optional improvement pulse |

## 5) Quality control
- Do not send referral ask before Day 6 score branch is processed.
- Do not send retention ask with low score without first acknowledging pain.
- Keep all messages plain-language and non-robotic; avoid “script-y” phrasing.

## 6) Files created/updated
- `AMC_OS/CUSTOMER_SUCCESS/NPS_REFERRAL_TEMPLATE.md`

## 7) Acceptance checks
- 5-question survey exists and maps to concrete outputs.
- Day 6 trigger and follow-up timings are explicitly defined.
- Three branching templates/scripts are provided for NPS bands (9-10, 7-8, 0-6).
- Human language is intentionally conversational and non-robotic.

## 8) Next actions
1. Add survey link and ownership in `SPRINT_DELIVERY_SOP.md` Post-sprint section.
2. Add CRM task automation for Day 6 trigger.
3. Record first 5 responses and refine wording after 3 pilot sprints.

## 9) Risks/unknowns
- Survey response rates can be low; schedule a reminder.
- Client may treat soft retainer note as pressure if tone is too direct.
- Low-score clients may require legal/commercial involvement if dissatisfaction includes scope or billing.
