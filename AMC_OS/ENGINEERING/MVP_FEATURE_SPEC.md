# AMC MVP Feature Specification
**Version:** 1.0 | **Owner:** REV_TECH_LEAD + REV_FULLSTACK_ENGINEER  
**Lever:** C — Delivery-Readiness  
**Date:** 2026-02-18  
**Peer Review Required By:** REV_QA_LEAD + REV_PRODUCT_MANAGER

---

## Purpose

Define the MVP feature set for the AMC digital platform. Features are bucketed into three priority tiers:
- **P0** — Must have before first paid Sprint delivery (no P0 = cannot deliver)
- **P1** — Significantly improves delivery quality or speed; build within 4 weeks of first sprint
- **P2** — Future value; defer until post-revenue validation

**Guiding constraint:** This is a services business delivering a 5-day Compass Sprint. The platform exists to make the sprint faster, more consistent, and more credible — not to be a product in its own right yet.

---

## P0 — Must Have for First Paid Delivery

These features enable a consultant to run a Compass Sprint. Without them, delivery is impossible or embarrassingly manual.

---

### P0-01: Client Evidence Intake Form

**User Story:**  
As an AMC Implementation Specialist, I need a structured form to collect client evidence pointers and tech stack details at sprint kickoff, so I don't waste time chasing missing information via unstructured email.

**Acceptance Criteria:**
- [ ] Form is accessible via a shareable link (no account required from client)
- [ ] Captures: company name, size, industry, primary AI use cases, tech stack inventory, self-assessment ratings for all 7 dimensions (1–4), Google Drive evidence links per dimension, and stakeholder contacts
- [ ] Conditional logic: if client rates a dimension < 2, surface a follow-up question for context
- [ ] Submissions are auto-stored in a Google Sheet or Notion database
- [ ] Consultant receives email notification on submission
- [ ] Response can be exported to PDF for sprint archive

**Estimated Effort:** 0.5 days  
**Owner:** Ops / Implementation Specialist  
**Tool:** Tally.so (no code)

---

### P0-02: Client Evidence Folder Structure

**User Story:**  
As an AMC Implementation Specialist, I need a consistent, organized evidence folder per client so I can quickly locate submitted artifacts during scoring and cite them in the report.

**Acceptance Criteria:**
- [ ] Template folder structure exists in Google Drive (7 dimension subfolders + intake, scoring, reports, archive)
- [ ] Can be duplicated for each new client in <5 minutes
- [ ] Folder is shared with client (view + upload permissions) at sprint kickoff
- [ ] Evidence gap list links directly to the relevant subfolder

**Estimated Effort:** 0.5 days  
**Owner:** Ops  
**Tool:** Google Drive (no code)

---

### P0-03: Scoring Worksheet (Control-Level)

**User Story:**  
As an AMC Implementation Specialist, I need a scoring worksheet where I can enter control-level scores (L1–L4) with evidence citations and automatically calculate dimension scores and the overall AI Maturity Index, so scoring is consistent and error-free.

**Acceptance Criteria:**
- [ ] Covers all 7 AMC dimensions and 40+ controls
- [ ] Each control row: Control_ID, Dimension, Control_Name, Evidence_IDs, Raw_Score (L1–L4), Weight, Weighted_Score, Confidence_Flag (auto-flagged if no evidence cited), Notes
- [ ] Dimension scores auto-calculate as weighted average of control scores
- [ ] AMI (AI Maturity Index) auto-calculates as weighted average of dimension scores
- [ ] Confidence percentage per dimension auto-calculates (verified controls / total controls)
- [ ] Gap priority matrix tab: ranks controls by impact × score deficit
- [ ] Scoring rubric definitions visible inline (tooltip or adjacent column)
- [ ] Formula cells are locked/protected from accidental edits
- [ ] Can be completed by a consultant in a single 5-hour scoring session (Day 3)

**Estimated Effort:** 1 day  
**Owner:** Engineer / Impl. Specialist  
**Tool:** Google Sheets (formulas, no code)

---

### P0-04: Readout Deck Template (Google Slides)

**User Story:**  
As an AMC Implementation Specialist, I need a professional, branded readout deck template that I can populate with client scores and deliver at the Day 5 readout, so every sprint produces a consistent, high-quality client-facing artifact.

**Acceptance Criteria:**
- [ ] 15–18 slides covering: cover, methodology, executive summary, 7-dimension dashboard (radar chart), per-dimension findings (2 slides), top 3 risks, top 3 opportunities, 90-day roadmap, quick wins, next engagement options
- [ ] Dynamic fields highlighted in yellow for easy data entry (15–20 fields total)
- [ ] Radar chart is editable (linked to a data table — consultant updates numbers, chart auto-updates)
- [ ] AMC brand-consistent (colors, fonts, logo)
- [ ] Exportable to PDF in one click
- [ ] Deck can be completed from a filled scoring worksheet in <90 minutes
- [ ] A non-designer consultant can produce a professional output without design skills

**Estimated Effort:** 1.5 days  
**Owner:** Designer / Engineer  
**Tool:** Google Slides

---

### P0-05: One-Page Maturity Summary Template

**User Story:**  
As an AMC Implementation Specialist, I need a one-page executive summary template so I can give decision-makers a quick-read artifact they can share internally without the full 18-slide deck.

**Acceptance Criteria:**
- [ ] Fits on one page (A4 landscape or letter portrait)
- [ ] Shows: overall AMI score, 7 dimension scores (bar or spider chart), top 3 risks, top 3 opportunities, one key recommendation
- [ ] Branded; exportable to PDF
- [ ] Can be completed in 20 minutes from the readout deck data

**Estimated Effort:** 0.5 days  
**Owner:** Designer  
**Tool:** Google Slides / Canva

---

### P0-06: Client Workspace (Notion)

**User Story:**  
As an AMC client stakeholder, I need a single, organized page to track sprint progress, see what evidence we've submitted, and access our deliverables, so I don't have to dig through email threads.

**Acceptance Criteria:**
- [ ] Notion template with sections: Sprint Overview (dates, contacts, status), Evidence Tracker (table: file name, dimension, status), Score Preview (updated post-Day 3), Roadmap (database), Deliverables (links)
- [ ] Can be duplicated and set up for a new client in <30 minutes
- [ ] Shared with client as read-only (no Notion account required via share link)
- [ ] Consultant can update scores and status without the client needing to do anything

**Estimated Effort:** 0.5 days  
**Owner:** Ops  
**Tool:** Notion

---

### P0-07: Evidence Gap Tracker

**User Story:**  
As an AMC Implementation Specialist, I need to track which evidence items are missing, who owns them, and when they're due, so I can follow up efficiently and avoid scoring gaps.

**Acceptance Criteria:**
- [ ] Simple table (can live in the Notion workspace or Google Sheet)
- [ ] Columns: Evidence Item, Dimension, Controls Affected, Owner (client contact), Due Date, Status (🔴 Missing / 🟡 In Review / ✅ Accepted), Notes
- [ ] Can be exported to a follow-up email in <5 minutes
- [ ] Status is visible to client in the Notion workspace

**Estimated Effort:** 0.25 days  
**Owner:** Ops  
**Tool:** Notion / Google Sheets

---

### P0-08: 90-Day Roadmap Template

**User Story:**  
As an AMC Implementation Specialist, I need a standardized roadmap template that I can populate from the gap analysis and present at the Day 5 readout, so every client gets a prioritized, actionable plan — not just a list of problems.

**Acceptance Criteria:**
- [ ] Action table: Action_ID, Description, Dimension, ICE_Score (Impact × Confidence / Effort), Phase (30/60/90 day), Suggested_Owner, Dependencies, Notes
- [ ] Sorted by ICE score descending
- [ ] 30/60/90-day Gantt or timeline view (simple table format is sufficient)
- [ ] Quick wins (≤30 days, ICE ≥10) callout section
- [ ] Exportable to PDF; shareable with client

**Estimated Effort:** 0.5 days  
**Owner:** Impl. Specialist  
**Tool:** Google Sheets / Notion

---

**P0 Total Estimated Effort: ~5 days** (can be done before Sprint #1; no code required)

---

## P1 — Nice to Have (Build Within 4 Weeks)

These features significantly improve delivery quality and consultant productivity. Build them after Sprint #1 is delivered and paid.

---

### P1-01: TypeScript Scoring CLI (`amc score`)

**User Story:**  
As an AMC engineer/consultant, I want to run a CLI command that reads a structured evidence manifest (YAML) and outputs a validated score JSON + markdown report, so scoring is automated, consistent, and testable.

**Acceptance Criteria:**
- [ ] `amc score --client <id> --evidence <path>` runs without error
- [ ] Validates evidence manifest schema (required fields, score range, evidence citation requirement)
- [ ] Outputs `score.json` (all control scores, dimension scores, AMI, confidence %)
- [ ] Outputs `score_summary.md` (human-readable table)
- [ ] Unit tests cover scoring formulas (≥90% coverage)
- [ ] CI passes on every commit

**Estimated Effort:** 3 days  
**Owner:** Engineer  
**Tool:** TypeScript, Node.js, Jest

---

### P1-02: Evidence Manifest Schema + Validator

**User Story:**  
As an AMC engineer, I want a documented YAML schema for the evidence manifest and a CLI validator, so consultants cannot submit malformed manifests to the scoring engine.

**Acceptance Criteria:**
- [ ] YAML schema documented in `docs/evidence-manifest-schema.yaml`
- [ ] `amc validate --evidence <path>` catches: missing required fields, invalid score values, controls with no evidence citation, dimensions with <50% coverage
- [ ] Validation errors are human-readable with specific fix instructions
- [ ] Schema is versioned (v1.0)

**Estimated Effort:** 1 day  
**Owner:** Engineer  
**Tool:** TypeScript, AJV (JSON Schema validation)

---

### P1-03: Automated Report Population (Google Slides API)

**User Story:**  
As an AMC Implementation Specialist, I want the readout deck to be auto-populated from the score JSON so I don't spend 60–90 minutes manually entering numbers and risk transcription errors.

**Acceptance Criteria:**
- [ ] Script reads `score.json` → duplicates master Slides template → populates all dynamic fields
- [ ] Radar chart data table auto-updated
- [ ] Output: Google Slides link + PDF download
- [ ] Reduces deck prep time from 90 min to <15 min per sprint
- [ ] Handles edge cases: missing dimension score → flag in output, not crash

**Estimated Effort:** 4 days  
**Owner:** Engineer  
**Tool:** Node.js, Google Slides API, googleapis npm package

---

### P1-04: Sprint Kickoff Package Generator

**User Story:**  
As an AMC Implementation Specialist, I want a script or template that generates all client-facing sprint kickoff materials in one step (agenda email, evidence request list, Notion workspace, Drive folder), so sprint setup takes 30 minutes, not 3 hours.

**Acceptance Criteria:**
- [ ] Input: client name, start date, stakeholder email list, sprint ID
- [ ] Outputs: pre-filled kickoff email draft, evidence request checklist (PDF), Drive folder created, Notion workspace duplicated and linked
- [ ] All outputs generated in <5 minutes of consultant time
- [ ] Works from a simple CLI command or a form trigger

**Estimated Effort:** 2 days  
**Owner:** Engineer  
**Tool:** TypeScript, Google Drive API, Notion API

---

### P1-05: Post-Sprint Debrief Tracker

**User Story:**  
As an AMC QA Lead, I want a structured debrief template that captures what went well, what went wrong, and what to improve after each sprint, so we continuously improve delivery quality.

**Acceptance Criteria:**
- [ ] Covers: sprint timeline adherence, evidence quality, scoring confidence, client satisfaction (1–10), debrief notes by day, one improvement action for next sprint
- [ ] Linked to SPRINT_DELIVERY_SOP.md improvements
- [ ] Filed within 24 hours of readout
- [ ] Aggregated across sprints to surface patterns

**Estimated Effort:** 0.5 days  
**Owner:** Ops / QA Lead  
**Tool:** Google Forms or Notion

---

### P1-06: Internal Sprint Dashboard

**User Story:**  
As an AMC Program Manager, I want a dashboard showing all active sprints, their current day/status, outstanding evidence gaps, and upcoming readouts, so I can manage multiple sprints without asking consultants for status.

**Acceptance Criteria:**
- [ ] Shows: Sprint ID, Client, Day (1–5), Status (🟢 On Track / 🟡 At Risk / 🔴 Blocked), Evidence Gap Count, Readout Date
- [ ] Updated by consultant at end of each sprint day (manual update acceptable in P1)
- [ ] Accessible internally (not client-facing)
- [ ] Can manage up to 5 concurrent sprints

**Estimated Effort:** 1 day  
**Owner:** Ops / Engineer  
**Tool:** Notion (database view) or Airtable

---

**P1 Total Estimated Effort: ~11.5 days** (parallel to sprint delivery operations)

---

## P2 — Later (Post-Revenue Validation)

Build these after $25k+ in collected revenue and 5+ sprints delivered. These are product investments, not services investments.

---

### P2-01: Web-Based Client Portal

**User Story:**  
As an AMC client stakeholder, I want a branded web portal where I can log in, view my maturity scores in real-time, track evidence status, download reports, and see my roadmap progress.

**Acceptance Criteria:**
- [ ] Magic-link auth (no password required)
- [ ] Live maturity score dashboard (7-dimension radar + trend over time)
- [ ] Evidence ledger (submitted, pending, quality rating)
- [ ] Interactive 90-day roadmap (can mark items complete)
- [ ] PDF report downloads
- [ ] Mobile-responsive

**Estimated Effort:** 15–20 days  
**Owner:** Fullstack Engineer  
**Tool:** Next.js + Supabase

---

### P2-02: Self-Serve Assessment Intake

**User Story:**  
As a prospective AMC client, I want to complete a self-assessment online and receive a free preliminary maturity score, so I can experience the AMC methodology before committing to a paid sprint.

**Acceptance Criteria:**
- [ ] 30-question self-assessment (subset of full Compass Sprint)
- [ ] Instant preliminary AMI score on completion
- [ ] Gated: full report requires email; triggers sales follow-up sequence
- [ ] Conversion tracking: self-assessment → meeting booked rate

**Estimated Effort:** 10 days  
**Owner:** Fullstack Engineer  
**Tool:** Next.js + Supabase + email automation

---

### P2-03: Benchmark Database

**User Story:**  
As an AMC client, I want to see how my maturity scores compare to industry peers, so I can contextualize my gaps and justify investment to my board.

**Acceptance Criteria:**
- [ ] Anonymized aggregate scores by industry, company size, AI maturity stage
- [ ] Client report shows percentile ranking per dimension
- [ ] Minimum 10 clients in database before benchmarks are surfaced (statistical validity)
- [ ] Benchmark data used in sales materials

**Estimated Effort:** 5 days (data model + anonymization logic + UI)  
**Owner:** Data Engineer + Fullstack Engineer

---

### P2-04: Retainer Monitoring Dashboard

**User Story:**  
As an AMC client on a retainer, I want to see my maturity score trend over time (quarterly re-assessments) so I can demonstrate ROI of the engagement to my leadership.

**Acceptance Criteria:**
- [ ] Score trend chart (AMI over time, per dimension)
- [ ] Delta from previous assessment highlighted
- [ ] Roadmap completion rate (actions completed vs. planned)
- [ ] Exportable "progress report" PDF

**Estimated Effort:** 5 days  
**Owner:** Fullstack Engineer

---

### P2-05: Automated Evidence Quality Scorer

**User Story:**  
As an AMC Implementation Specialist, I want AI-assisted evidence quality assessment that reads submitted documents and suggests a quality rating (LOW/MEDIUM/HIGH), so I can process evidence 50% faster.

**Acceptance Criteria:**
- [ ] Reads PDF/DOCX evidence files
- [ ] Suggests quality rating with reasoning
- [ ] Consultant can accept, reject, or override suggestion
- [ ] Reduces evidence review time per sprint from 3 hours to <1.5 hours

**Estimated Effort:** 10 days  
**Owner:** Engineer + AI/ML  
**Tool:** LLM API (Claude/GPT-4) + document parsing

---

**P2 Total Estimated Effort: ~45 days** (post-revenue; prioritize after 5+ sprints)

---

## Feature Priority Matrix Summary

| ID | Feature | Priority | Effort | Dependency |
|----|---------|----------|--------|------------|
| P0-01 | Evidence Intake Form | P0 | 0.5d | None |
| P0-02 | Client Evidence Folder | P0 | 0.5d | None |
| P0-03 | Scoring Worksheet | P0 | 1d | None |
| P0-04 | Readout Deck Template | P0 | 1.5d | None |
| P0-05 | One-Page Summary Template | P0 | 0.5d | P0-04 |
| P0-06 | Client Workspace (Notion) | P0 | 0.5d | None |
| P0-07 | Evidence Gap Tracker | P0 | 0.25d | P0-02 |
| P0-08 | 90-Day Roadmap Template | P0 | 0.5d | P0-03 |
| P1-01 | TypeScript Scoring CLI | P1 | 3d | P0-03 |
| P1-02 | Evidence Manifest Schema | P1 | 1d | P1-01 |
| P1-03 | Auto Report Population | P1 | 4d | P1-01, P0-04 |
| P1-04 | Sprint Kickoff Generator | P1 | 2d | P0-01, P0-02, P0-06 |
| P1-05 | Post-Sprint Debrief | P1 | 0.5d | None |
| P1-06 | Internal Sprint Dashboard | P1 | 1d | None |
| P2-01 | Web Client Portal | P2 | 15–20d | P1-01, P1-03 |
| P2-02 | Self-Serve Assessment | P2 | 10d | P2-01 |
| P2-03 | Benchmark Database | P2 | 5d | 10+ clients |
| P2-04 | Retainer Monitoring | P2 | 5d | P2-01 |
| P2-05 | AI Evidence Scorer | P2 | 10d | P1-02 |

---

## Files Created/Updated
- `AMC_OS/ENGINEERING/MVP_FEATURE_SPEC.md` (this file)

## Acceptance Checks
- [ ] Every P0 feature can be built without a single line of custom code
- [ ] P0 total effort ≤5 days (confirmed: ~5 days)
- [ ] Every feature has a user story, acceptance criteria, and effort estimate
- [ ] Priority tiers are clearly justified (P0 = sprint delivery blocker)
- [ ] P2 features are explicitly deferred to post-revenue

## Next Actions
1. Begin P0 build immediately — assign to Ops / Impl. Specialist (4–5 days)
2. Assign P1-01 and P1-03 to Engineer after first sprint kickoff
3. REV_PRODUCT_MANAGER reviews P1/P2 list for priority adjustments
4. After Sprint #1: capture what was actually hard → re-prioritize P1 list accordingly
5. Track feature usage per sprint to validate which P2 features are worth building

## Risks/Unknowns
- **Risk:** Scoring worksheet complexity may be underestimated — controls count TBC (assumed 40+)
- **Risk:** Google Slides API has a steep authentication setup curve — budget extra day for P1-03
- **Unknown:** Whether clients prefer Notion or a more formal portal — validate on Sprint #1
- **Assumption:** AMC scoring rubric (L1–L4 definitions per control) already exists or is being built concurrently
