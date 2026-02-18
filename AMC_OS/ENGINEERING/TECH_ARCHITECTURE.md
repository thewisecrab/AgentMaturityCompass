# AMC Platform Architecture — v1 MVP
**Version:** 1.0 | **Owner:** REV_TECH_LEAD  
**Lever:** C — Delivery-Readiness  
**Date:** 2026-02-18  
**Peer Review Required By:** REV_QA_LEAD

---

## Purpose

Enable the Compass Sprint to be delivered **digitally with consistent quality, evidence traceability, and repeatable outputs.**

This is a **services-first architecture** — not a SaaS product. Every choice optimizes for:
> "Can we deliver Sprint #1 this week?" — not "Can this scale to 10,000 customers?"

If a buyer asks "Can you actually build this?", the answer is: **Yes. Phase 0 is 3.5 days of setup. No custom code needed for the first sprint.**

---

## Architecture Philosophy

```
MANUAL FIRST → TOOL-ASSISTED → LIGHTLY AUTOMATED → PRODUCT

Phase 0: Google Workspace + Notion (can start Monday)
Phase 1: TypeScript CLI + template automation (weeks 2–4)
Phase 2: Web portal + client-facing UI (months 2–3)
Phase 3: SaaS / self-serve (future)
```

The MVP is **Phase 0 + early Phase 1.** Only build what removes a bottleneck in the actual sprint workflow.

---

## Component 1: Assessment Intake Form

### What It Does
Collects client context at sprint kickoff: company profile, AI initiative summary, tech stack, 7-dimension self-assessment (pre-scored by client), evidence pointers (Drive links), and primary stakeholder contacts. Replaces unstructured email intake.

### Recommended Stack

| Phase | Tool | Rationale |
|-------|------|-----------|
| Phase 0 (now) | **Tally.so** (free tier) | Zero code, Notion-native integration, conditional logic, file upload, professional UX |
| Phase 1 | Tally → webhooks → Supabase DB | Auto-stores responses; triggers evidence folder creation |
| Phase 2 | Custom Next.js intake form | Embedded in client portal, pre-fills from CRM |

### Build vs. Buy Decision
**BUY (Phase 0–1).** Intake forms are a commodity. Tally or Google Forms deliver 100% of needed functionality. Building a custom form is wasteful until Phase 2.

### Effort Estimate
| Phase | Effort | Who |
|-------|--------|-----|
| Phase 0: Build Tally form (20 questions, conditional logic) | **0.5 days** | Ops / Impl. Specialist |
| Phase 1: Add webhook → Supabase storage | **1 day** | Engineer |
| Phase 2: Custom form in portal | Included in portal estimate | Engineer |

### MVP Minimum
A Tally form with these sections:
1. Company basics (name, size, industry, primary AI use cases)
2. Tech stack inventory (models, infra, orchestration tools)
3. Self-assessment: 7 dimensions rated 1–4 (client's own view, pre-scoring calibration)
4. Evidence links (Google Drive folder URLs per dimension)
5. Stakeholder contacts (name, role, interview availability)
6. Sprint logistics (timezone, preferred comms, exec sponsor)

**Acceptance:** Form submissions auto-land in a Notion database OR Google Sheet. Consultant receives email notification. Zero manual copy-paste.

---

## Component 2: Scoring Engine

### What It Does
Takes control-level responses + evidence citations and calculates:
- Per-control score (L1–L4)
- Per-dimension weighted score (0–100)
- Overall AI Maturity Index (AMI, 0–100)
- Confidence percentage (verified controls / total controls)
- Top gaps ranked by impact × maturity deficit

### Recommended Stack

| Phase | Tool | Rationale |
|-------|------|-----------|
| Phase 0 (now) | **Google Sheet** (locked formula template) | Instant, no deployment, consultant-editable, formula-protected |
| Phase 1 | **TypeScript CLI** (`amc score`) | Reads JSON evidence manifest → outputs score JSON + markdown summary; testable, versionable |
| Phase 2 | REST API endpoint `/api/score` | Called by client portal to render live dashboard |

### Scoring Sheet Design (Phase 0)
```
Columns: Control_ID | Dimension | Control_Name | Evidence_IDs | Raw_Score (L1-L4) 
         | Score_Numeric | Weight | Weighted_Score | Confidence_Flag | Notes

Summary tab: Dimension scores (auto-calculated), AMI (weighted avg), 
             Confidence % per dimension, Gap priority matrix
```

### TypeScript CLI Design (Phase 1)
```typescript
// Input: evidence manifest (YAML/JSON)
// Output: score report (JSON + Markdown)

amc score --client acme-corp --evidence ./evidence/acme-corp.yaml --output ./reports/

// Schema:
interface EvidenceManifest {
  clientId: string;
  sprintDate: string;
  controls: ControlEntry[];
}

interface ControlEntry {
  controlId: string;
  dimension: AMCDimension;
  score: 1 | 2 | 3 | 4;
  evidenceIds: string[];
  interviewNotes?: string;
  confidenceFlag?: 'LOW' | 'MEDIUM' | 'HIGH';
}
```

### Build vs. Buy Decision
**BUILD (all phases).** Scoring logic is **core IP**. The rubric, weights, and gap prioritization are proprietary. No off-the-shelf tool scores AI maturity at this level of fidelity. Cannot buy. Must build.

### Effort Estimate
| Phase | Effort | Who |
|-------|--------|-----|
| Phase 0: Google Sheet template + scoring formulas | **1 day** | Impl. Specialist / Eng |
| Phase 1: TypeScript CLI (`amc score`) + unit tests | **3 days** | Engineer |
| Phase 2: REST API + frontend integration | **2 days** | Engineer |

**Total scoring engine build: 6 days across phases.**

---

## Component 3: Evidence Ledger

### What It Does
Tracks **what evidence was submitted, by whom, when, what format, and which controls it supports.** Enables full evidence-to-score traceability. This is the audit backbone of the Compass Sprint — every score must cite evidence.

### Recommended Stack

| Phase | Tool | Rationale |
|-------|------|-----------|
| Phase 0 (now) | **Google Drive** (per-client folder) + **Google Sheet manifest** | Zero setup cost; consultant-familiar; shareable with client |
| Phase 1 | GDrive + **YAML manifest** committed to git or stored in Supabase | Machine-readable; CLI can ingest it for scoring |
| Phase 2 | Supabase Storage + DB evidence table | Queryable, linked to client portal |

### Folder Structure (Phase 0)
```
Google Drive: /AMC/Clients/[CLIENT_NAME]/
├── 00_INTAKE/
│   └── intake_form_response.pdf
├── 01_EVIDENCE/
│   ├── DIM_OBSERVABILITY/
│   ├── DIM_RELIABILITY/
│   ├── DIM_SECURITY/
│   ├── DIM_EVALUATION/
│   ├── DIM_OPERATIONAL_DISCIPLINE/
│   ├── DIM_AUTONOMY_CONTROLS/
│   └── DIM_COST_GOVERNANCE/
├── 02_SCORING/
│   └── scoring_worksheet_v1.xlsx
├── 03_REPORTS/
│   └── readout_deck_final.pdf
└── 04_ARCHIVE/
```

### Evidence Manifest Schema (Phase 1 YAML)
```yaml
clientId: acme-corp
sprintDate: 2026-02-18
evidence:
  - id: EV-001
    fileName: monitoring_runbook_v2.pdf
    dimension: OBSERVABILITY
    controls: [OBS-1, OBS-3, OBS-5]
    submittedBy: jane.doe@acme.com
    submittedAt: 2026-02-16
    format: PDF
    qualityRating: HIGH   # LOW/MEDIUM/HIGH (consultant-assessed)
    storageUrl: gs://amc-evidence/acme-corp/EV-001.pdf
```

### Build vs. Buy Decision
**HYBRID.** Storage = BUY (GDrive or S3). Manifest schema = BUILD (lightweight, 0.5 days). The manifest format is what enables CLI scoring automation — worth the build investment.

### Effort Estimate
| Phase | Effort | Who |
|-------|--------|-----|
| Phase 0: Drive folder template + Sheet manifest | **0.5 days** | Ops / Eng |
| Phase 1: YAML manifest schema + CLI reader | **1 day** | Engineer |
| Phase 2: Supabase DB schema + upload UI | **2 days** | Engineer |

---

## Component 4: Report Generator

### What It Does
Produces three deliverables for the Day 5 readout:
1. **Readout Deck** (15–20 slides, PDF/PPTX)
2. **One-Page Maturity Summary** (executive PDF)
3. **90-Day Roadmap** (action table, PDF)

### Recommended Stack

| Phase | Tool | Rationale |
|-------|------|-----------|
| Phase 0 (now) | **Google Slides template** (manual data entry) | Professional output; no code; consultant can deliver Day 1 |
| Phase 1 | **Node.js + Google Slides API** (auto-populate from score JSON) | Eliminates manual copy errors; 15–20 min vs. 60 min per report |
| Phase 2 | HTML template → **Puppeteer PDF** (fully branded) | Full design control; no Google dependency |

### Google Slides Template Design (Phase 0)
```
Slide 01: Cover — [Client Name] | Compass Sprint | [Date]
Slide 02: Methodology overview (static)
Slide 03: Executive Summary — 3 bullets, overall AMI score
Slide 04: Maturity Score Dashboard (7 dimension radar chart)
Slide 05: Dimension Detail — Observability (score, top 2 findings)
Slide 06: Dimension Detail — Reliability
Slide 07: Dimension Detail — Security Posture
Slide 08: Dimension Detail — Evaluation
Slide 09: Dimension Detail — Operational Discipline
Slide 10: Dimension Detail — Autonomy Controls
Slide 11: Dimension Detail — Cost Governance
Slide 12: Top 3 Risks (root cause + business impact)
Slide 13: Top 3 Opportunities (score lift potential)
Slide 14: 90-Day Roadmap (phased action table)
Slide 15: Quick Wins (30-day, ICE-ranked)
Slide 16: Next Engagement Options
Slide 17: Thank You + Contacts
```
Cells containing dynamic data are highlighted in yellow → consultant replaces before readout.

### Phase 1 Auto-Population (Node.js + Slides API)
```
Input: score.json (from amc score CLI)
Process: 
  1. Duplicate master template → create client copy
  2. Replace {{AMI_SCORE}}, {{DIM_OBS_SCORE}}, etc. via Slides API
  3. Generate radar chart via Charts API
  4. Export PDF
Output: readout_deck_[CLIENT]_[DATE].pdf
```

### Build vs. Buy Decision
**Phase 0: BUY** (Google Workspace). **Phase 1: BUILD** (automation script). The template is worth building immediately — it ensures consistency and brand. The automation is Phase 1 (reduces per-sprint effort by ~45 min). Phase 2 custom HTML renderer when design differentiation matters.

### Effort Estimate
| Phase | Effort | Who |
|-------|--------|-----|
| Phase 0: Build master Slides template | **1.5 days** | Designer / Eng |
| Phase 1: Node.js Slides API auto-population | **4 days** | Engineer |
| Phase 2: HTML + Puppeteer PDF renderer | **5 days** | Engineer |

---

## Component 5: Client Portal (Basic)

### What It Does
Gives the client a **single URL** to access: sprint status, evidence submitted, maturity dashboard (live scores), roadmap, and downloadable deliverables. Eliminates email attachment chaos.

### Recommended Stack

| Phase | Tool | Rationale |
|-------|------|-----------|
| Phase 0 (now) | **Notion (shared page, per client)** | Zero code; instant setup; professional; client-familiar |
| Phase 1 | Notion OR **simple Next.js page** (read-only, link-protected) | Branded; can show auto-updated scores |
| Phase 2 | **Next.js + Supabase** (full auth, score dashboard, evidence tracker) | Full client portal; basis for SaaS upsell |

### Notion Client Workspace Template (Phase 0)
```
[CLIENT NAME] — AMC Compass Sprint
├── 📋 Sprint Overview (dates, contacts, status)
├── 📁 Evidence Submitted (linked from Drive + status: ✅/🔴)
├── 📊 Maturity Scores (table: dimension, score, status — updated Day 3)
├── 🗺️ 90-Day Roadmap (database view with owner, date, status)
├── 📄 Deliverables (links to readout deck, one-pager)
└── 💬 Q&A Log (async questions + answers)
```
Setup time: **30 minutes per client** using a Notion template.

### Phase 2 Web Portal Architecture
```
Stack: Next.js 14 (App Router) + TypeScript + Supabase (Postgres + Auth + Storage)
Hosting: Vercel (frontend, free tier sufficient for MVP)
Auth: Supabase Auth (magic link — no password needed for clients)
Data: Supabase Postgres (clients, assessments, controls, evidence, scores)
Files: Supabase Storage (evidence files, generated PDFs)

Pages:
  /login         — magic link auth
  /dashboard     — maturity score overview, sprint status
  /evidence      — evidence ledger (submitted, pending, quality)
  /roadmap       — interactive 90-day roadmap
  /reports       — downloadable PDF deliverables
  /admin/*       — internal: manage clients, scoring, notes (auth-gated)
```

### Build vs. Buy Decision
**Phase 0–1: BUY** (Notion). **Phase 2: BUILD** (Next.js + Supabase). Do not build the portal until after 3 sprints delivered successfully. Each sprint without a portal is a data point on whether clients actually need it.

### Effort Estimate
| Phase | Effort | Who |
|-------|--------|-----|
| Phase 0: Notion template per client | **0.5 days** | Ops |
| Phase 2: Full Next.js + Supabase portal | **15–20 days** | Engineer (1 FTE) |

---

## Architecture Summary Table

| Component | Phase 0 Stack | Phase 1 Stack | Build/Buy | Phase 0 Effort |
|-----------|--------------|---------------|-----------|----------------|
| Intake Form | Tally.so | Tally + webhook | BUY | 0.5 days |
| Scoring Engine | Google Sheets | TypeScript CLI | BUILD | 1 day |
| Evidence Ledger | GDrive + Sheet | GDrive + YAML manifest | HYBRID | 0.5 days |
| Report Generator | Google Slides template | Node.js + Slides API | BUILD | 1.5 days |
| Client Portal | Notion (shared) | Notion OR simple Next.js | BUY | 0.5 days |
| **TOTAL PHASE 0** | | | | **4 days** |

---

## Minimum to Deliver Sprint #1 Today

**3.5–4 days of setup. No custom code required.**

1. ✅ Build Tally intake form (20 questions) — **0.5 days**
2. ✅ Build Google Sheets scoring worksheet (7 dimensions, 40+ controls, formulas) — **1 day**
3. ✅ Set up Google Drive client folder structure — **0.5 days**
4. ✅ Build Google Slides readout deck template — **1.5 days**
5. ✅ Set up Notion client workspace template — **0.5 days**

**Then start Phase 1 while delivering Sprint #1:**
- TypeScript CLI scoring (`amc score`) — 3 days
- Slides API auto-population — 4 days
- Total Phase 1: **7 days** of engineering (can be parallel to first sprint delivery)

---

## Technology Risk Register

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| Google Slides API rate limits or breaking changes | Low | Medium | Cache template locally; fall back to manual entry |
| Supabase free tier limits exceeded early | Low | Low | Upgrade to $25/month Pro; still trivial cost |
| Notion page becomes unwieldy at scale | Medium | Low | Migrate to web portal at sprint #5 |
| Tally.so discontinues free tier | Low | Low | Google Forms as drop-in replacement |
| Phase 0 tooling feels unprofessional to large enterprise clients | Medium | Medium | Package Notion/Drive with branded templates + custom domain |

---

## Files Created/Updated
- `AMC_OS/ENGINEERING/TECH_ARCHITECTURE.md` (this file)

## Acceptance Checks
- [ ] A new consultant can read this and know exactly what tools to set up before Sprint #1
- [ ] Every component has a Phase 0 (immediate) and Phase 1 (2–4 weeks) path
- [ ] Build vs. buy is clearly decided with rationale for each component
- [ ] Total Phase 0 effort is <5 days (confirmed: ~4 days)
- [ ] No over-engineering — no Kubernetes, no microservices, no ML infra in MVP

## Next Actions
1. Set up Phase 0 tooling (Tally + Sheets + Drive + Slides + Notion) before first client kickoff
2. Engineer begins Phase 1 TypeScript CLI after Phase 0 is live
3. REV_QA_LEAD peer reviews this architecture before first sprint
4. Revisit portal build decision after 3 sprints (data over intuition)
5. Add architecture diagram (Mermaid) in Phase 1

## Risks/Unknowns
- **Assumption:** Google Workspace is already provisioned (AMC has GSuite)
- **Assumption:** Tally.so free tier is sufficient (500 submissions/month)
- **Unknown:** Client preference for evidence submission (Drive vs. email vs. portal upload) — confirm on Sprint #1 kickoff
- **Unknown:** Whether clients want portal access or are fine with email + Notion share links
