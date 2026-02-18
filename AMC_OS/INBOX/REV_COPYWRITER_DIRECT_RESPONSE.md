# INBOX — REV_COPYWRITER_DIRECT_RESPONSE

## Handoff Note · 2026-02-18

### Task completed
Outreach sequences for AMC Compass Sprint ($5k) written and saved to `AMC_OS/CAMPAIGNS/OUTREACH_SEQUENCES.md`.

### What was delivered
- **3 ICP segments:** (A) SMB AI builders, (B) Mid-market SaaS with agents, (C) AI agencies
- **Per segment:** 3-message LinkedIn DM sequence + 2-email cold sequence
- **Total messages:** 15 individual touchpoints, all compliance-reviewed inline
- **Email subjects:** 2 A/B variants per Email 1 (all 3 segments)
- **Word count targets met:** Msg 1 ≤100w, Email 1 ≤150w, Email 2 ≤80w
- **Compliance framing:** Evidence-based pattern language throughout; zero fabricated results; disclaimer footer on all emails

### Lever declared
**LEVER A (Pipeline)** primary — sequences are designed to generate qualified conversations.  
**LEVER B (Conversion)** secondary — value-add Msg 2 and Email 2 are designed to keep warm prospects moving.

### Files created/updated
- `AMC_OS/CAMPAIGNS/OUTREACH_SEQUENCES.md` — main deliverable
- `AMC_OS/OPS/IMPACT_LOG/REV_COPYWRITER_DIRECT_RESPONSE.md` — impact logged
- `AMC_OS/OPS/SKILL_LEDGER/REV_COPYWRITER_DIRECT_RESPONSE.md` — skill + experiment tracked

### Immediate next actions (for downstream roles)
1. **REV_COMPLIANCE_OFFICER** — run final compliance gate review → save to `AMC_OS/INBOX/REVIEWS/OUTREACH_SEQUENCES__review.md`
2. **REV_SDR_SMB / REV_SDR_MIDMARKET / REV_SDR_AGENCY** — load sequences into CRM with correct delay logic (Day 0/3/7 LinkedIn; Day 0/4 email)
3. **REV_REVOPS_CRM** — confirm all personalization tokens map to live CRM fields before first send
4. **REV_HEAD_OF_SALES** — approve send order and daily volume caps
5. **After Day 7:** measure reply rates per segment; apply KAIZEN one-variable experiment to lowest performer

### One experiment queued (KAIZEN)
A/B subject line test — SMB segment Email 1: threat-frame ("Your agent works in dev. What happens in prod?") vs. question-frame ("Quick question about {{Company}}'s agent eval process"). Track open rate for 7 days; keep winner if ≥10% lift without reply quality drop.

### Risks flagged
- Pattern-based framing is compliant but converts below proof-backed copy — prioritize securing anonymized case evidence as soon as available
- LinkedIn DM performance is sensitive to sender profile warmth and credibility — SDRs should audit profiles before first send

---

## Handoff Note · 2026-02-18 (G4 LinkedIn Campaign)

### Task completed
7-post LinkedIn conversion sequence written for Growth Experiment G4. Saved to `AMC_OS/CAMPAIGNS/LINKEDIN_7DAY_CALENDAR.md`.

### What was delivered
- **7 posts, 7 consecutive days** (Thu Feb 19 → Wed Feb 25)
- **Funnel structure:** Awareness (Days 1–2) → Consideration (Days 3–5) → Conversion (Days 6–7)
- **Post type mix:** Hot take ×2, Insight ×1, Story ×1, Question ×1, Proof ×1, Framework ×1
- **Single CTA:** "Book a 20-min Diagnostic Call" — consistent across all 7 posts
- **All posts:** ≤200 words body, scroll-stopping hook, engagement angle specified
- **Compliance:** No guaranteed outcomes, no fabricated case studies, directional framing on proof post with explicit disclaimer

### Lever declared
**LEVER A — Pipeline** (attributed MQLs from LinkedIn sequence)

### Files created/updated
- `AMC_OS/CAMPAIGNS/LINKEDIN_7DAY_CALENDAR.md` — main deliverable
- `AMC_OS/INBOX/REV_SOCIAL_LINKEDIN.md` — execution handoff for social role

### One experiment queued (KAIZEN)
v2 trigger: if < 2 Diagnostic Call bookings after 7-day run, replace Days 3 + 7 with testimonial/mini-scorecard question format. Single variable change.

### Risks flagged
- Saturday/Sunday posts (Days 3–4) will have lower algorithmic reach — acceptable for consideration-phase content
- Booking link attribution requires consistent UTM discipline at publish time
- LinkedIn organic reach assumes account with ≥500 relevant ICP connections
