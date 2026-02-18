# LEADS_MASTER.csv Schema Guidance

Owner: REV_REVOPS_CRM  
Version: v1.0  
Last updated: 2026-02-18  
Primary lever: **A — Pipeline**

## Purpose
Define a strict, CRM-ready schema for `AMC_OS/LEADS/LEADS_MASTER.csv` so lead quality, routing, and reporting are consistent.

## Canonical Column Schema (ordered)
1. `lead_id` — unique id (e.g., LD-20260218-0001)
2. `company`
3. `company_domain`
4. `contact_name`
5. `contact_role`
6. `email`
7. `phone`
8. `linkedin_url`
9. `country`
10. `source` (inbound, outbound, referral, partner, event, content)
11. `icp_segment` (SMB, Mid-Market, Agency)
12. `industry`
13. `employee_band` (1-10, 11-50, 51-200, 201-1000, 1000+)
14. `trigger_event` (funding, hiring, launch, tool_switch, compliance_change, other)
15. `trigger_date` (YYYY-MM-DD)
16. `priority_tier` (P1, P2, P3)
17. `lead_score` (0-100)
18. `lifecycle_status` (new, attempting_contact, connected, discovery_scheduled, discovery_done, qualified, proposal_sent, negotiation, closed_won, closed_lost, nurture)
19. `owner`
20. `next_step`
21. `next_step_due_date` (YYYY-MM-DD)
22. `last_activity_date` (YYYY-MM-DD)
23. `discovery_notes_url`
24. `created_at` (YYYY-MM-DD)
25. `updated_at` (YYYY-MM-DD)
26. `closed_reason` (required if closed_lost or closed_won)
27. `competitor` (optional)
28. `data_quality_flag` (ok, missing_contact, duplicate, stale, needs_review)

## Field Rules
- Required at ingestion: `lead_id, company, contact_name, contact_role, source, icp_segment, trigger_event, owner, lifecycle_status`.
- Required before outreach: at least one valid channel (`email` OR `phone` OR `linkedin_url`).
- Required before qualification: `lead_score, next_step, next_step_due_date, last_activity_date`.
- Required before close: `closed_reason` for won/lost states.

## Data Validation
- Email format check (`@` and domain present).
- Date fields must be ISO format YYYY-MM-DD.
- `lead_score` integer between 0 and 100.
- `priority_tier` restricted to P1/P2/P3.
- Duplicate key check: `company_domain + email` (or `company + contact_name` fallback).

## Hygiene Cadence
- Daily: missing critical fields report + stale lead alert (>7 days no activity).
- Weekly: duplicate merge pass + owner reassignment audit.
- Monthly: schema compliance trend and drop-off analysis by source.

## Acceptance Checks
- Schema supports pipeline stageing, reporting, and QA matrix LL-01 through LL-07.
- Required/optional fields clearly specified.
- Validation constraints are machine-translatable.
- Cadence defined for daily/weekly/monthly hygiene.

---
Files created/updated: AMC_OS/LEADS/LEADS_MASTER_SCHEMA_GUIDE.md  
Acceptance checks: Included above.  
Next actions:
1. Align CSV header with canonical schema.
2. Add scripted validation in ops automation.
3. Train SDR/AE team on lifecycle_status usage.
Risks/unknowns:
- Historical leads may not meet required field completeness.
- Scoring model thresholds may need calibration by segment.
