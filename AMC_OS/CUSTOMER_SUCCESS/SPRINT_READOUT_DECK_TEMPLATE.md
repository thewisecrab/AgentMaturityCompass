# COMPASS SPRINT — READOUT DECK TEMPLATE
## Slide-by-Slide Guide with Fill-In Placeholders

**Version:** 1.0 | **Owner:** REV_IMPLEMENTATION_SPECIALIST + REV_DOCS_TECH_WRITER  
**Usage:** Populate before every Compass Sprint readout. Replace all `[PLACEHOLDERS]` with actual data.  
**Format tip:** Present in slide tool of choice (Pitch, Google Slides, PowerPoint). This template is the content brief — copy slides from here.

---

## SLIDE 1 — COVER

**Slide title:** AI Agent Maturity Compass Sprint: Findings & Roadmap

**Visual:** Client logo + AMC logo side by side

**Body:**
```
[CLIENT COMPANY NAME]
Compass Sprint Assessment — [MONTH YEAR]

Prepared by: [CONSULTANT NAME], AMC
Confidential — For Internal Use Only
```

**Speaker notes:**
> Welcome everyone. This is the readout for your [CLIENT NAME] Compass Sprint. What you'll see today is a complete maturity baseline for your AI agent operations — where you are now, where the risk is, and the clearest path forward. Let's get into it.

---

## SLIDE 2 — EXECUTIVE SUMMARY

**Slide title:** Executive Summary

**Key message:** One clear sentence on where this client stands.

**Content block:**
```
Overall AI Agent Maturity Index: [X.X / 4.0]   Rating: [EMERGING / DEVELOPING / DEFINED / ADVANCED]

Assessment scope:
  ✅ [NUMBER] AI agent workflows assessed
  ✅ [NUMBER] evidence artifacts reviewed
  ✅ [NUMBER] stakeholder interviews conducted
  📅 Sprint dates: [START DATE] – [END DATE]

Top finding in one sentence:
[CLIENT NAME]'s AI agent operations show [STRENGTH AREA] as a standout capability,
while [TOP RISK DIMENSION] represents the most urgent remediation priority.

Bottom line:
[1–2 sentences. E.g.: "With targeted improvements in autonomy controls and observability,
[CLIENT] is well-positioned to reach Defined maturity within 90 days."]
```

**Assessment confidence:** [HIGH / MEDIUM / LOW]  
*(High = >80% controls evidenced; Medium = 50–80%; Low = <50%)*

**Speaker notes:**
> The overall index of [X.X] puts [CLIENT] in the [RATING] band. We assessed [N] workflows, reviewed [N] artifacts, and interviewed [N] people. Confidence is [HIGH/MEDIUM] — meaning the scores are well-evidenced. Here's the one-line takeaway: [repeat bottom line].

---

## SLIDE 3 — METHODOLOGY & SCOPE

**Slide title:** How We Assessed: Methodology

**Content block:**
```
WHAT WE ASSESSED
  ☐ AI agent workflows in scope: [LIST 3–5 KEY WORKFLOWS, e.g., "Customer support bot, 
    internal knowledge retrieval, automated reporting pipeline"]
  ☐ Systems reviewed: [LIST KEY PLATFORMS, e.g., "AWS Bedrock, LangChain, internal API gateway"]
  ☐ Time window: [DATE RANGE of evidence reviewed]

HOW WE SCORED
  • 7 maturity dimensions (see next slide)
  • 4-level scale: L1 (Ad Hoc) → L4 (Optimizing)
  • Evidence-based: every score maps to an artifact or documented gap
  • Confidence indicator reflects evidence coverage + freshness

WHAT'S NOT IN SCOPE
  • [EXPLICIT EXCLUSIONS, e.g., "Data pipelines outside agent workflows"]
  • [EXCLUSION 2]
  • [Any regulatory/compliance attestation — this is not a compliance audit]
```

**Speaker notes:**
> Quick word on methodology before the scores. We score on a 4-level scale — L1 through L4 — and every score must tie back to evidence or an explicit gap. We're not guessing. Scope for this sprint was [list workflows]. We explicitly did not assess [exclusions].

---

## SLIDE 4 — MATURITY SCORES BY DIMENSION

**Slide title:** Maturity by Dimension

**Visual:** Radar/spider chart with 7 spokes OR horizontal bar chart — one bar per dimension.

**Score table:**
```
DIMENSION                  | SCORE | LEVEL        | CONFIDENCE
---------------------------|-------|--------------|------------
Evidence Quality           | [X.X] | [L1/L2/L3/L4]| [H/M/L]
Autonomy Controls          | [X.X] | [L1/L2/L3/L4]| [H/M/L]
Observability              | [X.X] | [L1/L2/L3/L4]| [H/M/L]
Human Oversight            | [X.X] | [L1/L2/L3/L4]| [H/M/L]
Security Posture           | [X.X] | [L1/L2/L3/L4]| [H/M/L]
Operational Discipline     | [X.X] | [L1/L2/L3/L4]| [H/M/L]
Governance & Compliance    | [X.X] | [L1/L2/L3/L4]| [H/M/L]
---------------------------|-------|--------------|------------
OVERALL INDEX              | [X.X] | [BAND NAME]  | [H/M/L]
```

**Key callouts (3 bullets on slide):**
```
🟢 Strongest dimension: [DIMENSION] — [one-line why]
🔴 Weakest dimension:  [DIMENSION] — [one-line why]
📊 Most improvement potential: [DIMENSION] — [one-line why]
```

**Speaker notes:**
> Walk through each score briefly. Spend more time on the outliers — highest and lowest. Explain what each dimension measures in plain language before giving the score. Reference confidence level for any score where evidence was thin.

---

## SLIDE 5 — DIMENSION DEEP DIVE (ONE SLIDE PER DIMENSION — OPTIONAL)

> **Usage:** Include this slide format for each of the 7 dimensions if the audience is technical or wants full detail. For exec audiences, skip to slides 6–8 after slide 4.

**Slide title:** [DIMENSION NAME] — Deep Dive

**Content block:**
```
Score: [X.X] | Level: [L1/L2/L3/L4] | Confidence: [HIGH/MEDIUM/LOW]

WHAT WE FOUND:
  [2–3 sentences describing the current state. Specific, concrete. E.g.:
  "Logs are collected for all agent invocations but lack structured trace IDs.
  Alerting exists for system errors but not for semantic/behavioral anomalies."]

KEY EVIDENCE:
  ✅ [Evidence item 1 — e.g., "Monitoring dashboard reviewed; shows latency and error rate"]
  ✅ [Evidence item 2]
  ⚠️  [Gap item — e.g., "No evidence of alert runbooks or on-call process"]

WHAT GOOD LOOKS LIKE AT L[N+1]:
  [1 sentence on what would move them to the next level]

RECOMMENDED ACTION:
  → [Specific next step with owner role and suggested timeline]
```

---

## SLIDE 6 — TOP 3 RISKS

**Slide title:** Top 3 Risks — Requiring Immediate Attention

**Format:** One box per risk. Red/orange visual urgency.

---

**RISK 1: [RISK TITLE]**
```
Dimension:     [DIMENSION NAME]
Current state: [What's happening now — 1 sentence]
Root cause:    [Why it exists — 1 sentence]
Business impact: [What happens if not addressed — 1 sentence. Make it tangible:
                   "A single misconfigured agent action could result in..."]
Urgency:       [HIGH / CRITICAL]
Recommended action: [Specific action, owner role, target date]
```

---

**RISK 2: [RISK TITLE]**
```
Dimension:     [DIMENSION NAME]
Current state: [Description]
Root cause:    [Root cause]
Business impact: [Tangible impact]
Urgency:       [HIGH / MEDIUM]
Recommended action: [Action + owner + date]
```

---

**RISK 3: [RISK TITLE]**
```
Dimension:     [DIMENSION NAME]
Current state: [Description]
Root cause:    [Root cause]
Business impact: [Tangible impact]
Urgency:       [MEDIUM]
Recommended action: [Action + owner + date]
```

**Speaker notes:**
> These three risks are not hypothetical. Here's why each one matters to [CLIENT NAME] specifically... [personalize each risk to their business context]. We recommend addressing [Risk 1] within [timeframe] before it becomes a harder problem.

---

## SLIDE 7 — TOP 3 OPPORTUNITIES

**Slide title:** Top 3 Opportunities — Highest-Impact Improvements

**Format:** One box per opportunity. Green/teal visual tone.

---

**OPPORTUNITY 1: [OPPORTUNITY TITLE]**
```
Dimension:       [DIMENSION NAME]
Current score:   [L1/L2/L3]  →  Target score: [L2/L3/L4]
What to do:      [Specific, concrete action — 1–2 sentences]
Expected lift:   +[X.X] points on [DIMENSION] dimension; +[X] overall index points
Effort:          [LOW / MEDIUM / HIGH]
Timeline:        [30 / 60 / 90 days]
Owner (suggested): [ROLE, e.g., "Engineering Lead"]
```

---

**OPPORTUNITY 2: [OPPORTUNITY TITLE]**
```
Dimension:       [DIMENSION NAME]
Current score:   [LN]  →  Target score: [LN+1]
What to do:      [Description]
Expected lift:   +[X.X] points on [DIMENSION]; +[X] overall
Effort:          [LOW / MEDIUM]
Timeline:        [30 / 60 days]
Owner (suggested): [ROLE]
```

---

**OPPORTUNITY 3: [OPPORTUNITY TITLE]**
```
Dimension:       [DIMENSION NAME]
Current score:   [LN]  →  Target score: [LN+1]
What to do:      [Description]
Expected lift:   +[X.X] points; +[X] overall
Effort:          [MEDIUM]
Timeline:        [60 / 90 days]
Owner (suggested): [ROLE]
```

**Speaker notes:**
> Now the good news. These three opportunities are where [CLIENT] has the most leverage. [Opportunity 1] is especially interesting because [personalize]. If you do just these three things in 90 days, your overall index moves from [X.X] to [Y.Y].

---

## SLIDE 8 — 90-DAY ROADMAP

**Slide title:** Your 90-Day AI Maturity Roadmap

**Visual:** Three-column timeline (30 / 60 / 90 days) or Gantt-style.

**Top callout:**
```
Current Index: [X.X]   →   Projected 90-Day Index: [Y.Y]   (+[Z.Z] improvement)
```

---

**30-DAY PRIORITIES (Quick Wins)**
```
✅ [Action 1] — [Owner Role] — [Target Date]
   [One line on why this is first priority]

✅ [Action 2] — [Owner Role] — [Target Date]
   [One line on why]

✅ [Action 3] — [Owner Role] — [Target Date]
   [One line on why]
```

**60-DAY PRIORITIES (Foundation Building)**
```
🔨 [Action 4] — [Owner Role] — [Target Date]
   [Description]

🔨 [Action 5] — [Owner Role] — [Target Date]
   [Description]

🔨 [Action 6] — [Owner Role] — [Target Date]
   [Description]
```

**90-DAY PRIORITIES (Scaling & Hardening)**
```
🚀 [Action 7] — [Owner Role] — [Target Date]
   [Description]

🚀 [Action 8] — [Owner Role] — [Target Date]
   [Description]

🚀 [Action 9] — [Owner Role] — [Target Date]
   [Description]

🚀 [Action 10] — [Owner Role] — [Target Date]
   [Description]
```

**Dependencies / sequencing notes:**
```
• [Action X] must complete before [Action Y] can start
• [Action Z] requires procurement approval — start process by [date]
```

**Speaker notes:**
> This roadmap is deliberately phased. The 30-day items are achievable without large investment. The 60-day items build on those foundations. By day 90, [CLIENT] moves to [TARGET BAND]. The key dependency is [dependency]. If anything slips, [Action 1] is still the one to protect.

---

## SLIDE 9 — NEXT ENGAGEMENT OPTIONS (RETAINER PITCH)

**Slide title:** Continuing the Journey — How We Can Support You

**Framing line:** *"The roadmap is clear. The question is how fast you want to move and how much support you want along the way."*

---

**OPTION A: Self-Directed (You lead, we advise)**
```
What's included:
  • 30-day and 90-day check-in calls (2 × 45 min)
  • Async Q&A on roadmap items via dedicated Slack/email
  • Re-assessment at 90 days (Compass Sprint 2)

Investment: [PRICE — e.g., $X,XXX/month or fixed fee]
Best for: Teams with strong internal AI/eng capacity who mainly need
          accountability and course correction
```

---

**OPTION B: Guided Implementation (We co-pilot)**
```
What's included:
  • Weekly 60-min working sessions with implementation specialist
  • Hands-on support for top 5 roadmap items
  • Evidence collection coaching + template reviews
  • Re-assessment at 60 days + 90 days

Investment: [PRICE — e.g., $X,XXX/month]
Best for: Teams moving fast and wanting expert support on
          implementation, not just direction
```

---

**OPTION C: Full Maturity Program (We drive)**
```
What's included:
  • Dedicated implementation specialist embedded [N hrs/week]
  • All 10 roadmap items executed with [CLIENT] team
  • Monthly maturity re-assessment + dashboard
  • Executive reporting package each quarter

Investment: [PRICE — e.g., $X,XXX/month]
Best for: Organizations treating AI governance as a strategic priority
          and wanting a proven partner alongside them
```

---

**Decision prompt for closing:**
```
"Which of these best fits where you are right now?
 If Option B feels right, we can have a proposal to you by [DATE]."
```

**Speaker notes:**
> Don't pitch this hard. Present the options, let them land. Pause after "Which of these best fits where you are?" Give them 10–15 seconds to respond before you speak again. If they hesitate, ask what's holding them back.

---

## SLIDE 10 — APPENDIX: EVIDENCE SUMMARY

**Slide title:** Appendix — Evidence Inventory

**Content block:**
```
EVIDENCE REVIEWED

| Evidence ID | Type       | Dimension           | Status     | Date        |
|-------------|------------|---------------------|------------|-------------|
| EVD-001     | [TYPE]     | [DIMENSION]         | [VERIFIED] | [DATE]      |
| EVD-002     | [TYPE]     | [DIMENSION]         | [ATTESTED] | [DATE]      |
| EVD-003     | [TYPE]     | [DIMENSION]         | [GAP]      | [DATE]      |
| ...         | ...        | ...                 | ...        | ...         |

GAPS (no evidence available)
| Control ID  | Dimension           | Impact on Score | Recommended Next Step  |
|-------------|---------------------|-----------------|------------------------|
| CTL-XXX     | [DIMENSION]         | [H/M/L]         | [ACTION]               |
| ...         | ...                 | ...             | ...                    |
```

---

## SLIDE 11 — APPENDIX: SCORING REFERENCE

**Slide title:** Appendix — Maturity Level Definitions

```
L1 — AD HOC:      No documented process; reactive; individual-dependent
L2 — DEVELOPING:  Some process exists; partially documented; inconsistently applied
L3 — DEFINED:     Documented, standardized, consistently applied across teams
L4 — OPTIMIZING:  Continuously measured, benchmarked, and improved; automated where possible

OVERALL INDEX BANDS:
  1.0–1.9  |  EMERGING    — Significant foundational work required
  2.0–2.9  |  DEVELOPING  — Core processes in place; key gaps remain
  3.0–3.4  |  DEFINED     — Mature baseline; optimization opportunities ahead
  3.5–4.0  |  ADVANCED    — Industry-leading; focus on innovation and benchmarking
```

---

## USAGE NOTES FOR CONSULTANTS

**Before the call:**
- Replace ALL `[PLACEHOLDERS]` — do a Ctrl+F search for `[` to catch any missed
- Verify every score in the deck matches the scoring worksheet exactly
- Have the one-pager ready as a backup leave-behind
- Test screen share 10 min before call start

**During the call:**
- Slide 4 (scores) is where executives will react — slow down, read the room
- Slide 6 (risks) — lead with business impact, not technical description
- Slide 9 (options) — present, then be quiet; let the client respond first
- Never change a score live on the call; commit to follow-up review

**After the call:**
- Send follow-up email within 2 hours (template in SPRINT_DELIVERY_SOP.md)
- Log readout outcome in `AMC_OS/OPS/IMPACT_LOG/REV_IMPLEMENTATION_SPECIALIST.md`

---

## FILES CREATED/UPDATED
- `AMC_OS/CUSTOMER_SUCCESS/SPRINT_READOUT_DECK_TEMPLATE.md` (this file)

## ACCEPTANCE CHECKS
- Every slide has a clear purpose, fill-in placeholders, and speaker notes
- Scores in slide 4 cross-reference AMC_SCORING_GUIDE_v1.md level definitions
- Retainer options in slide 9 are presented as choices, not hard sells
- Appendix slides provide full evidence trail for skeptical stakeholders

## NEXT ACTIONS
1. Convert this template into a live slide deck (Google Slides / Pitch) for operational use
2. Add client-specific visual branding section (logo placement guide)
3. Instrument readout outcome tracking: which option clients choose, conversion rate
4. REV_HEAD_OF_SALES peer review the retainer pitch slide wording

## RISKS/UNKNOWNS
- Score formatting (X.X vs percentage) should be standardized before first use
- Retainer pricing placeholders must be filled from FINANCE_LEGAL/PRICING.md before client use
- Executive audiences may skip appendix slides — confirm in advance whether they want detail
