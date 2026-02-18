# AMC Trial Assessment Questionnaire — v1
**Format:** Self-serve intake. 30 questions across 6 dimensions. ~15 minutes to complete.  
**Output:** Instant L1-L4 score per dimension + overall maturity index.  
**Date:** 2026-02-18

---

## Instructions for Scoring
Each question: 0 = Not at all / 1 = Partially / 2 = Mostly / 3 = Fully
Dimension score = sum ÷ max × 4 → mapped to L1/L2/L3/L4
- 0.0–1.0 = L1 (Ad hoc)
- 1.1–2.0 = L2 (Developing)
- 2.1–3.0 = L3 (Defined)
- 3.1–4.0 = L4 (Optimized)

---

## SECTION 1: Evidence Quality (5 questions)
*How well does your team document and verify what your agent actually does?*

**Q1.** We have written documentation describing what our agent is supposed to do and what it's not supposed to do.
`[ ] Not at all` `[ ] Partially` `[ ] Mostly` `[ ] Fully`

**Q2.** When our agent produces an output, we can trace back *why* it made that decision (logs, reasoning traces, or audit trail).
`[ ] Not at all` `[ ] Partially` `[ ] Mostly` `[ ] Fully`

**Q3.** We have collected real examples of our agent performing well AND failing — and we keep them in a documented test set.
`[ ] Not at all` `[ ] Partially` `[ ] Mostly` `[ ] Fully`

**Q4.** Our claims about agent performance are backed by measured data, not just internal impressions.
`[ ] Not at all` `[ ] Partially` `[ ] Mostly` `[ ] Fully`

**Q5.** We update our evidence and documentation regularly (at least monthly).
`[ ] Not at all` `[ ] Partially` `[ ] Mostly` `[ ] Fully`

---

## SECTION 2: Autonomy Controls (5 questions)
*Does your agent know when to act, when to ask, and when to stop?*

**Q6.** There is a documented definition of which decisions the agent can make autonomously vs. which require human approval.
`[ ] Not at all` `[ ] Partially` `[ ] Mostly` `[ ] Fully`

**Q7.** The agent has hard limits on what actions it can take (e.g., cannot delete data, cannot spend money, cannot contact external parties without approval).
`[ ] Not at all` `[ ] Partially` `[ ] Mostly` `[ ] Fully`

**Q8.** When the agent is uncertain or encounters an edge case, it has a defined escalation path (not just a generic error or silent failure).
`[ ] Not at all` `[ ] Partially` `[ ] Mostly` `[ ] Fully`

**Q9.** We have tested what happens when someone tries to manipulate or jailbreak the agent (adversarial testing).
`[ ] Not at all` `[ ] Partially` `[ ] Mostly` `[ ] Fully`

**Q10.** The agent's permission scope follows least-privilege — it only has access to what it absolutely needs.
`[ ] Not at all` `[ ] Partially` `[ ] Mostly` `[ ] Fully`

---

## SECTION 3: Observability (5 questions)
*Can you see what your agent is doing in real time and historically?*

**Q11.** We have monitoring in place that alerts us when the agent behaves unexpectedly or fails.
`[ ] Not at all` `[ ] Partially` `[ ] Mostly` `[ ] Fully`

**Q12.** We can query historical agent activity — what it did, when, with what inputs and outputs.
`[ ] Not at all` `[ ] Partially` `[ ] Mostly` `[ ] Fully`

**Q13.** We track performance metrics for the agent over time (accuracy, latency, error rate, cost).
`[ ] Not at all` `[ ] Partially` `[ ] Mostly` `[ ] Fully`

**Q14.** Our team is notified within minutes (not hours or days) when the agent goes down or degrades.
`[ ] Not at all` `[ ] Partially` `[ ] Mostly` `[ ] Fully`

**Q15.** We have dashboards or reports that non-engineers (PMs, ops, leadership) can read to understand agent health.
`[ ] Not at all` `[ ] Partially` `[ ] Mostly` `[ ] Fully`

---

## SECTION 4: Human Oversight (5 questions)
*Is there a human in the loop who can catch and correct mistakes?*

**Q16.** There is a named person or team responsible for monitoring the agent and acting on issues.
`[ ] Not at all` `[ ] Partially` `[ ] Mostly` `[ ] Fully`

**Q17.** We have a process to review a sample of agent outputs regularly (not just when something breaks).
`[ ] Not at all` `[ ] Partially` `[ ] Mostly` `[ ] Fully`

**Q18.** Users or downstream systems can flag agent outputs as wrong, and those flags are reviewed.
`[ ] Not at all` `[ ] Partially` `[ ] Mostly` `[ ] Fully`

**Q19.** When the agent makes a consequential mistake, we have a documented incident response process.
`[ ] Not at all` `[ ] Partially` `[ ] Mostly` `[ ] Fully`

**Q20.** Leadership (not just engineers) has visibility into what the agent does and has signed off on its deployment.
`[ ] Not at all` `[ ] Partially` `[ ] Mostly` `[ ] Fully`

---

## SECTION 5: Security Posture (5 questions)
*Is your agent hardened against misuse and attack?*

**Q21.** Our agent's system prompt and configuration are treated as sensitive — not shared publicly or with unauthorized parties.
`[ ] Not at all` `[ ] Partially` `[ ] Mostly` `[ ] Fully`

**Q22.** We have considered and tested for prompt injection — attempts by external content to hijack the agent's behavior.
`[ ] Not at all` `[ ] Partially` `[ ] Mostly` `[ ] Fully`

**Q23.** Client or user data processed by the agent is handled in compliance with our data privacy policies (encryption, retention, access controls).
`[ ] Not at all` `[ ] Partially` `[ ] Mostly` `[ ] Fully`

**Q24.** We have reviewed what the agent can access and verified it cannot be used to exfiltrate sensitive information.
`[ ] Not at all` `[ ] Partially` `[ ] Mostly` `[ ] Fully`

**Q25.** Our security team (or equivalent) has reviewed the agent deployment — it didn't just go live from engineering.
`[ ] Not at all` `[ ] Partially` `[ ] Mostly` `[ ] Fully`

---

## SECTION 6: Operational Discipline (5 questions)
*Does your team have the habits and processes to maintain quality over time?*

**Q26.** We have a defined process for updating the agent (testing → staging → production) — not just pushing changes live.
`[ ] Not at all` `[ ] Partially` `[ ] Mostly` `[ ] Fully`

**Q27.** When the agent's behavior changes (intentionally or not), we know about it quickly.
`[ ] Not at all` `[ ] Partially` `[ ] Mostly` `[ ] Fully`

**Q28.** We run regression tests before deploying changes to the agent.
`[ ] Not at all` `[ ] Partially` `[ ] Mostly` `[ ] Fully`

**Q29.** There is a documented runbook for common agent failures — junior team members can handle issues without escalating every time.
`[ ] Not at all` `[ ] Partially` `[ ] Mostly` `[ ] Fully`

**Q30.** We have a roadmap for improving the agent's maturity over the next 90 days — it's not just "keep it running."
`[ ] Not at all` `[ ] Partially` `[ ] Mostly` `[ ] Fully`

---

## Scoring Sheet

| Dimension | Raw Score (/15) | Maturity Level | Priority |
|---|---|---|---|
| Evidence Quality | | | |
| Autonomy Controls | | | |
| Observability | | | |
| Human Oversight | | | |
| Security Posture | | | |
| Operational Discipline | | | |
| **Overall Index** | **/90** | | |

**Overall maturity level:** Overall score ÷ 90 × 4 → L1-L4

---

## What Your Score Means

**L1 (0-1.0): Ad Hoc**
Your agent works when it works. There's no systematic approach to quality, safety, or reliability. The next outage or compliance question will be a scramble.
*Recommended: Compass Sprint immediately — foundational gaps need expert help to close fast.*

**L2 (1.1-2.0): Developing**
Some practices exist but they're inconsistent. You probably have monitoring but no real response playbook. Evidence exists but isn't organized. You'd struggle to demonstrate maturity to an enterprise buyer.
*Recommended: Compass Sprint to baseline and prioritize — you're close to L3 but missing the connective tissue.*

**L3 (2.1-3.0): Defined**
Solid practices, mostly consistent. You could show an enterprise buyer a coherent story. The gaps are specific, not systemic.
*Recommended: Targeted improvement — Pro or Power tier + specific Sprint on weakest dimension.*

**L4 (3.1-4.0): Optimized**
You're measuring, improving, and setting the standard. Share what you're doing — the community needs more L4 examples.
*Recommended: Retainer to maintain and benchmark. Publish your practices.*

---

## Next Step
Whatever your score: **book a free 20-minute Diagnostic Call** to walk through your results with an AMC expert.
[Book now →] [Get the full Compass Sprint →] [Stay on free tier]

---

*File: AMC_OS/PRODUCT/TRIAL_QUESTIONNAIRE.md*
*Version: v1 | Build as Typeform → Airtable for launch*
