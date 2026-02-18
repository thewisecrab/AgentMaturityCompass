# QA SCOREBOARD — DAILY OUTBOUND QUALITY TRACKING
**Owner:** REV_QA_LEAD (daily entry) + REV_COMPLIANCE_OFFICER (weekly review)  
**Version:** 1.0 — 2026-02-18  
**Cadence:** Populated EOD by whoever ran outbound that day. Reviewed each morning by REV_QA_LEAD before next send window opens.  
**Target:** Zero-Flag Rate = 100% (meaning every message passed compliance before send — zero non-compliant messages shipped)

---

## HOW TO FILL IN DAILY
1. **Outbound Volume** = total individual messages sent (email + LinkedIn + voice combined)
2. **Compliance Flags Caught** = issues spotted during pre-send checklist BEFORE send (good — these are catches)
3. **Flags Caught Post-Send** = issues found AFTER messages went out (bad — investigate and log)
4. **Messages Revised Before Send** = number of messages edited to fix compliance issues pre-send
5. **Zero-Flag Batch Rate** = % of batches (not individual messages) that passed all checklist items with zero flags
6. **Zero-Flag Target** = 100% (no batch ships with an unresolved BLOCK)

---

## WEEKLY TARGET SUMMARY (current week: 2026-02-16 → 2026-02-22)
| KPI | Weekly Target | Week-to-Date Actual |
|---|---:|---:|
| Total outbound touches | 200 | 0 |
| Compliance flags caught pre-send | — (track all) | 0 |
| Messages revised before send | — (track all) | 0 |
| Flags caught post-send | 0 | 0 |
| Zero-flag batch rate | 100% | N/A |
| Batches sent with documented approval log | 100% | N/A |

---

## DAILY LOG

### DATE: 2026-02-18 (Baseline — Day 0)
| Field | Value |
|---|---|
| **Date** | 2026-02-18 |
| **Outbound Volume** | 0 (execution not yet started; system set up) |
| **Channels Used** | — |
| **Batches Sent** | 0 |
| **Compliance Flags Caught Pre-Send** | 0 |
| **Flags Caught Post-Send** | 0 |
| **Messages Revised Before Send** | 0 |
| **Zero-Flag Batch Rate** | N/A |
| **Approval Logs Completed** | 0 / 0 |
| **Preparer** | REV_COMPLIANCE_OFFICER + REV_QA_LEAD |
| **Notes** | Day 0 setup. Compliance checklist, claim registry, and QA scoreboard established. No sends yet. |

---

### DAILY LOG TEMPLATE (copy this block for each new day)

```
### DATE: YYYY-MM-DD
| Field | Value |
|---|---|
| **Date** | YYYY-MM-DD |
| **Outbound Volume** | [total messages sent] |
| **Channels Used** | [ ] Email  [ ] LinkedIn DM  [ ] Voicemail  [ ] Other: ____ |
| **Batches Sent** | [#] |
| **Compliance Flags Caught Pre-Send** | [#] — list flag types below |
| **Flags Caught Post-Send** | [#] — list below + corrective action |
| **Messages Revised Before Send** | [#] |
| **Zero-Flag Batch Rate** | [X%] (batches fully clear / total batches sent) |
| **Approval Logs Completed** | [#completed / #batches] |
| **Preparer** | [role or name] |
| **Notes** | [anything relevant: sequence variant, A/B test, new ICP segment, etc.] |

#### Pre-Send Flags Detail (if any):
| # | Flag Type | Section | Message/Batch | Resolution | Resolved By |
|---|---|---|---|---|---|
| 1 | [e.g., Guarantee language] | [S1.1] | [Touch 5, Startup] | [Rewrote CTA] | [name] |

#### Post-Send Flags Detail (if any):
| # | Flag Type | Discovery Method | Impact | Corrective Action | Status |
|---|---|---|---|---|---|
| 1 | [e.g., Missing opt-out] | [Reply from prospect] | [Low / Medium / High] | [Added footer to sequence] | [Open/Resolved] |
```

---

## COMPLIANCE FLAG TYPE CODES
Use these codes in the flag detail tables for consistency:

| Code | Flag Type | Section |
|---|---|---|
| G-OUTCOME | Guaranteed outcome language | S1.1 |
| G-SUPERLATIVE | Unverifiable superlative | S1.2 |
| G-ABSOLUTE | Absolute statement without proof | S1.3 |
| G-ADVICE | Implied regulated advice | S1.4 |
| G-EVIDENCE | Numeric claim without documented source | S1.5 |
| CS-SENDER | Misleading sender identity | S2.1 |
| CS-SUBJECT | Deceptive subject line | S2.2 |
| CS-ADDRESS | Missing physical address | S2.3 |
| CS-OPTOUT | Missing or deficient opt-out mechanism | S2.4 |
| CS-GDPR | GDPR lawful basis not documented | S2.5 |
| CS-DNC | Prospect on DNC/opt-out list | S2.6 |
| P-TRIGGER | Generic first line (no real trigger) | S3.1 |
| P-TEMPLATE | Unfilled template variable in message | S3.1 |
| P-SEGMENT | Wrong variant sent to segment | S3.1 |
| P-IMPERSONATE | Impersonation or false referral | S3.2 |
| P-CTA | Multi-CTA or pressure CTA | S3.3 |
| P-LENGTH | Message exceeds length guideline | S3.4 |
| CH-EMAIL | Channel-specific email issue | S4A |
| CH-LINKEDIN | Channel-specific LinkedIn issue | S4B |
| CH-VOICE | Channel-specific voicemail issue | S4C |

---

## WEEKLY ROLLUP TEMPLATE (run every Friday EOD)

```
## WEEKLY ROLLUP: Week of YYYY-MM-DD to YYYY-MM-DD

| KPI | Target | Actual | Delta |
|---|---:|---:|---:|
| Total outbound sent | 200 | [X] | [+/-] |
| Total compliance flags caught pre-send | — | [X] | — |
| Total messages revised pre-send | — | [X] | — |
| Flags caught post-send | 0 | [X] | [+/-] |
| Zero-flag batch rate (week avg) | 100% | [X%] | [+/-] |
| Approval logs complete | 100% | [X%] | [+/-] |

### Top flag types this week:
1. [Code] — [count] — [root cause]
2. [Code] — [count] — [root cause]

### Root cause analysis (if any post-send flags):

### One compliance improvement experiment for next week:
- Hypothesis:
- Change:
- Measurement method:
- Target:

### Escalations needed:
- [ ] None
- [ ] Yes: [describe]

Signed off: REV_QA_LEAD — [date]
Reviewed: REV_COMPLIANCE_OFFICER — [date]
```

---

## ESCALATION THRESHOLDS
| Condition | Action |
|---|---|
| Any post-send flag (CS-OPTOUT, G-OUTCOME, P-IMPERSONATE) | Immediate hold on that sequence; REV_COMPLIANCE_OFFICER review same day |
| Zero-flag batch rate drops below 90% in any single day | Root cause analysis + SOP update before next send |
| Same flag type appears 3+ times in a week | Add to rewrite bank; propose SOP update |
| Prospect replies indicating deception/harassment perception | Immediate sequence halt; escalate to REV_LEGAL_CONTRACTS |

---

*Files created/updated:* `AMC_OS/OPS/QA_SCOREBOARD_DAILY.md`  
*Acceptance checks:* Daily template is completeable in <5 min; Flag codes are consistent and reusable; Weekly rollup includes root cause + improvement experiment; Escalation thresholds are concrete and actionable.  
*Next actions:*
1. First real send batch: preparer fills daily log template same day.
2. REV_QA_LEAD reviews previous day's log before approving each new send window.
3. Weekly rollup every Friday — feed top flags into SDR coaching session.
4. After 2 weeks of data: review flag frequency patterns and update rewrite bank.
*Risks/unknowns:*
- Zero-flag tracking depends on preparer discipline; pair with SOPS.md checklist step.
- Post-send flag discovery relies on prospect replies or spot audits — consider adding 10% random post-send audit by QA_LEAD weekly.
