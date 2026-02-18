# OUTBOUND COMPLIANCE CHECKLIST
**Owner:** REV_COMPLIANCE_OFFICER + REV_QA_LEAD  
**Version:** 1.0 — 2026-02-18  
**Scope:** Any outbound message sent on behalf of AMC — email, LinkedIn DM, voicemail, SMS, cold call script  
**Usage:** Complete this checklist **before every send batch**. No batch ships without all BLOCKing items checked. Keep a timestamped copy per campaign.

---

## ⚡ HOW TO USE
- **✅ Pass** = confirmed safe, proceed  
- **⚠️ Warn** = flag for revision before send  
- **🚫 Block** = do not send until resolved; escalate to REV_COMPLIANCE_OFFICER  

All **Section 1–3** items must be ✅ before any message leaves the queue.

---

## SECTION 1 — CLAIM ACCURACY (MUST PASS — ALL ITEMS)

### 1.1 No Guaranteed Outcomes
- [ ] No language promising guaranteed results, revenue, ROI, conversions, approvals, or compliance outcomes
- [ ] No phrases: "will increase," "guarantees," "risk-free," "100% success," "always works"
- [ ] Outcome-adjacent language is scenario/conditional framing only ("can help," "designed to," "may improve," "supports")

**Examples of blocked phrasing:**  
❌ "We'll guarantee 30-day results" → ✅ "We target measurable improvement in a defined window; results vary"  
❌ "You will recover your investment" → ✅ "In similar scenarios, teams have found value in [outcome]; your context may vary"

### 1.2 No Unverifiable Superlatives
- [ ] No "#1," "best," "most accurate," "fastest ever," "only," "leading," unless supported by documented, verifiable source
- [ ] Comparative claims ("faster than," "better than") include the basis of comparison
- [ ] "Fastest path / fastest way" language softened to "practical path / efficient option" per CLAIMS_POLICY

### 1.3 No Absolute Statements
- [ ] No "always," "never," "eliminate," "foolproof," "zero risk," "fully compliant by default" without documented proof
- [ ] Hedged alternatives used: "typically," "often," "in most cases," "tends to"

### 1.4 No Implied Regulated Advice
- [ ] Message does not imply legal, tax, accounting, clinical, investment, or regulatory advice
- [ ] Where output of AMC's work touches these areas, applicable disclaimer is present

### 1.5 Claim Evidence Check
- [ ] Any specific numeric claim (% improvement, time saved, conversion rate) has documented source in CLAIM_REGISTRY.md
- [ ] Source tier is HIGH or MEDIUM (LOW-tier claims require disclosure as "hypothesis" or removed entirely)
- [ ] If no verified source exists: claim is rewritten in qualified/process language

---

## SECTION 2 — CAN-SPAM + GDPR COMPLIANCE (MUST PASS — ALL ITEMS)

### 2.1 Sender Identification
- [ ] "From" name and email accurately identify the sender (no misleading sender names or domains)
- [ ] No impersonation of another person, company, or brand
- [ ] No use of a third party's brand, name, or credentials without explicit authorization

### 2.2 Subject Line Accuracy
- [ ] Subject line is not deceptive or misleading about the message content
- [ ] Subject line does not imply a prior relationship that does not exist (e.g., "Following up on our last conversation" when there was none)
- [ ] No clickbait subject lines that misrepresent the email body

### 2.3 Physical Sender Address (CAN-SPAM)
- [ ] All commercial emails include a valid physical postal address of the sender or sender's business
- [ ] Address is in the footer or signature block — not hidden or absent

### 2.4 Opt-Out Mechanism
- [ ] Every commercial email includes a clear, functional unsubscribe/opt-out mechanism
- [ ] Opt-out is in plain, unambiguous language: "Unsubscribe" or "Stop receiving emails from us"
- [ ] Unsubscribe requests will be honored within 10 business days (CAN-SPAM requirement)
- [ ] For LinkedIn DMs: immediately honor any "please remove me from your list" request — log it in CRM
- [ ] "Break-up email" conversational asks ("should I close the loop?") do NOT substitute for a mandatory unsubscribe mechanism

### 2.5 GDPR-Relevant Safeguards (for EU/UK prospects)
- [ ] If reaching EU/UK prospects: confirm lawful basis for contact is documented (legitimate interest assessment or consent record)
- [ ] Prospect data was obtained through compliant means (public professional profiles, opt-in lists, etc.)
- [ ] No use of data obtained through deception or unauthorized scraping
- [ ] Privacy notice / data handling statement available on request or linked in footer

### 2.6 Do-Not-Contact List Check
- [ ] Prospect is NOT on AMC's internal opt-out or DNC list
- [ ] Prospect's domain is NOT on suppression list
- [ ] CRM checked for prior opt-out signal before sending

---

## SECTION 3 — PERSONALIZATION + MESSAGE INTEGRITY (MUST PASS — ALL ITEMS)

### 3.1 Personalization Verified (Not Spray-and-Pray)
- [ ] First line references a **real, observable, specific trigger** for this prospect (hiring push, product launch, funding, public post, tool switch — not generic "I noticed your company")
- [ ] {{FirstName}}, {{Company}}, {{workflow}}, {{trigger}} fields are ALL populated — no unfilled template variables visible in final message
- [ ] Segment variant matches actual company profile (Startup/Agency/Mid-Market correctly assigned)
- [ ] Role-specific pain framing matches prospect's actual title/function
- [ ] At minimum: Observable trigger + named workflow + role-relevant outcome — all three present

### 3.2 No Impersonation
- [ ] Sender is identified as themselves and their actual company
- [ ] No pretending to be a mutual connection, investor, or known contact
- [ ] No forged headers, false "forwarded" chains, or fake mutual-referral framing
- [ ] No use of another AMC team member's identity without their explicit consent

### 3.3 CTA Integrity
- [ ] CTA is single, clear, and low-pressure (one action per message)
- [ ] CTA asks for a conversation/fit-check, NOT a purchase decision or implied commitment
- [ ] No countdown pressure, false scarcity, or urgency manufactured without factual basis
- [ ] Touch number matches correct CTA tier (low-friction → value → decision → exit per sequence library)

### 3.4 Message Length + Skimmability
- [ ] Touch 1–2: ≤140 words
- [ ] Touch 3–4: ≤180 words (including value give)
- [ ] Touch 5+: ≤120 words (decision/exit framing is short)
- [ ] No walls of text or dense paragraphs

---

## SECTION 4 — CHANNEL-SPECIFIC GATE

### 4A — Email
- [ ] Subject line ≤60 characters (preview-safe)
- [ ] Unsubscribe footer present and functional
- [ ] Physical address in footer
- [ ] Sender domain is properly authenticated (SPF/DKIM configured) — verify with REV_DEVOPS_ENGINEER

### 4B — LinkedIn DM
- [ ] Message does not violate LinkedIn's professional community policies
- [ ] No mass-copy/paste identical DMs across prospects (must have at least first-line variation)
- [ ] Respect LinkedIn's daily outreach volume limits to avoid account suspension

### 4C — Voicemail
- [ ] Caller identifies themselves and company at start of message
- [ ] No misleading "callback" urgency framing
- [ ] No impersonation of an urgent business or legal matter

---

## SECTION 5 — FINAL PRE-SEND APPROVAL LOG

Complete this block and save with each campaign batch:

```
SEND BATCH APPROVAL
-------------------
Date:
Campaign name:
Segment variant: [ ] Startup  [ ] Agency  [ ] Mid-Market  [ ] Other: ____
Volume (# messages):
Channel(s):

Preparer:
QA reviewer (must be different person from preparer, or REV_QA_LEAD sign-off):

Section 1 — Claim Accuracy:       [ ] PASS  [ ] FAIL (list items below)
Section 2 — CAN-SPAM/GDPR:        [ ] PASS  [ ] FAIL
Section 3 — Personalization:      [ ] PASS  [ ] FAIL
Section 4 — Channel-Specific:     [ ] PASS  [ ] FAIL

Blockers identified (list any):
1.
2.

Waivers approved (if any — must include approver + date):

FINAL DECISION:   [ ] GO — SEND    [ ] NO-GO — HOLD FOR FIXES
Approver signature/initials:
```

---

## SECTION 6 — QUICK REWRITE BANK (PRE-SEND FIXES)

| ❌ Blocked Phrase | ✅ Compliant Replacement |
|---|---|
| "We guarantee results" | "We target measurable outcomes; results vary by context" |
| "Fastest path to launch" | "A practical path to launch" |
| "Risk-free" | "Explicit risks and assumptions included" |
| "Will recover your cost" | "In similar scenarios, teams have found value; your context may vary" |
| "Fully compliant by default" | "Supports compliance workflows with mandatory review gates" |
| "Best solution for..." | "Built for [specific use case]" |
| "Should I close the loop?" (as opt-out) | Add actual unsubscribe link + "If you'd like to opt out, click here" |
| "Following up on our conversation" (no prior conversation existed) | "Reaching out for the first time on..." |
| Generic "I noticed your company does great work" | Specific: "Noticed [Company]'s recent [specific trigger]" |

---

## References
- Claims policy: `AMC_OS/FINANCE_LEGAL/CLAIMS_POLICY.md`
- Evidence tiers: `AMC_OS/OPS/CLAIM_REGISTRY.md`
- Sequence templates: `AMC_OS/SALES/OUTREACH_SEQUENCES.md`
- Historical compliance status: `AMC_OS/FINANCE_LEGAL/OUTBOUND_COMPLIANCE_FINAL_STATUS_2026-02-18.md`

---

*Files created/updated:* `AMC_OS/OPS/OUTBOUND_COMPLIANCE_CHECKLIST.md`  
*Acceptance checks:* All six sections present; Section 1–3 are mandatory pass gates; Approval Log block is completeable pre-send; Rewrite bank covers known failure patterns.  
*Next actions:*
1. Add this checklist as a required step in the SDR daily ops SOP.
2. Link this file from OUTREACH_SEQUENCES.md as pre-send gate reference.
3. Run first live batch through all six sections and log result in QA_SCOREBOARD_DAILY.md.
4. Review monthly and update rewrite bank based on new failure patterns.
*Risks/unknowns:*
- CAN-SPAM physical address requirement may require a registered business address — confirm with REV_LEGAL_CONTRACTS.
- LinkedIn volume limits change without notice; SDR must monitor account health weekly.
- GDPR legitimate interest basis documentation not yet formalized for EU prospects.
