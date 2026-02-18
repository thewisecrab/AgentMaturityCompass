# RISK REGISTER — Top 10 risks to $5k collection

| # | Risk | Probability | Impact | Mitigation | Owner |
|---:|---|---|---|---|---|
| 1 | No qualified pipeline velocity (low outbound replies/meetings) | High | High | Tighten ICP-triggered outbound, run daily rep target checks, reallocate capacity to highest-reply channel before noon | REV_HEAD_OF_SALES |
| 2 | Compliance drift in claims/proof language | Medium | High | Keep compliance gate mandatory; block all outbound/proposal send if red-flag language appears | REV_COMPLIANCE_OFFICER |
| 3 | Incomplete proof and case assets delaying conversion | Medium | Medium | Publish minimum viable proof snippets and one approved success story before scaling outreach | REV_HEAD_OF_GROWTH |
| 4 | Missing funnel attribution/events | Medium | Medium | Enforce `source_cta` and booking attribution fields in CRM; validate daily | REV_REVOPS_CRM |
| 5 | CRM data hygiene gaps in active opportunities | High | High | Require owner/value/probability/next-step/next-meeting date before weekly review; weekly audit owner reminder | REV_REVOPS_CRM |
| 6 | Proposal/SOW quality or scope ambiguity slows close | Medium | High | Use single production template with acceptance criteria and exclusions, review by Compliance + Sales before send | REV_PROPOSAL_SOW_SPECIALIST |
| 7 | Delivery uncertainty increases buyer risk / delays acceptance | Medium | Medium | Lock first-delivery SOP + checklist and confirm with implementation lead before proposal close | REV_IMPLEMENTATION_SPECIALIST |
| 8 | Experiment overload (multiple simultaneous variable changes) obscures what moved conversion | Medium | Medium | Enforce one-variable-at-a-time rule and capture test intent/results in a weekly decision log | REV_HEAD_OF_GROWTH |
| 9 | Role overlap/conflicting output from multiple pods | Medium | Medium | Centralize decisions/rhythm in HQ and use one owner per milestone | REV_COO_ORCH |
|10 | Overreliance on unverified assumptions in claims/performance messaging | Low-Medium | High | Add “assumption” flags in HQ/ASSUMPTIONS.md and require evidence references before publication | REV_CFO_FINANCE |

## Files updated
- `AMC_OS/HQ/RISK_REGISTER.md`

## Acceptance checks
- Top 10 are explicitly tied to cash-first pipeline/conversion/delivery-readiness outcomes.
- Mitigations are specific and owner-assigned.
- Probability and impact are labeled consistently.

## Next actions
1. Review and prioritize by expected loss = probability × impact.
2. Add date/ETA and latest update notes for each risk weekly.
3. Close loop by moving resolved risks to BLOCKERS or Handoff notes as needed.

## Risks/unknowns
- Exact probability scoring scale is not yet standardized across HQ.
- CRM and attribution readiness may shift these priority rankings in first 48 hours.
