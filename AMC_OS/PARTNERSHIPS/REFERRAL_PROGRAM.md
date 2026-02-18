# REFERRAL PROGRAM — AMC Compass Sprint
**Owner:** REV_AFFILIATE_REFERRAL_MANAGER  
**Date:** 2026-02-18  
**Lever:** A — Pipeline (referral-sourced deals) + B — Conversion (warm intros close faster)  
**Status:** v1 — Ready to activate with first referral partners

---

## 1. PROGRAM OVERVIEW

The AMC Referral Program is designed to grow qualified pipeline through warm introductions from people who have seen the Compass Sprint work firsthand — clients, collaborators, ecosystem contacts, and advocates.

**Non-cash first:** All incentives in this version are recognition, co-marketing, and revenue share credits. No cash payouts in v1.

**Who can refer:**
- Completed Compass Sprint clients
- Agency partners (separate but linked to AGENCY_PARTNER_PITCH.md)
- Freelancers and consultants who work adjacent to AI teams
- Community members (Discord servers, Slack groups, LinkedIn communities)
- Conference speakers, podcast hosts, content creators

---

## 2. INCENTIVE STRUCTURE

### Tier 1 — Recognition Referrer
**For:** Clients, community members, freelancers  
**Activation:** First referral that books a discovery call  
**Incentives:**
- Public LinkedIn shoutout (with permission) tagging the referrer as "AMC Referral Partner"
- AMC "Referral Partner" digital badge (PNG/SVG for LinkedIn / email signature)
- Named credit in AMC newsletter under "Ecosystem Spotlight"
- Early access to future AMC resources (rubric updates, benchmark reports)

### Tier 2 — Active Referrer
**For:** Referrers who produce 1 closed Compass Sprint  
**Activation:** First successful referral that converts to paid engagement  
**Incentives (stacked on Tier 1):**
- Co-marketing opportunity: joint LinkedIn post or short case framing (referrer quoted)
- AMC "Certified Referral Partner" badge upgrade
- Priority slot at next AMC community webinar or AMC-hosted session
- Revenue share credit: **10% of Sprint fee** applied as credit toward their own future AMC engagement (or donated to a team member's Sprint at their direction)

> **Assumption:** Revenue share credit is not cash — it is an account credit redeemable against future AMC services. This avoids cash payout compliance complexity.

### Tier 3 — Strategic Referrer
**For:** Referrers who produce 3+ closed Compass Sprints in any rolling 6-month window  
**Activation:** 3rd successful closed referral  
**Incentives (stacked on Tier 2):**
- Revenue share on ongoing Retainer conversions: **10% of first 3 months of retainer MRR** credited against their account or applied at their direction
- Named "Ecosystem Partner" feature on AMC website (once live)
- Dedicated co-marketing: joint webinar, co-authored article, or LinkedIn Live co-hosting
- Quarterly strategy call with AMC founder/head of partnerships
- Input on next rubric version or benchmark study (advisory credit)

### Summary Table

| Tier | Trigger | Recognition | Co-Marketing | Revenue Credit |
|---|---|---|---|---|
| 1 — Recognition | Discovery call booked | LinkedIn shoutout + badge | Newsletter mention | None |
| 2 — Active | 1 closed Sprint | Certified badge + co-post | Webinar slot | 10% of Sprint (as credit) |
| 3 — Strategic | 3+ closed Sprints (6 mo) | Ecosystem Partner listing | Webinar + article | 10% of 3-mo retainer MRR |

---

## 3. REFERRAL TRACKING METHOD

### v1 (Manual — low overhead, launch-ready today)
Until automation tooling is in place, referrals are tracked via a lightweight manual system:

**Step 1 — Referral Registration**  
Referrer submits referral via:
- Email to partnerships@[amcdomain].com with subject: `REFERRAL: [Prospect Name] from [Referrer Name]`
- Or: direct DM to AMC founder with the same format

**Step 2 — CRM Tag**  
REV_REVOPS_CRM logs the referral in CRM with:
- Fields: `referral_source`, `referrer_name`, `referrer_tier`, `referral_date`, `referral_status`
- Status values: `registered` → `call_booked` → `proposal_sent` → `closed_won` → `credited`

**Step 3 — Referrer Notification**  
Automated (or manual) email to referrer at each status milestone:
- "Your referral booked a call!" (Tier 1 trigger)
- "Your referral closed!" (Tier 2 trigger + credit issued)

**Step 4 — Credit Issuance**  
Rev share credit issued within 10 business days of referral deal payment received.  
Tracked in `AMC_OS/FINANCE_LEGAL/BILLING_COLLECTIONS.md` as a liability line.

### v2 (Automated — within 60 days)
- Referral link generator (UTM-tagged landing page links per referrer)
- Referral dashboard (Notion or lightweight web view) showing referrer status + credit balance
- Automated milestone emails via CRM trigger

### Tracking fields (CRM schema addition)
```
referral_source: [referrer_name]
referrer_email: [email]
referrer_tier: [1|2|3]
referral_date: [YYYY-MM-DD]
referred_company: [company name]
referred_contact: [name]
referral_status: [registered|call_booked|proposal_sent|closed_won|credited|lost]
sprint_fee: [$USD or ₹INR]
credit_amount: [calc: 10% of sprint_fee]
credit_applied_date: [YYYY-MM-DD]
credit_redeemed_against: [description]
```

---

## 4. ACTIVATION EMAIL TEMPLATE

**Subject:** Want to help a colleague level up their AI? Here's how (and what you get)

---

Hi [First Name],

You've been through the Compass Sprint — you know what a scored AI maturity baseline looks like and why it matters.

If you know other teams building AI agents who are still flying blind — no maturity baseline, no governance framework, no clear "what do we fix next" answer — we'd love a warm introduction.

Here's how it works:

**You refer → They book a call → You get recognized.**  
If they move forward with a Sprint, you earn a 10% credit toward your own future AMC engagement.  
If you send 3 or more clients our way, you become an AMC Ecosystem Partner with co-marketing support and direct input on our roadmap.

**To make a referral:**
Just reply to this email with the name and contact of someone who might benefit, or forward this message to them directly. That's it — we'll take it from there and keep you in the loop.

**Who's a good fit?**
Any team that is:
- Building or running AI agents in production (or about to)
- Being asked by leadership "how do we know it's ready?"
- Evaluating AI vendors and needing a structured way to compare options
- An agency being asked by clients to run an AI readiness assessment

No pressure, no quota, no awkward follow-up from us to your contact unless they express interest.

Questions? Just reply.

[Your name]  
AMC Partnerships  
[email] | [calendly link]

---

## 5. REFERRAL AGREEMENT 1-PAGER

---

### AMC REFERRAL PARTNER AGREEMENT — Summary (v1)

**Effective Date:** [Date]  
**Referral Partner:** [Partner Name], [Company/Individual]  
**AMC Contact:** [AMC Rep Name], AMC

---

**1. Scope**  
Partner agrees to refer potential clients ("Prospects") to AMC for the purpose of engaging AMC's Compass Sprint or related services. This agreement governs the terms of referral compensation and partner recognition.

**2. Eligible Referrals**  
A referral is "Eligible" when:  
(a) The Prospect is not already in AMC's CRM or active pipeline at the time of referral,  
(b) Partner introduces AMC to Prospect or provides Prospect's contact details with Prospect's consent, and  
(c) AMC can verify the referral originated from Partner.

**3. Incentives**  
AMC will provide the following non-cash incentives for Eligible Referrals that result in paid engagements:
- **Recognition (all tiers):** LinkedIn acknowledgment, digital badge, newsletter mention
- **Credit (Active Referrer, 1+ closures):** 10% of Sprint fee as AMC service credit, issued within 10 business days of payment receipt
- **Co-marketing + retainer credit (Strategic Referrer, 3+ closures in 6 months):** As specified in REFERRAL_PROGRAM.md Tier 3

Credits are non-transferable to third parties, non-redeemable for cash, and valid for 12 months from issuance.

**4. Exclusions**  
No incentive is owed for:
- Referrals where the Prospect was already in AMC's pipeline
- Referrals that do not result in a paid, collected engagement
- Self-referrals

**5. No Exclusivity**  
This agreement does not grant exclusivity to either party. AMC may work with other referral partners. Partner may refer clients to other service providers.

**6. Partner Conduct**  
Partner will not make representations about AMC's services that are inaccurate or inconsistent with AMC's published materials. Partner will not use AMC's name in paid advertising without prior written consent.

**7. Confidentiality**  
Partner will keep the terms of this agreement confidential. AMC will keep Prospect communications confidential except as necessary to deliver services.

**8. Term and Termination**  
This agreement is at-will and may be terminated by either party with 14 days written notice. Credits earned prior to termination remain valid for their stated duration.

**9. Governing Terms**  
This agreement is governed by the laws of [jurisdiction — to be confirmed by REV_LEGAL_CONTRACTS]. Any disputes will be resolved through good-faith negotiation before any formal proceeding.

**10. Signatures**  
By signing below, both parties agree to the terms above.

| | AMC | Partner |
|---|---|---|
| Name | | |
| Title | | |
| Signature | | |
| Date | | |

---

> **Review required:** This 1-pager must be reviewed by REV_LEGAL_CONTRACTS before being sent to any external party.

---

## 6. PROGRAM LAUNCH CHECKLIST

- [ ] Legal review of Agreement 1-pager (REV_LEGAL_CONTRACTS)
- [ ] CRM fields added for referral tracking (REV_REVOPS_CRM)
- [ ] Activation email approved by REV_COMPLIANCE_OFFICER
- [ ] Digital badge created (REV_UX_UI_DESIGNER or Canva)
- [ ] LinkedIn shoutout template drafted (REV_SOCIAL_LINKEDIN)
- [ ] Newsletter segment created for Ecosystem Spotlight (REV_EMAIL_NEWSLETTER)
- [ ] Referral intake email address set up (partnerships@)
- [ ] First cohort of referral partners identified (Sprint clients + community contacts)
- [ ] Activation email sent to first 10 candidates

---

## Files created/updated
- `AMC_OS/PARTNERSHIPS/REFERRAL_PROGRAM.md`

## Acceptance checks
- ✅ Three-tier incentive structure with specific non-cash rewards per tier
- ✅ Revenue credit model uses service credits, not cash (compliant with v1 constraints)
- ✅ Referral tracking method covers v1 (manual) and v2 (automated) paths
- ✅ CRM field schema provided for RevOps implementation
- ✅ Activation email is specific, benefit-forward, low-pressure, single-CTA
- ✅ Agreement 1-pager covers scope, eligibility, incentives, exclusions, termination
- ✅ Legal review flag present on agreement
- ✅ Launch checklist provided

## Next actions
1. REV_LEGAL_CONTRACTS to review agreement 1-pager
2. REV_COMPLIANCE_OFFICER to approve activation email
3. REV_REVOPS_CRM to implement referral tracking fields in CRM
4. Identify first 10 activation targets (completed Sprint clients + warm network contacts)
5. Build digital badge in Canva (REV_UX_UI_DESIGNER or founder)

## Risks/unknowns
- Credit model (non-cash) may be less motivating than cash for high-volume referrers
- Referral agreement jurisdiction field is blank — needs legal confirmation
- Attribution can be ambiguous if multiple referrers touch the same prospect — need clear "first registered" rule enforced strictly
