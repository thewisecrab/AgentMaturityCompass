# LinkedIn 7-Day Post Calendar
**Campaign:** G4 — Structured LinkedIn Sequence  
**Owner:** REV_SOCIAL_LINKEDIN + REV_COPYWRITER_DIRECT_RESPONSE  
**Week:** Thu 2026-02-19 → Wed 2026-02-25  
**Single CTA:** Book a 20-min Diagnostic Call  
**Audience:** AI product teams, engineering leads, CTOs, AI agency founders  
**Lever:** A — Pipeline (attributed MQLs from LinkedIn)  
**Primary KPI:** Qualified leads (Diagnostic Call bookings) attributable to this sequence  
**Guardrail KPI:** Negative feedback rate (hide/unfollow/spam)

---

## Campaign Logic

The 7 posts form a structured funnel sequence — not 7 standalone posts.

| Phase | Days | Goal |
|---|---|---|
| Establish authority / disrupt assumption | Days 1–2 | Awareness |
| Deepen the problem / build credibility | Days 3–5 | Consideration |
| Offer the solution / drive action | Days 6–7 | Conversion |

Each post uses a different engagement angle to avoid repetition and maximize reach across feed algorithm cycles.

**UTM tag to append to all CTA links:**  
`?utm_source=linkedin&utm_medium=organic&utm_campaign=g4_diagnostic&utm_content=day[N]`

---

## Post Schedule

---

### Day 1 — Thu 2026-02-19
**Goal:** Awareness  
**Engagement angle:** Hot take  
**Theme:** Deployment failure / the "live ≠ safe" gap

---

**HOOK:**
> Shipping your AI agent is not the same as deploying it safely.

**BODY:**

There's a distinction most teams miss — and it costs them months.

"We shipped it" means the agent runs.

"We deployed it safely" means:

→ Failure modes are documented and handled  
→ Human oversight is designed in — not bolted on after the first incident  
→ Evidence quality is high enough that operators can actually trust outputs  
→ Escalation paths exist and work under realistic load  

Most AI teams have done the first thing.

Very few have done the second.

This isn't a knock on speed — shipping fast matters. But the gap between "live" and "production-mature" is exactly where trust erodes, incidents happen, and roadmaps stall.

The teams that close this gap consistently do one thing differently: they establish a scored maturity baseline before they scale.

They know where they stand. They know what to build next. They're not guessing.

**CTA:**
> If you're not sure where your agent actually stands — that's what a 20-min Diagnostic Call is for. Link in comments.

---

### Day 2 — Fri 2026-02-20
**Goal:** Awareness  
**Engagement angle:** Insight  
**Theme:** Maturity scoring — defining "production-ready"

---

**HOOK:**
> Most AI teams have no shared definition of "production-ready." That's not a communication problem. It's a risk.

**BODY:**

Not "the agent works."  
Not "we ran evals."  
Not "it's been in staging for two weeks."

I mean a shared, scored, defensible definition of what production-ready actually means — specific to your context, agreed on by engineering, product, and leadership.

Without that, you're not making a decision. You're making a bet.

Here's what the score actually covers at the maturity level that matters:

→ **Reliability** — consistent performance under edge cases and load variation  
→ **Operator trust** — humans calibrated correctly on when to override  
→ **Oversight design** — built in, not patched in  
→ **Evidence quality** — outputs traceable when something goes wrong  
→ **Governance** — documented policy for escalation, halt, and retrain triggers  

Most teams can check 2 of 5 with confidence.

The other 3 are where incidents live.

**CTA:**
> Want to see where your agents score? A 20-min Diagnostic Call is the fastest way to find out which dimensions are at risk. Link in comments.

---

### Day 3 — Sat 2026-02-21
**Goal:** Consideration  
**Engagement angle:** Story  
**Theme:** Deployment failure pattern — the 4-phase stall

---

**HOOK:**
> I keep seeing the same 4-phase pattern in AI teams that shipped something real — and then stalled.

**BODY:**

It goes like this:

**Phase 1:** Build. It works. Team is pumped.

**Phase 2:** Ship. Users engage. Leadership wants more.

**Phase 3:** Something breaks. Not catastrophically — but enough. An escalation that slipped through. An output users stopped trusting. A governance gap that surfaced at exactly the wrong moment.

**Phase 4:** Roadmap stalls. Engineering is firefighting. The question in every meeting: "How did we not see this?"

The answer is almost always the same.

No maturity baseline. So no map of where the gaps were — in reliability, oversight design, evidence quality, governance — before they scaled.

This pattern isn't about bad engineering. It's about a missing diagnostic step that most teams skip because it doesn't feel urgent until it is.

Every team I talk to at Phase 3 says the same thing: they wish they'd scored their maturity before they scaled.

Phase 0 doesn't have to be slow. It can be 5 days.

**CTA:**
> If your team is between Phase 1 and Phase 3, a 20-min Diagnostic Call can tell you which gaps to close before they close you. Link in comments.

---

### Day 4 — Sun 2026-02-22
**Goal:** Consideration  
**Engagement angle:** Question  
**Theme:** Governance gaps / escalation design

---

**HOOK:**
> Who on your team owns the decision of when your AI agent acts vs. escalates? If the answer lives in a system prompt, read this.

**BODY:**

A system prompt rule is not an escalation policy.

An escalation path is a complete set of answers:

→ What triggers escalation? *(edge case definition)*  
→ Who receives the escalated output? *(role clarity)*  
→ What do they do with it? *(operator protocol)*  
→ What happens if they're unavailable? *(fallback design)*  
→ How is this logged, reviewed, and improved? *(evidence quality)*  

Most AI teams have answered the first question.

Very few have answered all five.

That gap — between "we have a rule" and "we have a governed escalation path" — is one of the most common maturity gaps in agent deployments.

It's not a hard fix. But you have to know it exists first.

This week: ask your team this question out loud. See what surfaces.

Then check if the answers are documented anywhere — or if they're in someone's head.

**CTA:**
> Not sure if your escalation design holds up under scrutiny? That's exactly what we look at in a 20-min Diagnostic Call. Link in comments.

---

### Day 5 — Mon 2026-02-23
**Goal:** Consideration  
**Engagement angle:** Proof (evidence-framed, compliant)  
**Theme:** What maturity assessments actually reveal

---

**HOOK:**
> The maturity gaps that matter most are rarely the ones your team is already tracking.

**BODY:**

This is a pattern we observe consistently in structured agent assessments.

Teams come in focused on a specific concern — eval accuracy, latency, model drift, something they've already noticed.

They leave with a prioritized gap list — and the highest-priority items are almost never what they came in worried about.

The gaps that surface most often:

→ Oversight design that *assumes* humans will catch errors — but the humans aren't calibrated to know when to intervene  
→ Evidence quality gaps that make post-incident tracing extremely slow or impossible  
→ Governance decisions living in one person's head, not in any document  
→ Trust calibration mismatches — operators either over-trust the agent or have quietly stopped relying on it  

None of these are exotic engineering problems. They're just not visible without a structured diagnostic.

The teams that surface them before scaling ship with more confidence and stall far less often in production.

*(These are directional observations from assessment practice. Specific gaps and outcomes vary by team and context.)*

**CTA:**
> Want to know which gaps are most likely hiding in your agent stack right now? Book a 20-min Diagnostic Call. Link in comments.

---

### Day 6 — Tue 2026-02-24
**Goal:** Conversion  
**Engagement angle:** Framework  
**Theme:** The 5 maturity dimensions + Compass Sprint offer

---

**HOOK:**
> 5 dimensions every AI agent should be scored on before you scale it. Most teams cover 2.

**BODY:**

If you don't have a scored baseline, you're scaling blind.

Here's what the score covers:

**1. Reliability**  
Consistent performance under realistic load, edge cases, and input variation — not just the happy path.

**2. Operator trust calibration**  
Are the humans working with your agent correctly calibrated on when to question it, override it, or trust it?

**3. Oversight design**  
Built into the workflow architecture — or added on after the first incident?

**4. Evidence quality**  
Can you trace, explain, and audit outputs when something goes wrong — or is the agent a black box to your own team?

**5. Governance**  
Documented policy for escalation, retraining triggers, and deployment decisions — or does it live in someone's head?

Score yourself honestly.

If you're at "partially addressed" on more than two of these, that's a gap worth closing before you scale further.

We run a 5-day Compass Sprint that scores your agents across all five dimensions and hands you a prioritized execution roadmap. Fixed scope. Fixed price. Kickoff within 48 hours of approval.

**CTA:**
> Start with a free 20-min Diagnostic Call — we'll tell you exactly which dimensions need the most attention for your specific context. Link in comments.

---

### Day 7 — Wed 2026-02-25
**Goal:** Conversion  
**Engagement angle:** Hot take + Direct offer  
**Theme:** The accountability frame — "you'd never do this elsewhere in your stack"

---

**HOOK:**
> You wouldn't scale an untested system anywhere else in your stack. Why is your AI agent the exception?

**BODY:**

Engineering leads know this instinctively: you don't scale before you understand the failure modes.

But with AI agents, most teams make an exception. They ship, then scale, then figure out reliability, oversight, and governance on the fly — because the pressure to move is real.

The cost of that exception stays hidden until it isn't.

A governance gap surfaces at the worst time. An oversight design flaw leads to an incident that takes three weeks to diagnose. A trust calibration mismatch means operators have quietly stopped relying on the agent — and nobody flagged it.

The fix isn't slower shipping. It's a scored maturity baseline *before* you scale.

You know the failure modes. You know the gaps. You build with a map.

We built the Compass Sprint for exactly this moment — after the first ship, before the scale. 5 days. You leave with a scored maturity baseline, a gap analysis, and a prioritized roadmap your team can run on starting Monday.

**CTA:**
> Book a 20-min Diagnostic Call — no commitment, just clarity on where your agents actually stand. Link in comments. Or drop "DIAGNOSTIC" below and I'll reach out directly.

---

## Execution Checklist (per post)

- [ ] UTM tag appended to booking link (`?utm_source=linkedin&utm_medium=organic&utm_campaign=g4_diagnostic&utm_content=day[N]`)
- [ ] Booking link added as first comment (not in post body — LinkedIn suppresses reach for external links in body)
- [ ] Posted at optimal time: 7–9 AM or 12–1 PM in target audience's timezone (recommend EST/IST split test)
- [ ] Hashtags added (recommended: `#AIAgents #MLOps #AIGovernance #AgentReliability #AIProduct` — max 3–4 per post)
- [ ] Response to comments within 2 hours of posting (boosts algorithmic reach)
- [ ] Screenshot of engagement saved for SCOREBOARD weekly read

---

## Sequence Map (at a glance)

| Day | Date | Goal | Angle | Theme |
|---|---|---|---|---|
| 1 | Thu Feb 19 | Awareness | Hot take | Live ≠ safe: the deployment maturity gap |
| 2 | Fri Feb 20 | Awareness | Insight | Defining production-ready across 5 dimensions |
| 3 | Sat Feb 21 | Consideration | Story | The 4-phase stall pattern |
| 4 | Sun Feb 22 | Consideration | Question | Escalation ownership and governance gaps |
| 5 | Mon Feb 23 | Consideration | Proof | What assessments actually surface (directional) |
| 6 | Tue Feb 24 | Conversion | Framework | Score your agents — the 5 dimensions |
| 7 | Wed Feb 25 | Conversion | Hot take + Direct | Scale only after you have a map |

---

## Compliance Checks (mandatory — TOOLS.md)

- ✅ No guaranteed outcomes or revenue claims
- ✅ No fabricated case studies or specific client results attributed
- ✅ "Directional observations" language used on Day 5 (proof post) — results-vary disclaimer included
- ✅ All proof framing uses "we observe," "teams commonly discover," "pattern we see" — not "our clients achieved X"
- ✅ Forbidden phrases from Brand Messaging Guide avoided (no "cutting-edge," "transformative," "leverage AI," "seamlessly," "robust," "holistic," "guaranteed," "risk-free")
- ✅ CTA is consistent and single across all 7 posts: Book a 20-min Diagnostic Call

---

## v2 Plan (if G4 underperforms)

**Trigger:** < 2 Diagnostic Call bookings attributable to this sequence after 7-day run.

**Single variable to change for v2:** Replace Day 3 (Story) and Day 7 (Hot take) with two direct testimonial/observation posts that include a mini-scorecard question in the post body, driving comment engagement as a soft lead capture before hard CTA.

**Keep:** Hook style (all hooks proved strong in outreach copy), the 5-dimension framework, the UTM tracking structure.

---

## Peer Review

**Reviewer role:** REV_BRAND_MESSAGING (messaging compliance) + REV_HEAD_OF_GROWTH (funnel logic)  
**Review path:** `AMC_OS/INBOX/REVIEWS/LINKEDIN_7DAY_CALENDAR__review.md`  
**Review SLA:** Before Day 1 publish (by EOD Wed Feb 18)

---

## Output Standard

**Files created/updated:**
- `AMC_OS/CAMPAIGNS/LINKEDIN_7DAY_CALENDAR.md` ← this file

**Acceptance checks:**
- [ ] 7 posts present, one per day, with date labels ✅
- [ ] Each post has: hook, body (≤200 words), CTA, goal, engagement angle ✅
- [ ] Mix of post types: hot take (×2), insight (×1), story (×1), question (×1), proof (×1), framework (×1) ✅
- [ ] Single consistent CTA across all 7 posts: Book a 20-min Diagnostic Call ✅
- [ ] Funnel progression: Awareness (Days 1–2) → Consideration (Days 3–5) → Conversion (Days 6–7) ✅
- [ ] Voice: authoritative, sharp, no corporate fluff — Brand Messaging Guide followed ✅
- [ ] Compliance: no guaranteed outcomes, no fabricated case studies, directional-only proof framing ✅
- [ ] Forbidden phrases audit: clean ✅
- [ ] UTM discipline documented ✅
- [ ] v2 plan present ✅
- [ ] Peer review assigned ✅

**Next actions:**
1. Submit to REV_BRAND_MESSAGING for compliance review before Day 1 publish
2. Add booking link (with UTM) to CTA comment template for each post
3. Schedule posts in LinkedIn native scheduler or approved tool (7:30 AM EST recommended)
4. Set up engagement monitoring: reply to every comment within 2 hours for algorithmic boost
5. Mid-sequence read at Day 4: if reach < 500 impressions/post, adjust hashtag set and repost time

**Risks/unknowns:**
- LinkedIn organic reach is variable; 7-day sequence may not reach critical mass without initial engagement velocity on Day 1
- Saturday/Sunday posts (Days 3–4) will likely see lower reach — acceptable for consideration-phase content that doesn't need immediate conversion
- Booking link attribution depends on consistent UTM use — requires ops discipline at publish time
- No existing follower baseline documented; sequence assumes account with at least 500 relevant connections in target ICP segments
