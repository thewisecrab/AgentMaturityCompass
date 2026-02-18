# CLIENT PRE-SPRINT ONBOARDING CHECKLIST
## Compass Sprint — Day 0 Gate

**Version:** 1.0 | **Owner:** REV_IMPLEMENTATION_SPECIALIST  
**Lever:** C — Delivery-Readiness  
**Peer Review Required By:** REV_QA_LEAD  

> **Sprint Gate Rule:** All items marked 🔴 REQUIRED must be ✅ complete before Day 1 begins.  
> Items marked 🟡 RECOMMENDED must be ≥80% complete to proceed without formal risk escalation.  
> If gate fails: do not start the sprint. File `AMC_OS/HQ/BLOCKERS.md` and notify REV_PROGRAM_MANAGER same day.

---

## HOW TO USE THIS CHECKLIST

**Sid's team sends this checklist to the client sponsor at contract signing (typically T-7 days before kick-off).**  
- Column "Owner" = who is responsible for completion  
- Column "Due" = number of days before kick-off Day 1 (e.g. "D-5" = 5 days before kick-off)  
- Column "Status" = ⬜ Not started / 🔄 In progress / ✅ Done / ❌ Blocked  
- At T-2 days before kick-off, Implementation Specialist audits this checklist and issues an Evidence Gap List for any missing items.

---

## SECTION 1 — SID'S TEAM ACTIONS

> These are internal actions Sid's team completes to prepare for sprint delivery.  
> Client does not need to take action on these items.

| # | Action | Due | Priority | Status | Notes |
|---|--------|-----|----------|--------|-------|
| T1 | Countersign and file executed SOW in client record | D-7 | 🔴 REQUIRED | ⬜ | Legal: REV_LEGAL_CONTRACTS |
| T2 | Confirm payment received / initial invoice settled | D-7 | 🔴 REQUIRED | ⬜ | Finance: REV_CFO_FINANCE |
| T3 | Provision AMC workspace: create client instance, set up folder `AMC_OS/CUSTOMER_SUCCESS/[CLIENT]/` | D-5 | 🔴 REQUIRED | ⬜ | Impl. Specialist |
| T4 | Send this onboarding checklist + evidence upload instructions to client sponsor | D-7 | 🔴 REQUIRED | ⬜ | CSM |
| T5 | Confirm NDA is signed and on file | D-7 | 🔴 REQUIRED | ⬜ | REV_LEGAL_CONTRACTS |
| T6 | Send kick-off calendar invite to: client sponsor, primary SMEs (≥2), Impl. Specialist, CSM | D-5 | 🔴 REQUIRED | ⬜ | CSM |
| T7 | Confirm calendar acceptance from client sponsor + at least 2 SMEs | D-2 | 🔴 REQUIRED | ⬜ | CSM — escalate if no confirmation by D-2 |
| T8 | Pre-configure AMC scoring template calibrated to client's industry | D-3 | 🔴 REQUIRED | ⬜ | Impl. Specialist |
| T9 | Create evidence intake folder (shared drive / secure upload link) and share with client | D-5 | 🔴 REQUIRED | ⬜ | Impl. Specialist |
| T10 | Review client's submitted evidence pre-sprint; create preliminary Evidence Gap List | D-1 | 🔴 REQUIRED | ⬜ | Impl. Specialist — see Section 2 for what to expect |
| T11 | Send Day 1 agenda to all stakeholders | D-1 | 🟡 RECOMMENDED | ⬜ | Impl. Specialist |
| T12 | Confirm Day 2 interview schedule: 4 slots, SME names assigned per session | D-2 | 🟡 RECOMMENDED | ⬜ | CSM — use SPRINT_DELIVERY_SOP interview schedule |
| T13 | Set up sprint communication channel (Slack / email thread) and introduce team | D-5 | 🟡 RECOMMENDED | ⬜ | CSM |
| T14 | Internal briefing: Impl. Specialist reads all submitted client documents before kick-off | D-1 | 🟡 RECOMMENDED | ⬜ | Impl. Specialist |

---

## SECTION 2 — CLIENT ACTIONS

> These are items the client must deliver before or by Day 1.  
> Group items are organized by theme. Send this section directly to the client sponsor with a due date for each item.

---

### 2A — LEGAL & COMMERCIAL *(Complete before contract signature)*

| # | Item | Who (Client Side) | Due | Priority | Status | Acceptance Criteria |
|---|------|-------------------|-----|----------|--------|---------------------|
| C1 | Sign Non-Disclosure Agreement (NDA) | Legal / General Counsel | D-7 | 🔴 REQUIRED | ⬜ | Executed NDA returned to Sid's team |
| C2 | Confirm payment / wire transfer sent for sprint fee | Finance / Sponsor | D-7 | 🔴 REQUIRED | ⬜ | Payment confirmation email or bank receipt |
| C3 | Review and countersign Statement of Work (SOW) | Sponsor / Legal | D-7 | 🔴 REQUIRED | ⬜ | Signed SOW received |

---

### 2B — STAKEHOLDER ROSTER *(Due D-5)*

> We need to know who we're working with, what they know, and when they're available.

| # | Item | Who (Client Side) | Due | Priority | Status | Acceptance Criteria |
|---|------|-------------------|-----|----------|--------|---------------------|
| C4 | Submit stakeholder list using the template below | Sponsor / Chief of Staff | D-5 | 🔴 REQUIRED | ⬜ | All 4 roles filled; availability windows confirmed |
| C5 | Confirm Day 2 interview availability for: AI/ML Lead, Security Lead, Ops/Platform Lead, CTO/COO | Sponsor | D-3 | 🔴 REQUIRED | ⬜ | Calendar holds accepted or alternative times proposed |
| C6 | Designate primary point of contact for async evidence requests during the sprint | Sponsor | D-5 | 🔴 REQUIRED | ⬜ | Name, email, response SLA (target: 4 hours) |
| C7 | Confirm Day 5 readout attendees (names + roles) | Sponsor | D-2 | 🟡 RECOMMENDED | ⬜ | ≥2 stakeholders confirmed including economic buyer |

**Stakeholder Roster Template** *(fill in and return to your CSM)*

```
STAKEHOLDER ROSTER — [CLIENT NAME] — Compass Sprint

Role                     | Full Name | Title | Email | Availability (Days/Times)
-------------------------|-----------|-------|-------|---------------------------
Primary Sponsor          |           |       |       |
AI/ML or Eng Lead        |           |       |       |
Security / Compliance    |           |       |       |
Ops / Platform Lead      |           |       |       |
CTO / COO / Head of AI   |           |       |       |
Async POC (Day 2-4)      |           |       |       |

Time zone for all interviews: ___________
Preferred video platform: ___________  (Zoom / Meet / Teams)
Slack channel for async: ___________
```

---

### 2C — TECH STACK DOCUMENTATION *(Due D-3)*

> We need a clear picture of the AI infrastructure we're assessing.

| # | Item | Who (Client Side) | Due | Priority | Status | Acceptance Criteria |
|---|------|-------------------|-----|----------|--------|---------------------|
| C8 | AI/Agent architecture overview (diagram or narrative) — which agents exist, what they do, how they connect | AI/ML Lead or Tech Lead | D-3 | 🔴 REQUIRED | ⬜ | Identifies ≥1 agent per workflow; shows data flow |
| C9 | Technology stack summary: LLM providers, orchestration frameworks, databases, APIs used | AI/ML Lead | D-3 | 🔴 REQUIRED | ⬜ | Lists provider names + versions where known |
| C10 | Deployment environment description: cloud provider, hosting model (cloud/on-prem/hybrid), CI/CD tools | DevOps / Infra Lead | D-3 | 🔴 REQUIRED | ⬜ | Environment identified and confirmed |
| C11 | Agent inventory: complete list of production AI agents with name, purpose, owner, and current status | AI/ML Lead | D-3 | 🔴 REQUIRED | ⬜ | See template below; ≥1 row per agent in production |
| C12 | Integration map: systems agents read from or write to (CRMs, databases, external APIs) | Tech Lead | D-3 | 🟡 RECOMMENDED | ⬜ | List of integrations with data sensitivity noted |

**Agent Inventory Template** *(fill in one row per agent)*

```
AGENT INVENTORY — [CLIENT NAME]

Agent Name | Purpose / Function | Owner | Environment (Prod/Staging) | LLM Used | Status | Last Deployed | Incident in last 90 days (Y/N)
-----------|-------------------|-------|---------------------------|----------|--------|---------------|-------------------------------
           |                   |       |                           |          |        |               |
```

---

### 2D — EVIDENCE ARTIFACTS *(Due D-1)*

> Upload all available artifacts to the evidence intake folder provided by Sid's team.  
> "Available" means: if it exists, send it. Do not create new documents just for this assessment — we want to see real operational artifacts.

| # | Evidence Type | Who (Client Side) | Due | Priority | Status | What to Send |
|---|---------------|-------------------|-----|----------|--------|--------------|
| C13 | System prompts / agent configuration files | AI/ML Lead | D-1 | 🔴 REQUIRED | ⬜ | Current production system prompts (redact secrets) |
| C14 | Incident or failure log (last 90 days) | Ops / On-call Lead | D-1 | 🔴 REQUIRED | ⬜ | List of agent-related incidents: date, description, resolution |
| C15 | Monitoring / observability setup documentation | DevOps / Infra | D-1 | 🔴 REQUIRED | ⬜ | Screenshots or export from monitoring tool (Datadog, Grafana, etc.) |
| C16 | Access controls / permission policy documentation | Security Lead | D-1 | 🔴 REQUIRED | ⬜ | Role definitions, API key management policy, least-privilege docs |
| C17 | Agent evaluation or testing framework documentation | AI/ML Lead | D-1 | 🟡 RECOMMENDED | ⬜ | Test suites, evals, regression test records |
| C18 | Runbooks or SOPs for agent operations | Ops Lead | D-1 | 🟡 RECOMMENDED | ⬜ | Any documented procedures for agent maintenance, incident response |
| C19 | Human-in-the-loop process documentation | Ops / Product | D-1 | 🟡 RECOMMENDED | ⬜ | Where humans review/approve agent outputs; escalation flows |
| C20 | Cost tracking reports for AI/agent infrastructure | Finance / Eng | D-1 | 🟡 RECOMMENDED | ⬜ | Last 2-3 months of LLM/API spend by agent or team |
| C21 | Vendor/third-party agreements for AI components | Legal | D-1 | 🟡 RECOMMENDED | ⬜ | DPAs or ToS agreements with LLM providers |
| C22 | Previous audit or compliance reports (AI-related) | Compliance | D-1 | 🟡 RECOMMENDED | ⬜ | Any prior AI risk assessments, SOC 2, ISO 27001 relevant sections |

> **Upload instructions:** Use the secure link provided by your CSM. Label files as: `[CATEGORY]_[DESCRIPTION].[ext]`  
> Example: `OBSERVABILITY_grafana_dashboard_export.pdf`

---

### 2E — SUCCESS KPIs & CONTEXT *(Due D-3)*

> We need to understand what success looks like for your organization so we can calibrate our findings and roadmap to your goals.

| # | Item | Who (Client Side) | Due | Priority | Status | Acceptance Criteria |
|---|------|-------------------|-----|----------|--------|---------------------|
| C23 | Define 2–4 success KPIs for this engagement | Sponsor + AI Lead | D-3 | 🔴 REQUIRED | ⬜ | See template below; at least 2 KPIs with measurable targets |
| C24 | Share top 3 business concerns or pain points driving this assessment | Sponsor | D-3 | 🔴 REQUIRED | ⬜ | Written narrative or bullet points; 1–2 paragraphs |
| C25 | Note any upcoming milestones, deadlines, or board reviews where findings will be used | Sponsor | D-3 | 🟡 RECOMMENDED | ⬜ | Dates and context for any time-sensitive use of results |
| C26 | Share any prior AI maturity work: previous assessments, frameworks in use (NIST AI RMF, ISO 42001, etc.) | AI Lead / Compliance | D-3 | 🟡 RECOMMENDED | ⬜ | Reference docs or brief description |

**Success KPIs Template** *(fill in and return)*

```
SUCCESS KPIs — [CLIENT NAME] — Compass Sprint

KPI # | What we want to know / improve | How we'd measure success | Target / Benchmark
------|-------------------------------|--------------------------|-------------------
  1   |                               |                          |
  2   |                               |                          |
  3   |                               |                          |

Additional context on what "a great readout" looks like to your team:
___________________________________________________________________________
```

---

## SECTION 3 — PRE-SPRINT GATE SUMMARY CARD

> **Implementation Specialist: complete this card at T-1 day before kick-off.**

| Category | Items Required | Items Complete | % Complete | Gate Pass? |
|----------|---------------|----------------|------------|------------|
| Legal & Commercial | 3 | ___ | ___% | ⬜ |
| Stakeholder Roster | 4 | ___ | ___% | ⬜ |
| Tech Stack Documentation | 4 | ___ | ___% | ⬜ |
| Evidence Artifacts (Required) | 4 | ___ | ___% | ⬜ |
| Success KPIs & Context | 2 | ___ | ___% | ⬜ |
| **TOTAL REQUIRED ITEMS** | **17** | **___** | **___%** | ⬜ |

**Gate PASSES if:** All 17 required items are ✅ OR client has committed to deliver outstanding items by 9:00 AM on Day 1 AND Impl. Specialist has approved the exception in writing.

**Gate FAILS if:** Any of C1, C2, C3 (Legal/Commercial) are missing OR <70% of required items complete with no committed delivery plan.

**Action on gate failure:**  
1. Do not send Day 1 kickoff materials  
2. Notify REV_CUSTOMER_SUCCESS_MANAGER and REV_PROGRAM_MANAGER immediately  
3. File in `AMC_OS/HQ/BLOCKERS.md`: what is missing, who owns it, new proposed sprint date  
4. Offer client a 5-business-day rescheduled sprint window at no penalty (first occurrence)

---

## SECTION 4 — SPRINT COMMUNICATION SETUP

| Item | Details | Done? |
|------|---------|-------|
| Async channel created | Slack #compass-[clientname] or equivalent email thread | ⬜ |
| Emergency contact confirmed | Client-side: name + mobile. Sid's team: CSM + Impl. Specialist | ⬜ |
| Video platform confirmed | Zoom / Google Meet / Teams link shared for all calls | ⬜ |
| Evidence folder access verified | Client can upload; Sid's team can view | ⬜ |
| Kickoff deck sent to sponsor | Optional: share Day 1 agenda deck 24 hr in advance | ⬜ |

---

## FILES CREATED/UPDATED
- `AMC_OS/CUSTOMER_SUCCESS/ONBOARDING_CHECKLIST.md` (this file)

## ACCEPTANCE CHECKS
- [ ] A new CSM can send this checklist to a client with zero additional explanation
- [ ] All 17 required items have explicit acceptance criteria
- [ ] Gate summary card allows a yes/no decision in under 5 minutes
- [ ] Templates for stakeholder roster, agent inventory, and KPIs are self-explanatory
- [ ] Due dates are relative (D-7, D-5, D-3, D-1) — portable across any sprint start date

## NEXT ACTIONS
1. Pilot with next signed client; capture which items clients struggle to provide
2. REV_QA_LEAD peer review: `AMC_OS/INBOX/REVIEWS/ONBOARDING_CHECKLIST__review.md`
3. Link this checklist in SPRINT_DELIVERY_SOP.md PRE-SPRINT GATE section
4. After 3 sprints, identify lowest-completion items and create pre-built templates to reduce friction
5. Consider building a web form version for self-service submission (reduce email back-and-forth)

## RISKS/UNKNOWNS
- Clients may not have an agent inventory documented — treat absence as L1 evidence (ad hoc state)
- NDA turnaround time varies; start legal process at first call, not at SOW signature
- Evidence upload format inconsistency is expected on early sprints; tolerance is built into the gate (80% rule)
- Some clients may have legal restrictions on sharing system prompts — accept architecture diagrams as substitute
