# KNOWLEDGE BASE STRUCTURE — AMC Operations
**Owner:** REV_KB_MANAGER  
**Version:** v1.0 | **Date:** 2026-02-18  
**Lever:** C — Delivery-Readiness | B — Conversion  
**Status:** Draft — peer review requested from REV_QA_LEAD

---

## Purpose
Define the canonical structure for the AMC knowledge base — covering all categories needed for consistent sales execution, repeatable delivery, and client-facing credibility. Each category includes owner role, update cadence, format standard, and access level.

---

## KB Design Principles
1. **Single source of truth** — one authoritative doc per topic; no forks without version tagging
2. **Findable in ≤60 seconds** — clear folder structure, consistent naming, and a master index
3. **Living documents** — every doc has an owner and explicit update cadence
4. **Client-ready by default** — internal docs flagged clearly; client-facing docs held to a higher polish standard
5. **Version-controlled** — major revisions bump version number; changelog appended at doc footer

---

## KB Master Index Location
`AMC_OS/KB/INDEX.md` — single-page directory of all KB categories, doc titles, owners, and last-updated dates.

---

## Category 1 — AMC Methodology
**Purpose:** Explain the AMC framework, scoring model, 7 maturity dimensions, and philosophy to internal staff and clients.

| Attribute | Value |
|-----------|-------|
| **Owner role** | REV_PRODUCT_MANAGER |
| **Update frequency** | Monthly (or when scoring model changes) |
| **Format standard** | Markdown (.md) with headers, tables, and diagrams (Mermaid or image links) |
| **Access level** | 🔓 Client-facing (public versions); 🔒 Internal (scoring calibration notes) |
| **Sub-documents** | |

| Doc Name | Description | Access |
|----------|-------------|--------|
| `AMC_FRAMEWORK_OVERVIEW.md` | What AMC is, why it matters, 7-dimension model | Client-facing |
| `SCORING_MODEL_v{N}.md` | Detailed rubric: L1–L4 per control per dimension | Internal |
| `EVIDENCE_SCHEMA.md` | Required/optional artifact fields, confidence rubric | Internal |
| `METHODOLOGY_FAQ.md` | Common questions about scoring philosophy | Client-facing |
| `DIMENSION_GLOSSARY.md` | Definitions of all 7 maturity dimensions + sub-controls | Client-facing |

---

## Category 2 — Scoring Guides
**Purpose:** Give assessors the exact rubric to score each control consistently across different client contexts.

| Attribute | Value |
|-----------|-------|
| **Owner role** | REV_QA_LEAD (primary) + REV_PRODUCT_MANAGER (model authority) |
| **Update frequency** | After every 3 client sprints (calibration cycle) or when a scoring edge case is encountered |
| **Format standard** | Markdown with structured tables: Control | L1 | L2 | L3 | L4 | Evidence Examples |
| **Access level** | 🔒 Internal only |
| **Sub-documents** | |

| Doc Name | Description | Access |
|----------|-------------|--------|
| `PACT_DO_SCORING_GUIDE.md` | Full control-level rubric (exists at SALES/PACT_DO_SCORING_GUIDE.md) | Internal |
| `SCORING_CALIBRATION_LOG.md` | Record of calibration decisions + rationale by sprint | Internal |
| `EDGE_CASE_LIBRARY.md` | Ambiguous scoring situations + agreed resolutions | Internal |
| `QUICK_SCORING_REFERENCE.md` | One-page cheat sheet for assessors (laminated equivalent) | Internal |

---

## Category 3 — Delivery SOPs
**Purpose:** Give Implementation Specialists and CSMs a complete, step-by-step guide to execute every phase of a Compass Sprint.

| Attribute | Value |
|-----------|-------|
| **Owner role** | REV_IMPLEMENTATION_SPECIALIST (primary) + REV_QA_LEAD (reviewer) |
| **Update frequency** | After every sprint (debrief learnings integrated within 10 days) |
| **Format standard** | Markdown with: day-by-day tables, owner/time-estimate/output columns, acceptance gates, risk flags |
| **Access level** | 🔒 Internal only |
| **Sub-documents** | |

| Doc Name | Description | Access |
|----------|-------------|--------|
| `SPRINT_DELIVERY_SOP.md` | 5-day Compass Sprint SOP (exists at CUSTOMER_SUCCESS/) | Internal |
| `PRE_SPRINT_GATE_CHECKLIST.md` | Day 0 gate criteria + escalation triggers | Internal |
| `EVIDENCE_INTAKE_SOP.md` | How to request, receive, and validate client evidence | Internal |
| `INTERVIEW_GUIDE.md` | Interview scripts by stakeholder type + dimension prompts | Internal |
| `SCORING_WORKSHEET_TEMPLATE.md` | Blank scoring worksheet for each sprint | Internal |
| `ROADMAP_CONSTRUCTION_SOP.md` | ICE scoring methodology + roadmap assembly steps | Internal |
| `READOUT_DELIVERY_SOP.md` | How to run the Day 5 readout (prep, delivery, follow-up) | Internal |
| `DEBRIEF_TEMPLATE.md` | Post-sprint internal debrief format | Internal |
| `CLIENT_FOLDER_STRUCTURE.md` | Standard folder layout for every client workspace | Internal |

---

## Category 4 — Sales Playbooks
**Purpose:** Equip SDRs, AEs, and the Head of Sales with repeatable, proven approaches to prospect, qualify, and close.

| Attribute | Value |
|-----------|-------|
| **Owner role** | REV_HEAD_OF_SALES (overall) + REV_SDR_SMB / REV_SDR_MIDMARKET / REV_SDR_AGENCY (segment-specific) |
| **Update frequency** | Bi-weekly (Fridays — incorporate learnings from that week's calls) |
| **Format standard** | Markdown with sequences, call scripts, decision trees, and outcome tracking columns |
| **Access level** | 🔒 Internal only |
| **Sub-documents** | |

| Doc Name | Description | Access |
|----------|-------------|--------|
| `ICP.md` | Ideal Customer Profile (exists at SALES/) | Internal |
| `OUTREACH_SEQUENCES.md` | 6-touch sequences by segment (SMB/Mid-Market/Agency) | Internal |
| `SCRIPTS.md` | Cold call, voicemail, and discovery call scripts | Internal |
| `QUALIFICATION.md` | PACT/DO qualification framework + scoring | Internal |
| `DECISION_CALL_SCRIPT.md` | Close call script with objection branches | Internal |
| `CLOSE_EXECUTION.md` | Step-by-step closing playbook | Internal |
| `MIDMARKET_ACCOUNT_BRIEFS.md` | Account-specific research and entry strategy | Internal |
| `48H_CLOSE_PLAN_FINAL.md` | Rapid close execution plan | Internal |
| `OFFERS.md` | Product offer tiers + packaging | Internal |
| `PRICING.md` | Pricing model + negotiation floor | Internal |

---

## Category 5 — Objection Handling
**Purpose:** Give AEs and SDRs pre-built, battle-tested responses to every common objection category.

| Attribute | Value |
|-----------|-------|
| **Owner role** | REV_OBJECTION_COACH (primary) + REV_ACCOUNT_EXEC_CLOSER (field-testing) |
| **Update frequency** | Weekly (add new objections encountered; mark untested responses as "HYPOTHESIS") |
| **Format standard** | Markdown with: Objection | Category | Root Cause | Validated Response | Fallback | Source |
| **Access level** | 🔒 Internal only |
| **Sub-documents** | |

| Doc Name | Description | Access |
|----------|-------------|--------|
| `OBJECTION_MASTER_LIBRARY.md` | All objections by category (price, timing, authority, need, trust) | Internal |
| `OBJECTION_RESPONSE_SCRIPTS.md` | Verbatim response scripts with tone notes | Internal |
| `OBJECTION_TRACKER.md` | Live log: objection raised, response used, outcome | Internal |
| `OBJECTION_CALIBRATION_LOG.md` | Weekly review: which responses worked, which need revision | Internal |

---

## Category 6 — Client FAQs
**Purpose:** Pre-answer the most common client questions during sales, onboarding, and delivery so every team member gives consistent, accurate answers.

| Attribute | Value |
|-----------|-------|
| **Owner role** | REV_CUSTOMER_SUCCESS_MANAGER (primary) + REV_SUPPORT_LEAD (intake and triage) |
| **Update frequency** | Monthly (or immediately when a new FAQ-worthy question surfaces in a client call) |
| **Format standard** | Markdown with Q&A pairs grouped by phase; client-facing version in plain language |
| **Access level** | 🔓 Client-facing (sanitized versions); 🔒 Internal (with full context and edge-case notes) |
| **Sub-documents** | |

| Doc Name | Description | Access |
|----------|-------------|--------|
| `FAQ_SALES.md` | Pre-sale questions: what is AMC, how long, what do we need to prepare | Client-facing |
| `FAQ_ONBOARDING.md` | Kickoff + evidence questions: what to share, who to involve, time commitment | Client-facing |
| `FAQ_DELIVERY.md` | Sprint questions: how scoring works, what the readout covers, what's in the report | Client-facing |
| `FAQ_RETAINER.md` | Post-sprint questions: what ongoing engagement looks like, pricing, timelines | Client-facing |
| `FAQ_INTERNAL_EXTENDED.md` | Full version with internal notes, edge cases, escalation paths | Internal |

---

## Category 7 — Templates
**Purpose:** Provide ready-to-use, version-controlled templates for all recurring documents across sales and delivery.

| Attribute | Value |
|-----------|-------|
| **Owner role** | REV_DOCS_TECH_WRITER (maintenance) + functional role (originator) |
| **Update frequency** | Quarterly (or when a template is flagged as causing friction in the field) |
| **Format standard** | Markdown (.md) with placeholder syntax `{{FIELD_NAME}}` for variable content; PDF version maintained for client-facing templates |
| **Access level** | 🔒 Internal (templates); 🔓 Client-facing (submitted artifacts) |
| **Sub-documents** | |

| Doc Name | Description | Access |
|----------|-------------|--------|
| `PROPOSAL_TEMPLATE.md` | Proposal framework with all sections (exists at SALES/) | Internal |
| `SOW_TEMPLATE.md` | Statement of Work template (exists at SALES/) | Internal |
| `SPRINT_READOUT_DECK_TEMPLATE.md` | Day 5 readout slide template (exists at CUSTOMER_SUCCESS/) | Internal |
| `QBR_TEMPLATE.md` | Quarterly Business Review deck (exists at CUSTOMER_SUCCESS/) | Internal |
| `ONBOARDING_CHECKLIST_TEMPLATE.md` | Pre-sprint client checklist | Client-facing |
| `EVIDENCE_INTAKE_FORM.md` | Structured evidence submission guide | Client-facing |
| `POST_READOUT_EMAIL_TEMPLATE.md` | Follow-up email after Day 5 readout | Internal |
| `KICKOFF_AGENDA_TEMPLATE.md` | Day 1 kickoff call agenda | Internal |
| `INTERVIEW_NOTES_TEMPLATE.md` | Structured notes format for Day 2 interviews | Internal |
| `SCORING_WORKSHEET_TEMPLATE.md` | Control-by-control scoring sheet | Internal |

---

## KB Governance Model

### Roles and Responsibilities
| Role | Responsibility |
|------|---------------|
| REV_KB_MANAGER | Master index maintenance, access audits, format enforcement, onboarding new docs |
| Doc Owner (listed per category) | Content accuracy, update cadence, peer review routing |
| REV_QA_LEAD | Spot-check reviews of delivery docs quarterly |
| REV_COMPLIANCE_OFFICER | Review client-facing docs for claims compliance before publish |

### Update Process (for any KB document)
1. Owner edits draft → appends change summary to footer changelog
2. Owner notifies KB_MANAGER via `AMC_OS/INBOX/REV_KB_MANAGER.md`
3. For client-facing docs: REV_COMPLIANCE_OFFICER reviews before promotion to "published"
4. KB_MANAGER updates `AMC_OS/KB/INDEX.md` with new version + date
5. Major rewrites (50%+ content change) require peer review (see ROLEBOOKS/00_GLOBAL_STANDARDS.md)

### Naming Convention
```
[CATEGORY_PREFIX]_[DOCUMENT_NAME]_v{N}.md
Examples:
  METHODOLOGY_FRAMEWORK_OVERVIEW_v2.md
  DELIVERY_SPRINT_SOP_v1.md
  SALES_OBJECTION_MASTER_LIBRARY_v3.md
```

### Access Levels
| Level | Who Can View | Who Can Edit |
|-------|-------------|-------------|
| 🔓 Client-facing | All internal staff + approved clients | Doc owner + REV_KB_MANAGER |
| 🔒 Internal | All internal staff | Doc owner + REV_KB_MANAGER |
| 🔐 Restricted | Named roles only (e.g., pricing, legal) | Doc owner + REV_KB_MANAGER + REV_COO_ORCH |

---

## Acceptance Checks
- [ ] All 7 categories have named owner role and update cadence
- [ ] Every sub-document has an access level designation
- [ ] KB governance model covers creation, update, review, and access workflows
- [ ] Naming convention specified and unambiguous
- [ ] Client-facing vs. internal distinction is explicit for every document

## Files Created/Updated
- `AMC_OS/OPS/KNOWLEDGE_BASE_STRUCTURE.md` (this file)

## Next Actions
1. Create `AMC_OS/KB/INDEX.md` master directory file (REV_KB_MANAGER action)
2. Audit existing AMC_OS/ files against this structure — tag each with category + access level
3. Identify missing templates (especially ONBOARDING_CHECKLIST_TEMPLATE.md and EVIDENCE_INTAKE_FORM.md) and create them
4. Set up update-reminder calendar events for each category's cadence (monthly/bi-weekly)
5. Share client-facing FAQ drafts with REV_COMPLIANCE_OFFICER for first review

## Risks/Unknowns
- Some sub-documents listed don't exist yet — creation must be prioritized before first sprint
- KB_MANAGER role must be actively owned; without an owner it degrades quickly
- Client-facing docs need legal/compliance sign-off before sharing — allow 48-hr review buffer in sprint timeline
