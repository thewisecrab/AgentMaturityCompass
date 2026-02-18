# AMC 7-Day Free Trial — Product Spec
**Decision date:** 2026-02-18  
**Status:** Approved — pending implementation

---

## What It Is
A self-serve, no-credit-card 7-day trial that lets any team run AMC on their own AI agents and get a real maturity score with gaps identified.

## Compatible Runtimes
- **OpenClaw agents** (primary — native integration)
- **Claude / Claude Code** (Anthropic-hosted)
- **OpenAI agents** (GPT-4o, Assistants API, custom GPTs)
- **LangChain / LangGraph** deployments
- **CrewAI / AutoGen / custom multi-agent systems**
- **Any agent with logs, a system prompt, and observable behavior**

---

## Trial Flow

### Day 0 — Signup & Intake
1. User signs up (email only, no CC)
2. Completes 15-min self-assessment questionnaire (6 dimensions, ~5 questions each)
3. Uploads or describes 1-3 evidence artifacts (system prompt, log sample, architecture doc)
4. Gets **instant maturity score** — overall index + dimension breakdown

### Day 1-6 — Explore
- Access to full scorecard with L1-L4 position per dimension
- Gap analysis: top 3 risks, top 3 opportunities
- Basic recommended actions (what to fix, in what order)
- Benchmarks: how they compare to typical L1/L2/L3 teams (directional)
- Daily email: one insight or tip per day based on their lowest-scoring dimension

### Day 7 — Decision Moment
- Full readout email: "Here's what we found. Here's what's at risk. Here's the roadmap."
- CTA: **Book a Compass Sprint** ($5k) — expert-guided implementation of the roadmap
- Secondary CTA: **Book a free 20-min call** to discuss findings
- Tertiary: **Stay on free tier** (score only, no roadmap implementation support)

---

## What Trial Gets vs. Paid

| Feature | 7-Day Trial | Compass Sprint ($5k) |
|---|---|---|
| Self-assessment questionnaire | ✅ | ✅ |
| Maturity score (all 7 dimensions) | ✅ | ✅ |
| Gap identification | ✅ | ✅ |
| Evidence review | Self-reported | Expert-verified |
| Roadmap | Basic (top 3 actions) | Full 90-day prioritized roadmap |
| Implementation guidance | None | 5-day expert sprint |
| Readout presentation | Email only | Live Day 5 readout call |
| Evidence pack (auditable) | None | Full artifact ledger |
| Retainer pathway | None | Documented at Day 5 |

---

## Viral Mechanics

### Built-in Sharing Triggers
1. **Score badge**: "I ran AMC on my agent. Score: L2.1/L4. See where yours stands →"
2. **Comparison hook**: "My agent scored higher on Security than 73% of teams" (once benchmark data exists)
3. **Publish your score**: Option to share assessment publicly (opt-in) — creates social proof + inbound

### Distribution Channels (trial launch)
- **Product Hunt**: Launch as "Free AI Agent Maturity Score" — hook: "Find out if your agent is actually production-ready"
- **HN Show HN**: "I built a maturity framework for AI agents and ran it on myself first"  
- **Reddit** (r/LocalLLaMA, r/MachineLearning, r/AIAssistants): Share self-assessment results authentically
- **LinkedIn**: "We ran AMC on our own agent before asking you to. Score: L2.0/L4. Here's what we found."
- **Discord/Slack communities**: Drop in LangChain, AI Engineer, Latent Space communities

### The Satanic Pope Angle (AMC-on-AMC)
Lead story: *"An AI agent built a maturity framework for AI agents. Then it ran the framework on itself. Score: L2.0/L4. Here are the gaps."*
- Links to published self-assessment
- "Now run it on your agent" CTA
- Authentic, self-aware, non-corporate — exactly what these communities respect

---

## Conversion Targets
- Trial signup → Day 7 CTA click: **30%**
- Day 7 CTA → call booked: **15%**
- Call booked → Sprint closed: **40%**
- Implied: **100 trial signups → ~2 Sprint closes → $10,000**

---

## Implementation Notes (Minimum for Launch)
- **v1 can be fully manual**: Typeform intake → Airtable scoring → email delivery → Calendly CTA
- No code required for first 20 trials — pure process
- Automate once pattern is validated (use ops automation roadmap)
- Time to launch: **3-5 days** if manual approach

---

## Next Actions
1. Build Typeform questionnaire (30 questions across 6 dimensions)
2. Create scoring spreadsheet (auto-calculates L1-L4 from responses)
3. Write 7-day email sequence (Day 0 welcome + score, Days 1-6 insights, Day 7 readout)
4. Set up Calendly for Compass Sprint booking
5. Launch on Product Hunt + HN simultaneously

*Files: AMC_OS/PRODUCT/TRIAL_TIER_SPEC.md*  
*Next: build the questionnaire and email sequence*
