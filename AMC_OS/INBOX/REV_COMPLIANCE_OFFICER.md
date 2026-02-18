# REV_COMPLIANCE_OFFICER — Handoff Note (2026-02-18)

Completed a claims-safety audit for outreach/sales/marketing artifacts and delivered updated compliance controls.

## What I reviewed
- Rolebooks: `AMC_OS/ROLEBOOKS/00_GLOBAL_STANDARDS.md`, `AMC_OS/ROLEBOOKS/10_REVENUE_DELIVERY.md`
- Core assets audited:
  - `AMC_OS/SALES/*`
  - `AMC_OS/MARKETING/*`
  - `ASSETS/landing_page_copy.md`
  - `sales_playbook.md`
  - `amc_ai_army/messaging_house.md`

## Findings (claims safety)
- AMC_OS sales/marketing docs are currently sparse and low-risk.
- `ASSETS/landing_page_copy.md` already contains strong compliance-safe claims and disclaimers.
- `amc_ai_army/messaging_house.md` contains robust guardrails and should remain the language baseline.
- Minor caution: in `sales_playbook.md`, phrasing like "recover cost through [specific upside]" should always be framed as scenario-based, not promised outcome.

## Deliverables completed
1. **Updated** `AMC_OS/FINANCE_LEGAL/CLAIMS_POLICY.md`
   - Expanded into enforceable policy with:
     - non-negotiable claim rules
     - allowed/conditional/prohibited claim classes
     - mandatory disclaimer patterns
     - risk tiers (Green/Amber/Red)
     - pre-publish workflow and rewrite bank
     - dated audit notes

2. **Created** `AMC_OS/FINANCE_LEGAL/OUTREACH_COMPLIANCE_CHECKLIST.md`
   - Practical pre-publish checklist for outreach, sales scripts, landing pages, ads, and proposals
   - Includes evidence gate, disclaimer gate, channel-specific checks, and approval log

## Files created/updated
- `AMC_OS/FINANCE_LEGAL/CLAIMS_POLICY.md` (updated)
- `AMC_OS/FINANCE_LEGAL/OUTREACH_COMPLIANCE_CHECKLIST.md` (created)
- `AMC_OS/INBOX/REV_COMPLIANCE_OFFICER.md` (created)

## Acceptance checks
- Open `CLAIMS_POLICY.md` and confirm sections exist for: rules, conditional numeric claims, disclaimer requirements, risk tiers, workflow, rewrites.
- Open `OUTREACH_COMPLIANCE_CHECKLIST.md` and confirm Pass/Fail gates + evidence fields + approval log are present.
- Validate both files explicitly ban guaranteed outcomes and unverified superlatives.

## Next actions
- Require checklist completion before any new outbound campaign or proposal send.
- Add policy reference links in `AMC_OS/SALES/PROPOSAL_TEMPLATE.md` and `AMC_OS/SALES/SCRIPTS.md`.
- Run a monthly spot-audit on 5 random outbound assets for compliance drift.
- Add a standard disclaimer snippet block to all external templates.

## Risks/unknowns
- Many AMC_OS sales/marketing docs are placeholders; future edits may introduce risk if policy gates are not enforced.
- Evidence repository for numeric claims is not yet centralized.
- No automated linting for risky phrases currently exists.

---

## Wave 2 Final Compliance Decision (2026-02-18)
- Final outbound review complete.
- **Decision: GO** for currently audited outbound assets after file-level language fixes.
- Final report: `AMC_OS/FINANCE_LEGAL/OUTBOUND_COMPLIANCE_FINAL_STATUS_2026-02-18.md`
- Files adjusted for compliance hardening:
  - `sales_playbook.md`
  - `AMC_OS/SALES/SCRIPTS.md`
  - `ASSETS/landing_page_copy.md`
