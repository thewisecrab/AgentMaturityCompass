# SUPPORT PLAYBOOK
## REV_CUSTOMER_SUCCESS_MANAGER + REV_SUPPORT_LEAD

## 1) Purpose
Provide consistent support during sprint delivery and post-readout handoff so clients get clear communication, fast first response, and predictable escalation.

## 2) Response SLAs

### Severity tiers
- **Tier 1 (P1) — Sprint-impacting**: no response from client in 24h, missing required evidence blocking Day 1/2 milestones, data mismatch affecting scoring integrity, technical inability to proceed.  
  **First response:** 1 business hour  
  **Resolution target:** 4 business hours or same-day remediation plan

- **Tier 2 (P2) — Delivery-risk**: moderate scope questions, interview scheduling conflicts, missing non-critical artifacts, access/login friction, template/template confusion.  
  **First response:** 4 business hours  
  **Resolution target:** 24 business hours

- **Tier 3 (P3) — Informational**: routine follow-up questions, non-urgent how-to, template requests, general status updates.  
  **First response:** 1 business day  
  **Resolution target:** 2 business days

### Communication channels
- Primary: email/thread documented in client folder.
- Escalation by phone for P1.
- For urgent client-facing delays, use the **Delay Notification Template** immediately.

## 3) Escalation matrix

| Tier | Owner / Lead | Escalates to | Response expectation | Typical use cases |
|---|---|---|---|---|
| **Tier 1** | REV_CUSTOMER_SUCCESS_MANAGER / REV_SUPPORT_LEAD | REV_PROGRAM_MANAGER, REV_COO_ORCH | Same-day | Sprint at risk, missing Day 1 evidence gate, unresolved client dispute |
| **Tier 2** | REV_CUSTOMER_SUCCESS_MANAGER | REV_QA_LEAD (if scoring quality issue), REV_IMPLEMENTATION_SPECIALIST (if method issue), REV_PROPOSAL_SOW_SPECIALIST (if scope) | Within 4 business hours | Score-confidence concerns, roadmap disagreement, scope questions |
| **Tier 3** | REV_CUSTOMER_SUCCESS_MANAGER | No default escalation unless trend repeats | 24–48h | Admin questions, status clarifications |

**Special route (legal/compliance/security):** escalate to REV_LEGAL_CONTRACTS immediately, copy REV_CUSTOMER_SUCCESS_MANAGER.

## 4) Top 10 common issues + resolution

1) **Client does not submit onboarding checklist on time**  
   - Acknowledge delay, send gate-impact map, set firm resubmission deadline, and confirm fallback evidence priorities.

2) **Evidence artifact missing (system prompts/monitoring/logs)**  
   - Offer exact replacement artifacts, provide examples, accept partial substitutes, mark confidence risk in scoring.

3) **Stakeholder not available for Day 2 interviews**  
   - Capture asynchronous answer form, assign backup interviewer slot, update schedule and stakeholders list.

4) **Client asks for methodology beyond sprint scope**  
   - Acknowledge, clarify sprint boundaries, and park as “future phase” with owner/date.

5) **Disagreement with score on a specific control**  
   - Re-open control with source references, verify evidence, compare with QA notes, adjust only if evidence supports revision.

6) **Unclear evidence naming / upload formatting**  
   - Send standardized naming convention and rename examples; re-collect only the missing pieces.

7) **Sponsor has gone silent**  
   - Send escalation cadence email (issue acknowledgment + 24h deadline), then phone follow-up and escalate to PM if unresolved.

8) **Readout attendee no-show**  
   - Record session, send follow-up deck and summary, schedule 24h replay follow-up call.

9) **Request for rapid roadmap re-prioritization post-readout**  
   - Clarify original scoring assumptions, then propose a separate 15-min scope sync if within 14 days.

10) **NPS/feedback not returned**  
   - Send reminder with short reply option (1–10 + short reason), then trigger follow-up call if score ≤6 when agreed in plan.

## 5) Communication templates

### A) Delay Notification (Day 1–5)
**Subject:** Update on Sprint Timeline — [CLIENT NAME] / [DATE]

Hi [Name],

Quick update: we’ve hit a delay because [reason]. To keep the readout useful, [what changes] and revised next step is [new milestone + deadline].

Impact: [client-facing impact]

Please share the following by [time]: [required items/list].

If not returned by that time, we will proceed with available evidence and flag confidence areas in the Day 5 output.

Thanks for your quick help.

### B) Issue Acknowledgment
**Subject:** We received your issue — [brief topic]

Hi [Name],

Thanks for flagging this. We’ve received your issue and started review.

What we are checking:
- [point 1]
- [point 2]

Owner: [name], ETA: [time frame]

I will send a status update by [time] and share next actions once we confirm details.

### C) Resolution Confirmation
**Subject:** Resolved: [brief topic]

Hi [Name],

We’ve completed the review and resolved [issue].

What changed:
- [action taken]
- [evidence/document updated]

Current state: [confirmed outcome]

If anything still looks off, reply with that exact section and we’ll re-check immediately.

### D) Scope Question Response
**Subject:** Scope clarification — [topic]

Hi [Name],

Great question. For this sprint, scope is limited to [specific scope].

What we can include now: [list]
What is out of scope today: [list]

If this belongs to a follow-up phase, I can add it as a separate item with owner and estimate after Day 5.

### E) Sprint Risk / Support Escalation (for PM handoff)
**Subject:** Sprint risk: [Client / issue]

- Client: [name]
- Severity: P1/P2
- Blocking item: [description]
- Evidence gap: [details]
- Decision needed: [what manager approval needed]
- Deadline: [time]

## 6) Handoff and closing checklist
- Confirm ticket status in client folder and health score log.
- Verify escalation records are logged.
- Ensure sprint artifacts reflect all assumptions and confidence flags.
- Confirm post-readout NPS survey date and delivery owner.

## 7) Files created/updated
- `AMC_OS/CUSTOMER_SUCCESS/SUPPORT_PLAYBOOK.md`

## 8) Acceptance checks
- Contains response SLAs with explicit first-response and resolution windows.
- Includes escalation matrix with owners and special legal/security route.
- Includes 10 actionable issues with one-step resolution guidance.
- Includes four reusable templates with placeholders.

## 9) Next actions
1. Add this playbook link to `SPRINT_DELIVERY_SOP.md` communication cadence references.
2. Align with team on exact channel tooling (thread IDs, phone protocol).
3. Run a one-week dry run on a fake support issue to test escalation latency.

## 10) Risks/unknowns
- Escalation speed depends on team availability across time zones.
- Template tone must be localized by account manager style.
- Evidence-heavy clients may need additional admin triage support during onboarding.