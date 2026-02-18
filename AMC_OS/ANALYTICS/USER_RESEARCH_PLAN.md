# USER RESEARCH PLAN — Discovery Call Guide
**Owner:** INNO_USER_RESEARCH_PLANNER  
**Date:** 2026-02-18  
**Version:** v1  
**Lever:** B — Conversion (discovery call quality is the single biggest lever in moving prospects from meeting → proposal → close)  
**Status:** Ready for use in sales discovery calls. Cross-reference VOC_PAIN_MAP.md to anchor questions to specific pain themes.

---

## Purpose

This guide equips AMC's sales team with a 5-question discovery framework that:
1. Surfaces the prospect's current AI agent maturity state (without leading)
2. Measures pain intensity and consequence in their own words
3. Reveals what they've already tried and why it failed
4. Exposes the decision-making structure and buying process
5. Anchors the conversation on what "good" looks like (so AMC's Sprint becomes the obvious path)

**Time allocation:** 35–40 min call total  
- 5 min: rapport + agenda setting  
- 25–30 min: 5 questions with follow-ups  
- 5 min: closing / next-step framing

**Cardinal rule:** Listen 80%, speak 20%. Every question is designed to get the prospect to describe their pain in their own words — which you will reflect back in the proposal.

---

## Pre-Call Prep (Required)

Before each call, complete this in 10 minutes:

| Item | Where to check |
|---|---|
| Company tech stack / AI signals | LinkedIn, job postings, GitHub (if public) |
| Likely ICP segment | ICP1 / ICP2 / ICP3 based on company type |
| Known trigger (if applicable) | Job posting for "AI reliability," "AI governance," new AI product launch, recent funding |
| One hypothesis about their pain | Pick the most likely pain from VOC_PAIN_MAP.md for their segment |
| One desired outcome for this call | Meeting booked / proposal requested / maturity gap surfaced |

---

## Question 1 — CURRENT STATE OF AGENT MATURITY
*Goal: Understand where they are without planting answers. Let them describe their reality.*

### Primary Question
> "Tell me about where your AI agents actually are today — not where you want them to be, but where they actually are. What's working in production, and what's still uncertain?"

**What you're listening for:**
- Do they distinguish between "shipped" and "production-mature"?
- Do they use language around reliability, trust, oversight, evidence? (If not, these are gaps)
- How much certainty do they have vs. how much they're assuming?

### Probing Follow-Ups
| If they say… | Ask… |
|---|---|
| "It's working great" | "What signals are you using to know that? How would you know if something subtly degraded?" |
| "We're still figuring it out" | "What specifically is still unresolved? Is it technical or more about process and visibility?" |
| "We have some evals running" | "Walk me through what you're measuring. How confident are you those evals catch real production failures?" |
| "It's in beta / early access" | "What has to be true before you'd call it production-ready? Do you have a shared definition of that?" |
| "We shipped fast and moved on" | "Has anything come back to bite you from that? What are you most nervous about that you haven't had time to address?" |

**Red flag to note:** If they cannot describe their agent's failure modes or maturity signal, they are pre-baseline — meaning the Compass Sprint is both urgent and highly relevant. Note this.

---

## Question 2 — PAIN INTENSITY & CONSEQUENCE
*Goal: Quantify the cost of the problem. Make the pain concrete and owned by them.*

### Primary Question
> "When your agent doesn't behave the way it should — whatever that means for you — what actually happens? Walk me through a recent example if you can, or describe what the worst-case scenario looks like."

**What you're listening for:**
- Can they name a specific incident? (Specificity = high pain intensity)
- What is the downstream consequence? (Client churn, deal loss, internal conflict, leadership loss of confidence)
- Who else feels this pain? (Signals buying authority and organizational urgency)

### Probing Follow-Ups
| If they say… | Ask… |
|---|---|
| "It's caused some client frustration" | "How did that get resolved? Did it cost you anything — time, contract risk, relationship equity?" |
| "Leadership is starting to ask questions" | "What exactly are they asking? And what do you say to them right now?" |
| "We had one big incident last quarter" | "What did that cost you to resolve — in eng hours, in client impact, in internal credibility?" |
| "It's more of a risk we're managing" | "What's the trigger that would make this a crisis rather than a managed risk? How close are you to that trigger?" |
| "It's frustrating but we're working around it" | "How much time is your team spending on workarounds vs. building new things? Is that sustainable?" |

**What to avoid:** Do not minimize their pain. Do not jump to your solution. Just let them quantify it in their own terms. If they can put a number (hours, dollars, client relationships), note it for the proposal.

---

## Question 3 — WHAT THEY'VE TRIED
*Goal: Understand the solution landscape they've explored and why those approaches failed.*

### Primary Question
> "Have you tried to address this — formally or informally? What have you already put in place to get visibility into your agent's maturity or quality, and what happened?"

**What you're listening for:**
- Have they tried DIY rubrics, checklists, CMMI-style frameworks, LLM eval tools?
- What specifically failed? (Time, expertise, adoption, sustainability, no clear output)
- Are they aware of formal AI maturity frameworks? Do they view them as useful?
- Is there a previous consultant or tool they tried and why it didn't work?

### Probing Follow-Ups
| If they say… | Ask… |
|---|---|
| "We built our own scoring system" | "Is it still in use? Who owns it? How often does it get updated? Does the whole team use it the same way?" |
| "We tried [LangSmith / eval tool / etc.]" | "Did that give you a maturity picture or just raw performance data? Were you able to act on it easily?" |
| "We talked to a consultant / agency" | "What did they deliver? Was it specific enough to act on, or more strategic/high-level?" |
| "We haven't really tried yet" | "What's held you back? Time, knowing where to start, team disagreement on approach?" |
| "We're using NIST / ISO frameworks" | "How well does that translate to your specific stack and use cases? Are you actually running it or is it more aspirational?" |

**Key insight to capture:** What's the pattern of failure in prior attempts? Most DIY attempts fail because of:
- No clear scoring methodology (subjective)
- No external benchmark to calibrate against
- No follow-through because the output isn't actionable
These are exact gaps AMC's Compass Sprint closes. Note which ones apply.

---

## Question 4 — DECISION-MAKING PROCESS
*Goal: Understand the buying committee, timeline, and what's required to get to yes.*

### Primary Question
> "If you decided this was a priority — that you wanted to get a clear, scored baseline on your agent maturity in the next 30 days — who else would need to be involved in that decision, and what would need to be true for it to move forward?"

**What you're listening for:**
- Who has authority to say yes? (Budget, scope, timeline)
- What's the internal process — formal procurement or informal approval?
- Is there an active timeline driver (product launch, board meeting, renewal, compliance review)?
- What objections are they pre-solving even as they answer? (Budget, timing, proof of value)

### Probing Follow-Ups
| If they say… | Ask… |
|---|---|
| "I'd need to check with my CTO / CEO" | "What would they need to see to say yes? Is this a conversation about ROI, risk reduction, or strategic fit?" |
| "We have a procurement process" | "What's the typical timeline? Is there a vendor approval step we should plan for?" |
| "Budget isn't allocated" | "Is this something that would come out of your team's discretionary budget or does it need a separate approval line?" |
| "We're planning for Q[X]" | "What's driving that timeline? Is there a specific event — product launch, board meeting — where this needs to be ready?" |
| "I could probably just approve this myself" | "Great. What would you want to see from us before making that call?" |

**Champion identification:** If the person on the call cannot approve, ask: "Who is the right person for me to also connect with, or would you prefer to take this forward and loop me in if it progresses?" Identify your internal champion explicitly.

---

## Question 5 — WHAT GOOD LOOKS LIKE
*Goal: Let them define the ideal outcome. Then position AMC's Sprint as the direct path to that outcome.*

### Primary Question
> "Fast-forward six months — your agent is performing the way you'd want it to. What does that look like? How do you know you've got there? What are you able to say or show that you can't today?"

**What you're listening for:**
- Are they describing reliability metrics? Trust from operators or clients? A roadmap they actually believe in? Evidence for leadership?
- Is their definition of "good" specific or vague? (Vague = they need help defining it first — which is what the Sprint does)
- Who benefits most when "good" is achieved? (Leadership, customers, the team itself — this is your ROI framing)

### Probing Follow-Ups
| If they say… | Ask… |
|---|---|
| "I'd know we're production-ready" | "How would you know? Is there a specific signal — metric, audit, client outcome — that would tell you that?" |
| "Leadership stops asking nervous questions" | "What would you need to be able to show them to make them feel confident? Is that a dashboard, a report, a live demo?" |
| "We'd have a roadmap we actually believe in" | "What's missing from your current roadmap that makes you not fully trust it?" |
| "We'd have the evidence to sell to enterprise" | "What does that evidence package look like in your mind? Who's the audience — procurement, CISO, the business buyer?" |
| "I'm not totally sure yet" | "That's actually the most common thing we hear. Not knowing exactly what good looks like is itself a signal that a baseline is the right starting point." |

**Closing bridge:** After Q5, summarize back what you heard in their language, then:
> "Based on what you've described, the Compass Sprint is exactly designed for this stage. In five business days, you'd have a scored baseline, a prioritized gap analysis, and a 30/60/90 roadmap that reflects your specific context — not a generic playbook. Would it make sense to show you exactly what the output looks like?"

---

## Post-Call Protocol

Immediately after the call (within 30 minutes):

1. **Complete the discovery summary:**

```
Prospect:
ICP Segment:
Pain themes surfaced (from VOC_PAIN_MAP IDs):
Pain intensity (1-5, your assessment):
Specifics / quotes captured:
Prior attempts mentioned:
Buying committee (name, role, authority):
Timeline driver:
What "good" looks like (their words):
Recommended next step:
Objections to prepare for:
```

2. File discovery summary in `AMC_OS/LEADS/` against the prospect record
3. Route to `REV_ACCOUNT_EXEC_CLOSER` for proposal drafting if pain is 4+ and buyer authority confirmed
4. Flag unresolved objections to `REV_OBJECTION_COACH` for pre-proposal rebuttal prep

---

## Research Guide Quality Checks

Before using this guide on a live call:

- [ ] Have you read the prospect's LinkedIn / company website in the last 24 hours? ✅
- [ ] Do you have a hypothesis about which VOC theme applies to them? ✅
- [ ] Are you prepared to stay silent for 10–15 seconds after each question? ✅
- [ ] Have you practiced reflecting back their words (not yours)? ✅
- [ ] Do you know who you're trying to identify as the champion? ✅

---

## Output Standard

**Files created/updated:** `AMC_OS/ANALYTICS/USER_RESEARCH_PLAN.md`

**Acceptance checks:**
- [ ] 5 questions present, each targeting a distinct discovery dimension ✅
- [ ] Each question has probing follow-ups for the most likely response branches ✅
- [ ] Post-call protocol included with capture template ✅
- [ ] Closing bridge language written and ready to use verbatim ✅
- [ ] Pre-call prep checklist present ✅
- [ ] Cross-reference to VOC_PAIN_MAP.md established ✅
- [ ] No guaranteed outcome language ✅

**Next actions:**
1. Run this guide on first 5 discovery calls and record which follow-ups generate the most insight
2. After 10 calls, identify which question produces the most high-value verbatim quotes for proposal use
3. Build segment-specific variants: ICP1 version (more technical depth), ICP2 version (stakeholder navigation emphasis), ICP3 version (agency differentiation angle)
4. Route post-call summaries to INNO_VOICE_OF_CUSTOMER_ANALYST for VOC_PAIN_MAP validation
5. v2 improvement target: if calls are converting at <50% to proposals, change Q2 follow-up depth to surface harder consequences

**Risks/unknowns:**
- Q4 (buying process) may feel premature in a first call — assess rapport before asking
- Q5 (what good looks like) may produce vague answers if prospect hasn't thought clearly about outcomes; use the "I'm not totally sure" follow-up as a bridge, not an ending
- Call length should be validated — 35–40 min may be too long for cold inbound calls vs. warm referrals
