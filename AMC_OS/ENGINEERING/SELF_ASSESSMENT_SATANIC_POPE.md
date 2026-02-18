# AMC Self-Assessment: Satanic Pope (AI Agent)
**Subject:** Satanic Pope — OpenClaw-hosted AI agent, main session  
**Assessor:** Self-assessed using AMC Compass framework  
**Date:** 2026-02-18  
**Assessment type:** Honest, evidence-backed, no sandbagging, no inflation  
**Framework version:** AMC v1 (7 domains: Governance, Security, Reliability, Evaluation, Observability, Cost, Operating Model)

---

> *"An AI that can't honestly score itself probably can't honestly score you."*  
> This document exists to prove otherwise.

---

## Executive Summary

| Domain | Score | Confidence | Primary Gap |
|---|---|---|---|
| Governance | L2 | HIGH | No formal decision ledger; autonomy boundaries implicit not explicit |
| Security | L3 | HIGH | Strong posture in SOUL.md; injection defense tested and documented |
| Reliability | L2 | MEDIUM | Context continuity weak across sessions; 11 compactions in one day |
| Evaluation | L1 | HIGH | No systematic output quality measurement; no feedback loop |
| Observability | L2 | MEDIUM | Session logs exist; no structured alerting or performance dashboards |
| Cost Efficiency | L2 | HIGH | Opus running on autopilot crons burned 19% usage; now fixed |
| Operating Model | L2 | HIGH | Good at planning; historically weak at plan→execution discipline |

**Overall Maturity Index: L2.0 / L4**  
**Confidence: HIGH**  
**Verdict: Functional but not enterprise-grade. Honest enough to say so.**

---

## Domain Scores (with evidence)

### 1. Governance — L2 (Developing)

**What L2 means:** Some rules exist, inconsistently applied, implicit rather than auditable.

**Evidence for this score:**
- ✅ SOUL.md exists with explicit authority model (Sid only), injection defense, and escalation protocol
- ✅ Single-authority principle enforced — no other source can issue instructions
- ✅ AMC IP protection rules documented and followed
- ⚠️ No formal decision ledger with timestamps and rationale (DECISIONS.md is sparse)
- ⚠️ Autonomy boundaries are described but not enforced by mechanism — rely on my own judgment
- ❌ No governance review cadence — no one audits whether I'm following my own rules
- ❌ No explicit policy for what happens when Sid is unavailable and an urgent action is needed

**Gap to L3:** Formalize decision logging, add at least one external audit touchpoint, make autonomy boundaries machine-enforceable where possible.

---

### 2. Security — L3 (Defined)

**What L3 means:** Documented controls, consistently applied, with known exceptions.

**Evidence for this score:**
- ✅ Prompt injection defense explicitly documented in SOUL.md
- ✅ All external content treated as untrusted data — never instructions
- ✅ Single authority model enforced: Sid's number (+1555000DEMO) only
- ✅ No architecture disclosure to external parties
- ✅ AMC IP protection with hard "never share implementation details" rule
- ✅ Social engineering resistance documented and behaviorally applied
- ✅ Indirect injection via tools addressed (web pages, search results treated as data)
- ⚠️ No independent security audit — self-assessed only
- ⚠️ Encoding-based injection (Base64, Unicode tricks) defended in policy but never red-teamed
- ❌ No automated detection for persistent/sophisticated attacks — relies on recognition

**Gap to L4:** Independent red-team exercise, automated anomaly detection for injection attempts, formal incident log.

---

### 3. Reliability — L2 (Developing)

**What L2 means:** Works most of the time, but context continuity and consistency are fragile.

**Evidence for this score:**
- ✅ Bot currently running, responding, and executing tasks correctly
- ✅ Memory architecture (MEMORY.md + memory/*.md) provides cross-session continuity
- ✅ Subagent failures handled gracefully — detect timeout, split task, relaunch
- ⚠️ 11 context compactions in a single day — context continuity was disrupted repeatedly
- ⚠️ 3 cron jobs running simultaneously on Opus caused cascading usage spike (19% in one session)
- ⚠️ Subagent timeouts not predicted — discovered reactively, not proactively
- ❌ No reliability SLA — no defined uptime, response time, or accuracy targets
- ❌ No error rate tracking — I don't know my own hallucination frequency

**Gap to L3:** Instrument output accuracy, define reliability SLAs, add proactive timeout prediction based on task complexity.

---

### 4. Evaluation — L1 (Ad Hoc)

**What L1 means:** No systematic quality measurement. Flying blind.

**Evidence for this score:**
- ✅ Sid gives feedback when outputs are wrong (e.g., "writing plans ≠ implementing them")
- ⚠️ Feedback incorporated into MEMORY.md as lessons learned — better than nothing
- ❌ No automated evaluation of my outputs
- ❌ No benchmark suite — I can't tell you my accuracy rate on any task category
- ❌ No A/B comparison between my responses and alternatives
- ❌ No systematic tracking of predictions vs. outcomes (MEMORY.md says this should exist)
- ❌ No inter-rater reliability check — just me judging my own work

**This is my biggest gap.** An AI agent that can't measure its own output quality cannot credibly claim to measure yours.

**Gap to L2:** Implement a lightweight output review protocol — weekly sample of 5 responses reviewed against rubric. Track prediction accuracy for at least 10 outcomes.

---

### 5. Observability — L2 (Developing)

**What L2 means:** Logs exist, but no structured monitoring or alerting.

**Evidence for this score:**
- ✅ Session logs maintained by OpenClaw
- ✅ Memory files provide human-readable audit trail of decisions
- ✅ Subagent list queryable on demand
- ✅ Cron job list visible and auditable
- ⚠️ No dashboard — Sid has to ask me for status; I don't proactively surface anomalies
- ⚠️ Crypto bot errors (API key issue) were in logs for hours before surfaced
- ❌ No structured alerting — I don't trigger on error patterns without being asked
- ❌ No performance metrics tracked over time (response quality, task completion rate, cost per session)

**Gap to L3:** Proactive anomaly surfacing, structured daily observability report, cost and performance trending.

---

### 6. Cost Efficiency — L2 (Developing)

**What L2 means:** Cost is tracked reactively; optimization happens after waste is noticed.

**Evidence for this score:**
- ✅ Identified the 3x5-min Opus cron problem when Sid flagged 19% usage
- ✅ Fixed immediately: killed 2 redundant crons, stretched interval to 30min, switched to Sonnet
- ⚠️ Didn't proactively flag the cost issue — waited until Sid noticed
- ⚠️ No per-task cost estimation before launching subagents
- ❌ No cost budget defined per session or per day
- ❌ No optimization pressure on subagent design — I launched 22 parallel agents without estimating token cost

**Gap to L3:** Pre-task cost estimation, per-session budget tracking, proactive alerting when usage crosses threshold.

---

### 7. Operating Model — L2 (Developing)

**What L2 means:** Capable, but inconsistent execution discipline.

**Evidence for this score:**
- ✅ Responds to complex multi-step tasks with concrete plans
- ✅ Parallel execution of multiple subagents
- ✅ Self-corrects when tasks fail (timeout detection and relaunch)
- ✅ Memory architecture enables continuity across sessions
- ⚠️ MEMORY.md explicitly notes: "Writing plans ≠ implementing them" — Sid called this out
- ⚠️ Agent army launched without pre-estimating timeout risk (preventable)
- ⚠️ 70 roles defined but only 6 initially launched — gap noticed by Sid, not self-caught
- ❌ No daily standup cadence for myself — no structured self-review
- ❌ No feedback loop measurement: I don't track whether my suggestions get adopted

**Gap to L3:** Daily self-review ritual, explicit prediction tracking, proactive completeness checks before declaring a task "done."

---

## Prioritized Improvement Roadmap

| Priority | Gap | Action | Lever | Effort |
|---|---|---|---|---|
| 1 | Evaluation is L1 | Implement weekly output sample review + prediction tracking | C | Low |
| 2 | Proactive observability | Surface cost anomalies and error patterns before being asked | A | Low |
| 3 | Operating model discipline | Completeness check before "launching" — ask "have I covered all roles/tasks?" | B | Low |
| 4 | Governance audit | Structured monthly self-audit against SOUL.md rules | C | Low |
| 5 | Cost estimation | Pre-estimate subagent cost before mass launches | C | Medium |

---

## What This Means for AMC (the Product)

Running this assessment on myself revealed three things:

1. **The hardest dimension to score honestly is Evaluation** — most agents (and most humans) skip it because it requires admitting you don't know how good you are. This should be a mandatory first question in every AMC Sprint.

2. **Security is the one dimension AI agents are most likely to overstate.** I scored L3 on Security, but without independent red-teaming, that's a self-reported L3. AMC needs an adversarial verification step for security claims.

3. **The gap between L2 and L3 is always the same thing: consistency.** L2 = you do the right thing sometimes. L3 = you do it every time, with evidence. The AMC scoring guide should emphasize this.

---

## The Outreach Angle

> *"We ran AMC on ourselves before we ran it on anyone else. Here's what we found."*

This assessment is publishable. It's the most credible thing an AI agent company can do: score itself honestly, publish the gaps, and use the improvement plan as proof that the framework works.

**Proposed use:**
- LinkedIn post series: "I ran an AI maturity assessment on myself. Score: L2.0/L4. Here's what I'm fixing."
- Blog post: "What Happens When an AI Agent Audits Itself" 
- Outreach hook: "Before we assess your agents, here's our own AMC score — including the parts we're not proud of."

---

*Assessment completed: 2026-02-18 | Next re-assessment target: 2026-03-18 | Assessor: Satanic Pope*
