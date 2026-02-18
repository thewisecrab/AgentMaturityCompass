# AMC Consultant Interview Scoring Guide (v1)

Purpose: This guide helps score a client team quickly during interviews. Use it as a practical conversation tool, not a theory document.

## How to use
- Pick the level (L1–L4) that best matches what the client is *actually doing now*.
- Use real evidence from the interview and documents.
- If a team mixes levels, score by the strongest evidence for most workflows, but note gaps.

---

## 1) Evidence Quality

**What it measures (1 sentence):**
How well the team uses real data and documents to prove what is happening, instead of relying on opinion or guesswork.

### L1 – Ad hoc
The team mostly runs on memory and opinions. They may have some logs, but nothing organized, and past decisions are hard to justify.

### L2 – Developing
Some reports, dashboards, or templates are used regularly, but they are incomplete, inconsistent, or often out-of-date. Teams still argue based on assumptions.

### L3 – Defined
Core metrics and artifacts are defined, collected, and shared for all key processes. Decisions are reviewed against these artifacts in regular meetings.

### L4 – Optimized
Decision-making is consistently evidence-first: every major decision has clear, up-to-date proof, plus root-cause notes when outcomes differ from plans.

### Three interview questions
1. "Show me the last 3 decisions that depended on data, not just opinions. What changed because of the data?"
2. "What reports or documents do you use every week to check if work is on track?"
3. "Who can quickly show proof of how a recent problem happened and how it was fixed?"

### Evidence that proves each level
- **L1 evidence:** vague statements like “we know this usually works,” missing dashboards, little to no post-incident notes.
- **L2 evidence:** partial scorecards, manually updated spreadsheets, inconsistent meeting notes, missing data sources.
- **L3 evidence:** standard report cadence, decision log, documented hypotheses and outcomes, agreed metric definitions.
- **L4 evidence:** automated evidence collection, clear audit trail, documented learning loops, leadership referencing evidence in planning/reviews.

---

## 2) Autonomy Controls

**What it measures (1 sentence):**
How safely the team can give people freedom to act without creating chaos or bypassing key checks.

### L1 – Ad hoc
People act independently with minimal guardrails; changes are often made by whoever is available, and results vary by person.

### L2 – Developing
Basic rules exist (who approves what, basic templates, naming rules), but enforcement is manual and sometimes skipped.

### L3 – Defined
Clear ownership and approval boundaries are in place, with repeatable controls embedded in workflows so most teams follow them by default.

### L4 – Optimized
Autonomy is enabled at scale through role-based boundaries, policy checks, and automatic enforcement with periodic reviews for exceptions.

### Three interview questions
1. "Who is allowed to approve a change, and where is that written down?"
2. "Tell me the last time someone bypassed a process—what happened and why?"
3. "If a new team member joins, how quickly can they operate correctly without asking for permission every step?"

### Evidence that proves each level
- **L1 evidence:** no RACI, no clear approval matrix, duplicate/conflicting requests, frequent “just do it” changes.
- **L2 evidence:** written but uneven rules, approvals done in chat/email, exceptions accepted frequently.
- **L3 evidence:** ownership matrix used in handoffs, standardized playbooks, approvals tracked in tool workflow.
- **L4 evidence:** policy enforcement in tooling, least-privilege access, delegated permissions with automated exception alerts, quarterly control reviews.

---

## 3) Observability

**What it measures (1 sentence):**
How clearly the team can see current performance, failures, and bottlenecks across their operations.

### L1 – Ad hoc
Visibility is low and delayed; issues are discovered only when customers complain or when things fully break.

### L2 – Developing
Some monitoring exists for key systems/processes, but coverage is patchy and alerts are noisy or not prioritized.

### L3 – Defined
Core services/processes are monitored with dashboards, alerts, and clear ownership for response and follow-up.

### L4 – Optimized
Cross-team visibility is easy, near real-time, and tied to action playbooks so teams can predict and prevent issues quickly.

### Three interview questions
1. "What is the first sign you notice when something is going wrong?"
2. "Who gets alerted first, and how is response priority set?"
3. "Show me one incident from last month: how it was detected, assigned, and resolved."

### Evidence that proves each level
- **L1 evidence:** no shared dashboard, no alerts, manual status checks, vague response times.
- **L2 evidence:** partial health checks, manual dashboards, delayed incident response, repeated false alarms.
- **L3 evidence:** defined SLAs/SLOs, ownership by function, incident queue with timeline, post-incident summary.
- **L4 evidence:** end-to-end tracing/alerts by business impact, integrated runbooks, automated escalation, trend analysis used in planning.

---

## 4) Human Oversight

**What it measures (1 sentence):**
How clearly and consistently humans review automated actions, decisions, and exceptions before they cause major impact.

### L1 – Ad hoc
Automation or decisions happen with little or no review; people only notice when a critical issue has already occurred.

### L2 – Developing
Periodic manual reviews are happening, but they are reactive and not tied to all high-risk actions.

### L3 – Defined
Review points are built into workflows for important tasks; high-risk actions require human sign-off or clear confirmation.

### L4 – Optimized
Humans review patterns and exceptions strategically, with quality checks that improve continuously and reduce repeat risk.

### Three interview questions
1. "Which actions are allowed to run automatically, and who still reviews their outcomes?"
2. "Describe your escalation path when an automated workflow goes wrong."
3. "How do you handle high-risk exceptions differently from routine changes?"

### Evidence that proves each level
- **L1 evidence:** no explicit review cadence, no exception log, ownership unclear.
- **L2 evidence:** monthly or ad-hoc checks, undocumented escalation criteria, weak sign-off discipline.
- **L3 evidence:** mandatory checkpoints, review templates, exception tagging and closure criteria, role-based approvers.
- **L4 evidence:** quality scores for reviews, periodic sample audits, automated pre-checks + human final validation for critical steps.

---

## 5) Security Posture

**What it measures (1 sentence):**
How well the team protects systems, data, and client trust without blocking legitimate delivery work.

### L1 – Ad hoc
Security is mostly reactive; risky access and secrets handling are unmanaged and checks are inconsistent.

### L2 – Developing
Basic controls are in place (password rules, some access reviews, basic backups), but patching and incident response are inconsistent.

### L3 – Defined
Security is part of delivery standards: access control, vulnerability handling, backup/recovery, and incident response are documented and practiced.

### L4 – Optimized
Security is built into everyday process with continuous monitoring, regular tests, and rapid, measured response to threats.

### Three interview questions
1. "Who can access what, and how often is that reviewed?"
2. "Walk me through your last security incident and what changed after it."
3. "How do you manage secrets, credentials, and client data across teams/environments?"

### Evidence that proves each level
- **L1 evidence:** shared credentials, outdated access lists, no formal incident log, ad-hoc backups.
- **L2 evidence:** basic MFA/passphrase policies, occasional patching, non-random security checks.
- **L3 evidence:** documented access control and secrets rotation, tested backups, regular patch/testing schedules, clear incident playbook.
- **L4 evidence:** zero-trust aligned practices, periodic security drills, threat/vuln trend tracking, strict separation of duties, audit-ready records.

---

## 6) Operational Discipline

**What it measures (1 sentence):**
How consistently the team follows and improves standard operating routines under normal and high-pressure conditions.

### L1 – Ad hoc
Work is reactive and depends on individual heroics; schedules and handoffs are not reliable.

### L2 – Developing
Basic processes exist but are frequently bypassed under pressure, causing variation in output quality.

### L3 – Defined
Operational processes are documented, taught, and used most of the time; there is visible follow-through on action items and deadlines.

### L4 – Optimized
Processes are optimized continuously with clear ownership, automation where useful, and measurable quality outcomes.

### Three interview questions
1. "How are daily handoffs done, and what gets missed most often?"
2. "How do you measure whether work was done to standard, not just on time?"
3. "What is your method for fixing process gaps after repeated mistakes?"

### Evidence that proves each level
- **L1 evidence:** missing SOPs, no cadence, high variance in task quality, repeated rework with no follow-up.
- **L2 evidence:** SOPs exist but are unevenly followed; checklists started then abandoned; KPIs tracked only partially.
- **L3 evidence:** runbooks in use, routine standups, explicit owners, issue closure rates tracked, recurring issues reduced over time.
- **L4 evidence:** routine retrospectives with concrete process improvements, automation of repetitive tasks, clear performance thresholds, preventive action tracking.

---

## Scoring guidance
- **Score 1-4 per dimension** using the highest matching level.
- **Total score range:** 6–24
  - 6–11: Early foundation (focus on basics)
  - 12–17: Stabilizing (reduce inconsistency)
  - 18–24: Mature (scale safely)

---

## Notes for interviewers
- Keep language simple and real. Avoid scoring based on claims alone.
- Ask for artifacts in the interview (screenshots, workflows, dashboards, postmortems, playbooks, access lists).
- If a team says “we have it all,” request one concrete example before accepting.
- The best level is not perfect compliance—it is consistent proof across real work.
