# CRM Pipeline Operations Playbook (REV_REVOPS_CRM)

Owner: REV_REVOPS_CRM  
Version: v2.0 (post-rubric revision)  
Last updated: 2026-02-18  
Primary lever: **A — Pipeline** (with B support via stage discipline)

## 1) Pipeline Stage Framework (single source of truth)

| Stage | Exit criteria (must be true) | Primary owner | SLA target |
|---|---|---|---|
| 0. New Lead | Lead captured with company + contact + source | SDR | <24h to first touch |
| 1. Attempting Contact | Outreach sequence active and logged | SDR | 5 business days sequence |
| 2. Connected | Two-way reply or live conversation completed | SDR | <48h to qualify call |
| 3. Discovery Scheduled | Meeting date/time booked and confirmed | SDR/AE | <7 days from connection |
| 4. Discovery Completed | Need, authority, timeline, and budget confidence captured | AE | Same day notes logged |
| 5. Qualified Opportunity (SQL) | ICP fit + pain + buying intent score >= threshold | AE | <24h after discovery |
| 6. Solution Fit / Demo | Tailored solution walkthrough delivered | AE/Sales Eng | <5 business days |
| 7. Proposal Sent | Proposal + commercials sent with validity date | AE | <3 business days |
| 8. Negotiation / Procurement | Open commercial/legal redlines tracked | AE + Finance/Legal | Weekly checkpoint |
| 9. Closed Won | Contract signed + payment step initiated | AE + CS | <48h handoff |
| 10. Closed Lost | Loss reason and competitor captured | AE | same day closed |
| 11. Nurture | Not now; future trigger + next review date set | SDR/Marketing | review every 30 days |

## 2) Stage Entry/Exit Governance Rules
- No stage advancement without required fields for that stage.
- Stale deal rule: if no activity for 14 days in stages 3–8, auto-flag for manager review.
- Regression rule: if discovery invalidates fit, move back to stage 2 or 11 (do not leave stale in stage 5+).
- Closed Lost mandatory taxonomy: price, timing, no decision, competitor, no budget, no authority, no fit.

## 3) Core KPIs + Reporting Cadence

### Daily (sales standup)
- New leads added
- First-touch SLA attainment (%)
- Replies/connections
- Discovery scheduled count
- Pipeline coverage (open qualified pipeline / period target)

### Weekly (rev ops review)
- Stage conversion rates (0→2, 2→5, 5→7, 7→9)
- Stage aging by owner
- Win rate and average sales cycle
- Loss reason distribution
- Forecast category movement (Commit / Best Case / Pipeline)

### Monthly (leadership)
- Source ROI by channel
- ICP segment performance (SMB, Mid-Market, Agency)
- Forecast accuracy (committed vs actual)
- Data hygiene scorecard (completeness, duplicates, stale records)

## 4) Hygiene Rules (non-negotiable)
1. Every open record has **next_step**, **next_step_due_date**, and **owner**.
2. Every lead/opportunity has **ICP segment** and **trigger**.
3. Contactability minimum: company, contact_name, role, one valid channel (email/phone/linkedin).
4. No duplicate company+email records; weekly dedupe run.
5. Activity logging within 24h of interaction.
6. Closed records require reason taxonomy (won/lost).
7. Null critical fields block stage progression.

## 5) Reporting Operating Rhythm (RACI)
- REV_HEAD_OF_SALES: weekly conversion review + coaching actions.
- REV_REVOPS_CRM: dashboard integrity, field compliance audits, forecast QA.
- SDR/AE owners: daily updates before standup.
- REV_COO_ORCH: monthly synthesis into HQ scoreboards.

## 6) Acceptance Checks
- Stage definitions include explicit exit criteria and owner for each stage.
- KPI cadence includes daily/weekly/monthly layers.
- Hygiene rules map to critical QA lead-list checks (LL-01 to LL-07).
- Document usable by another operator in <=5 minutes.

## 7) Quality Rubric Run (required)
### Pass 1 (self-check)
- Q1 usable <=5 min? **Yes**
- Q2 concrete steps/templates? **Mostly yes**
- Q3 acceptance checks included? **Yes**
- Q4 reduces uncertainty? **Yes**
- Q5 TOOLS compliance? **Yes**

### Revision made
- Added explicit RACI ownership and stage SLAs to improve operational clarity.

### Pass 2 (after revision)
- Q1–Q5: **All Yes**

## 8) Peer-review request path
- Requested reviewer role: REV_HEAD_OF_SALES
- Review file path to create: `AMC_OS/INBOX/REVIEWS/CRM_PIPELINE_OPS__review.md`

---
Files created/updated: AMC_OS/SALES/CRM_PIPELINE_OPS.md  
Acceptance checks: Included in section 6 and quality-rubric verification in section 7.  
Next actions:
1. Map these stages into CRM system picklist.
2. Add validation rules for mandatory fields per stage.
3. Publish weekly dashboard template with owner-level drilldowns.
Risks/unknowns:
- Existing CRM may use different stage labels requiring migration mapping.
- SLA feasibility depends on current SDR capacity.
