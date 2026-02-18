# AMC Compass Sprint — Demo/Discovery Call Script

**Call type:** 30-minute sprint-start discovery + live demo
**Goal:** Qualify, build urgency through outcomes, demonstrate value, and secure a mutual path to signature/next step.
**Primary audience:** VP/Head of Engineering, CTO, AI Lead, RevOps, Product leader
**Flow:** Opening rapport (2 min) → SPIN-style situation questions (5 min) → Pain amplification (5 min) → Capability demonstration (10 min) → Trial close + next step (3 min)

---

## 1) Opening Rapport — 2 minutes

### Objective
Set a collaborative frame and control agenda so the prospect trusts you are there to diagnose, not pitch.

**Script:**

"Hi [Name], thanks for the time. I know the last few minutes matter, so I’ll keep this practical. My goal is to leave with two outcomes: (1) a clear read on where your agent workflows are most exposed, and (2) whether a 5-day Compass Sprint is the right next move for your team.

I’d like to spend this in 5 parts over 30 minutes: first I’ll ask a few situational questions, then I’ll mirror what I hear back to your current context, then I’ll show how AMC scoring reveals the highest-impact issues, and finally we’ll decide if this is a fit and the right next step. If you’re open to that, does that work?"

**Rapport probes (light):**
- "Before we jump in, what does your AI operating model look like right now in one sentence?"
- "What does a successful engagement look like for you from this call?"

**Micro-credibility close for rapport:**
- "The sprint is designed to give you practical evidence fast, not a generic strategy deck."

---

## 2) Situation Questions (SPIN-style) — 5 minutes

### Objective
Diagnose context, stakeholders, scope, baseline quality, and readiness for execution.

Use SPIN sequence and speak in 1–2 question blocks.

## Situation questions (S)
1. "What specific agent systems are currently in production today?"
2. "Which teams depend on their outputs, and which workflows are most business-critical?"
3. "Do you already have baseline KPIs for agent quality, latency, escalation, and business outcomes?"
4. "Who manages and owns remediation when an agent issue occurs?"
5. "What tooling/infra stack are those systems running on?"

## Problem questions (P)
6. "Where are the rework loops or trust issues appearing most often?"
7. "Where do mistakes or delays have the highest business cost?"
8. "How often do you pause or override AI outputs because of accuracy/reliability concerns?"
9. "What monitoring or audit trail exists when outputs differ from expected behavior?"

## Implication questions (I)
10. "What happens operationally if this persists for another 30 days?"
11. "What executive risk does this create now (customer impact, compliance exposure, SLA breach, revenue delay)?"
12. "What support burden does this create for your engineering/ops team each week?"

## Need-payoff questions (N)
13. "If we could isolate the top 3 risk/impact gaps in 5 days, what would that let you do in Q1?"
14. "What value would a clean, ranked roadmap create for leadership alignment next week?"
15. "If results come with evidence and ownership tags, would that materially change your decision process?"

**Close this section:**
- "So far I hear [pain + owner + KPI + timeline]. Let me check one thing: if nothing changed in 30 days, which consequence would be most painful for the business?"

---

## 3) Pain Amplification — 5 minutes

### Objective
Quantify urgency and make pain tangible enough for a clear commercial decision.

**Script sequence:**

- "You said rework happens [X] times/week and affects [Y]. Can we estimate the weekly cost of that?"
- "What’s the decision cost if leadership asks you for evidence and you can’t provide it quickly?"
- "Which teams are compensating manually because trust is low in AI outputs?"
- "If there is no clear owner, how often does the issue recur instead of getting fixed?"

**Amplification checkpoints (use numbers where available):**
- Time: hours/week spent triaging bad outputs
- Quality: incident/rework rate
- Risk: escalation/compliance exposure
- Velocity: delays before launch, support burden

**Pain summary statement (verbatim style):**
"It sounds like the underlying risk is not that your team lacks AI tools—it’s that you lack a measured and prioritized maturity view. That means effort is spent reacting, not improving. Is that fair?"

**If prospect names constraints:**
- "I hear the constraint is capacity/time. That makes a 5-day diagnostic useful because it converts unknowns into an execution list instead of a longer discovery cycle."

---

## 4) Capability Demonstration — 10 minutes

### Objective
Show what AMC scoring actually reveals in a practical way.

## Demo framing
"I’m going to show you how the sprint works from evidence to decision in one pass. You’ll see three things: current score, ranked risks, and next-steps tied to owners and timeline."

## What AMC scoring reveals (core sections)
1. **Current-state signal score**
   - Domain-level maturity (Governance, Security, Reliability, Evaluation, Observability, Cost, Operating Model)
   - Why it matters: avoids arguing about opinions by using a structured scoring rubric.
2. **Evidence confidence score**
   - Coverage, freshness, and verification of artifacts
   - Why it matters: shows exactly where confidence is low.
3. **Critical-gap ranking**
   - Impact × effort × risk scoring; top gaps ranked by business consequence
   - Why it matters: immediate prioritization for leadership.
4. **Execution readiness map**
   - Who owns remediation, which systems must be touched, and quick-win sequencing.

## Live screen-share talking points

### A) Dashboard Open (1 min)
- Open workspace and show the current assessment shell.
- Point out domains and weighted scoring model.
- **Verbal line:** "Every score connects to a required artifact; no hidden criteria."

### B) Evidence panel walkthrough (2 min)
- Open one sample control and show artifact linkage.
- Highlight missing/weak evidence tags.
- **Verbal line:** "This shows where confidence is uncertain, so you can decide whether to tighten process or accept residual risk."

### C) Gap ranking table (2 min)
- Show top 3–5 issues.
- Compare impact vs effort colors.
- **Verbal line:** "This is the order to execute if you only have limited engineering cycles."

### D) 30/60/90 roadmap view (2 min)
- Show owners, dependencies, and milestone markers.
- **Verbal line:** "This is what leadership gets—an actionable sequence, not a backlog."

### E) Decision memo export (1 min)
- Open one-page memo template.
- Show sections: objective, findings, risks, first-win recommendations.
- **Verbal line:** "This is board-ready format for your approval flow."

### F) Verbal walkthrough alternative (if no screen share)
- Describe the same sequence in order with the client’s specific inputs: `score → confidence → gaps → roadmap → decision memo`.
- Ask: "Does that match how your exec team currently receives recommendations?"

## Discovery-to-demo bridge (30 sec)
"For your team specifically, the highest-impact output is likely the priority matrix because it connects technical debt and business outcomes directly."

---

## 5) Trial close + next step — 3 minutes

### Objective
Get explicit agreement on whether to proceed and lock the immediate next action.

**Trial close line:**
"Based on what you shared, this feels like an activation-first engagement rather than a long build: if we can get you a defensible score and an execution order in 5 days, does that solve your immediate decision need?"

**Then confirm commitment path:**
- "If yes, here’s the most practical next step: approve sprint scope and confirm 1) stakeholders list, 2) baseline KPI, 3) your engineering owner.
- "Can we target kickoff within 48 hours?"

**Decision alternatives:**
- **Go:** Signature path and kickoff date locked.
- **Need adjustment:** Narrow to highest-ROI workflow first.
- **Need internal review:** Send pre-filled one-page internal note for stakeholder sync.

**End-of-call confirmation script:**
1. "Decision target: [date]"
2. "Decision-maker(s): [names/roles]"
3. "Inputs due before kickoff: [items]"
4. "Kickoff slot: [date/time]"

**Close line:**
"If we align on this today, I can have proposal and onboarding checklist out in the next 1–2 hours."

---

## Appendix: optional 30-second alternate opener for warm referrals

"Thanks for taking this call—rather than discuss theory, I’ll assess your current operating risk in three passes: outcome clarity, evidence quality, and execution readiness. If the scoreline is strong, we can proceed immediately."
