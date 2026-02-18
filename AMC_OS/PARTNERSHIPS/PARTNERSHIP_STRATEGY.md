# AMC Partnership Strategy (3-Tier)
**Owner:** REV_HEAD_OF_PARTNERSHIPS  
**Date:** 2026-02-18  
**Lever:** A — Pipeline  
**Status:** v1 (external-facing strategy draft)

## Assumptions
1. AMC sells the Compass Sprint as a short-form AI maturity assessment and roadmap service for teams shipping AI agents in production or near-production.
2. Existing delivery capacity supports 3–6 new partner-sourced pilots per quarter.
3. Partner outreach assumes publicly available business contacts/partner channels only (no paid lists or private contact scraping).
4. Revenue numbers below are **hypotheses for structuring conversations**, not commitments.

---

## TIER 1 — Tech Integration Partners
*Category: agent frameworks, LLM providers, observability / eval tooling*  
Goal: embed AMC in the stack where AI teams already evaluate, trace, and ship agents.

| # | Target | ICP Tag | Trigger | Integration value prop | Co-sell motion | Intro approach |
|---|---|---|---|---|---|---|
| 1 | **LangChain** | `ICP:framework-devs` | New enterprise AI platform work; agent quality incidents | Native AMC evaluation set for LangChain apps (trace → maturity score, governance gaps, reliability warnings) to turn subjective audits into measurable readiness metrics. | Co-market through LangChain Hub / blog + referral loop: AMC provides value-add pack for leads using LangChain at scale. | Send partnership one-pager to DevRel with a concrete proposal: publish `amc-evaluators` package + 1 webinar pilot. |
| 2 | **CrewAI** | `ICP:multi-agent-teams` | Multi-agent rollout in production pilots | Crew-specific rubric template for role separation, conflict resolution, escalation paths. | Co-deliver a “CrewAI Maturity Sprint” offering via CrewAI community channels and partner ecosystem list. | Community-first outreach to maintainer/founder with 1 implementation example and ask for demo slot. |
| 3 | **AutoGen** | `ICP:enterprise-experimentation` | Complex multi-agent orchestration with compliance requirements | Safety + oversight section mapped to AutoGen orchestrations; lower engineering overhead for governance readiness proofs. | Referral-based motion to Microsoft/AutoGen customers + optional technical partner plug-in published in examples gallery. | Open-source contribution first: AutoGen-compatible evaluator sample; then request partnership review call. |
| 4 | **LangSmith** | `ICP:trace-driven-teams` | Need structured evaluation in current tracing dashboards | Drop-in AMC evaluator + scorecards into LangSmith workflow; teams get audit-ready governance outputs with minimal process change. | Co-marketing with joint evaluation template and shared case walkthroughs; leads cross-referred when teams seek maturity benchmarking. | Publish a public evaluator package and pitch LangSmith product team with measurable pilot KPI: 30% fewer interpretation errors on scoring. |
| 5 | **Helicone** | `ICP:startup-ops` | Cost/reliability incidents and debugging complexity | AMC reads Helicone telemetry for cost, latency, error clustering into Compass quality dimensions. | Co-sell a “Observability → Readiness” workflow and include referral token in partner template outputs. | Contact founders/partnership email: propose an integration recipe + optional discount code on first pilot. |
| 6 | **Weights & Biases (W&B/Weave)** | `ICP:ML-engineering` | Model teams missing evaluation governance and handoff artifacts | Embed AMC rubric as a reusable Weave evaluation suite with audit-friendly scoring export. | White-box co-sell to AI teams already using W&B for model quality reviews and handoff to product. | Join W&B partner/developer channels with a public evaluation spec and request joint content placement. |
| 7 | **Anthropic** | `ICP:enterprise-llm-adopters` | Security/compliance review for Claude-powered copilots | Align AMC framework with Claude-focused safety and user trust practices; third-party evidence for enterprise decision-makers. | Referral/citation co-branding on “safe deployment readiness” assets; Anthropic customers can be routed to AMC for structured audits. | Apply through partnership channels with a short value memo and request “trusted readiness partner” discussion. |
| 8 | **OpenAI** | `ICP:marketplace-builders` | GPT-native startups need governance before scale | Offer AMC scoring templates compatible with OpenAI SDK + function-calling apps to standardize production readiness checks. | Co-marketing opportunities in startup ecosystem channels, community content and optional listing in partner ecosystem pages. | Submit structured partner proposal via OpenAI partner program with pilot case for one MCP/assistant use case. |
| 9 | **Portkey** | `ICP:agent-platform-ops` | Teams managing many LLM providers need governance abstraction layer | Add AMC scoring hooks into Portkey traces (provider latency, fallback quality, policy violations) to reduce risk blind spots. | Bundle AMC as optional readiness layer within Portkey implementation projects and referral revenue-sharing on activated pilots. | Pitch to integrations/BD lead with a concrete joint blueprint and 2-week implementation timeline. |
|10 | **Langfuse** | `ICP:developer-observability` | LLM apps need trace explainability and quality trend tracking | Ingest Langfuse traces for evidence-backed maturity scorecards tied to model behavior drift, regressions, prompt issues. | Offer co-developed dashboard template + inbound referral from Langfuse users who need governance depth before enterprise sales. | Post a Langfuse-compatible example to their repo/examples + request formal integration review. |

**Tier 1 KPIs (first 60 days):**
- 10 outreach attempts sent, 5 demos scheduled, 2 PoC pilots started, 1 integration package publicly published.

---

## TIER 2 — Channel Partners
*Category: AI consultancies, dev shops, systems integrators*  
Goal: create a repeatable referral-and-delivery flow where partners sell AMC as part of implementation packages.

| # | Target | ICP Tag | Trigger | Why they should resell/refer AMC | Co-sell motion | Revenue model (referral fee % / white-label option) | Intro approach |
|---|---|---|---|---|---|---|---|
| 1 | **Slalom** | `ICP:enterprise-transformation` | New AI adoption roadmaps and modernization programs | Adds a concrete assessment product to current transformation engagements; improves project confidence. | Joint discovery + AMC assessment in existing transformation workstreams; partner keeps client relationship, AMC provides scoring + QA. | 12% referral fee on first Sprint or 25% for full 5-day execution with AMC support; white-label scorecard available. | Position as “close-gap package” for digital transformation deals: share ICP and sample report template. |
| 2 | **Thoughtworks** | `ICP:custom-engineering-teams` | Clients needing governance before deployment | Strong alignment with engineering rigor and delivery best practices. | Partner-led workshops with AMC for client teams; AMC handles methodology and report quality while partner leads implementation. | 10% referral fee on first AMC engagement; 25% if partner rebrands white-label deliverable. | Use technical leadership language: “replace ad-hoc audits with reproducible Compass Sprint rubric.” |
| 3 | **Deloitte (AI/Cloud)** | `ICP:regulated-enterprise` | Governance-heavy deals in risk-sensitive sectors | Increases trust for AI audit requirements in regulated engagements; standardizes advisory narrative. | Referral from advisory teams to AMC for baseline assessments; co-branded governance package for regulated clients. | 8–12% referral fee due enterprise margins; white-label under advisory methodology preferred. | Approach via ecosystem/innovation teams with one-page value case + compliance mapping. |
| 4 | **Accenture** | `ICP:large-enterprise` | AI pilots moving from PoC to production | Helps bridge governance gap that often blocks pilot-to-production transitions. | Co-sell via delivery pods; AMC used as independent readiness gate before enterprise sign-off. | 8% referral fee; no white-label unless legal/commercial approved. | Route through AI practice enablement channel with metrics-backed use case and delivery SLA clarity. |
| 5 | **Capgemini** | `ICP:banking/telecom/retail` | Large SI accounts needing repeatable AI readiness framework | Reduces rework and increases confidence in AI implementation roadmaps. | Add AMC as a mandatory “readiness milestone” before launch in partner-managed programs. | 10% referral fee on AMC invoices; optional white-label package for partner-branded workshops. | Share “5-day Sprint” packaging and ask for pilot in one strategic account. |
| 6 | **Cognizant** | `ICP:platform-modernization` | Long implementation cycles and late-stage risk findings | Partner can de-risk projects by attaching AMC before UAT/go-live review. | Bundle AMC with transformation services; partner receives lead and optional delivery share. | 12% referral fee; white-label allowed in partner proposals after QA alignment. | Approach ops enablement lead with specific proposal: “one Sprint before client UAT.” |
| 7 | **Infosys** | `ICP:outsourced-enterprise-builders` | High-volume client programs needing standardized AI governance | AMC becomes scalable template for many teams, lowering consultant load. | Co-serve model: local partner delivery + AMC scoring + executive readout. | 10–15% referral fee; partner-branded execution with AMC quality backstop. | Use language of consistency: “same rubric used across all client pods.” |
| 8 | **Wipro** | `ICP:global-enterprise` | Complex multi-country AI initiatives with audit requirements | Speeds internal readiness decisions by providing documented maturity metrics for leadership boards. | Add AMC as a standard pre-sales artifact and implementation checkpoint. | 8% referral fee (pilot-to-pilot escalation); 20% white-label margin on packaged offerings. | Ask for pilot with one geography team and present governance checklist for faster board approval. |
| 9 | **EPAM** | `ICP:product-engineering-leaders` | Scale teams lacking formal AI-readiness controls | AMC provides audit-ready outputs and execution roadmap in native software delivery cadence. | Joint sales motion in digital transformation + AI engineering accounts; partner can upsell during architecture/design phase. | 10% referral fee; optional white-label “partner portal” delivery collateral. | Outreach to AI practice lead with a proposed discovery call on 2 reference account archetypes. |
|10 | **Tata Consultancy Services (TCS)** | `ICP:large-enterprise` | Need for repeatable governance in multi-vendor AI ecosystems | Strong ICP fit across sectors; AMC can be offered as independent validation layer in systems integration work. | Partner-led implementation + AMC readiness validation before production cutover. | 12% referral fee; white-label feasible with approved templates and data handling policy alignment. | Introduce via partner ecosystem director with ROI framing (reduced audit comments, clearer go-live criteria). |

**Tier 2 KPIs (first 90 days):**
- 10 partner intros, 4 qualified demos, 2 signed MOUs/Pilot letters, 1 retained referral channel active.

---

## TIER 3 — Referral Partners
*Category: VCs, accelerators, AI communities (portfolio referral networks)*  
Goal: generate warm inbound from trusted ecosystem institutions.

| # | Target | ICP Tag | How they'd refer AMC to portfolio | Value to them | Intro approach |
|---|---|---|---|---|---|
| 1 | **a16z** | `ICP:early-to-growth-stage-AI` | Share AMC with portfolio startups during model-governance or AI infrastructure workstream review. | Adds non-intrusive governance partner; improves portfolio readiness for enterprise fundraising/scale. | Request intro to “AI/portfolio support ops” with a 1-page framework on common diligence questions. |
| 2 | **Y Combinator (YC)** | `ICP:seed-stage-ai-builders` | Incorporate AMC in startup-onboarding materials and “scale-up checkpoints.” | Increases startup success signals (less rework, clearer customer-facing readiness claims). | Use founder network channel with concise founder-to-founder tone: “we de-risk go-live decisions in 5 days.” |
| 3 | **Sequoia Scout** | `ICP:pre-seed-to-seriesA` | Offer AMC in scout-sourced deal support notes and partner referrals. | Gives Scout cohorts a practical risk framework useful during first enterprise outreach. | Ask directly for participation in next Scout community office-hours or Slack channel sharing. |
| 4 | **Techstars AI** | `ICP:accelerator-cohorts` | Insert AMC as optional office-hour resource in demo days and cohort check-ins. | Helps portfolio defend production claims and avoid avoidable reliability issues before launch. | Offer a structured demo-ready session: “Readiness score in 15 minutes” + community follow-up. |
| 5 | **NVIDIA Inception Program** | `ICP:hardware-heavy/infra-heavy-AI` | Refer AI startup participants building on infra-heavy stacks before commercialization. | Adds business-readiness layer that complements technical scaling support. | Contact portfolio/community manager with a one-slide co-sell brief and pilot eligibility criteria. |

**Tier 3 KPIs (first 90 days):**
- 5 ecosystem introductions requested, 15 warm referrals captured, 3 portfolio intros in active follow-up.

---

## Common Partnership Pitch Email (Single adaptable template)

**Subject:** Quick idea to make your AI delivery easier and more enterprise-ready

Hi **[Name]**,

I’m reaching out from **AMC** because we help teams turn AI quality and readiness from “gut feel” to a measurable scorecard your leadership teams can act on.

We currently work with teams building AI agents/tools to run a **5-day Compass Sprint** that produces:
- A concise maturity score across reliability, safety, oversight, and evidence quality
- A prioritized execution roadmap (30/60/90)
- A leadership-ready summary suitable for internal reviews and client discussions

I think this could fit your business in this way:
- **For [Tier 1 / Tier 2 / Tier 3 partner type],** we can **[integrate this into your stack / embed in your consulting offering / add as a trusted portfolio recommendation]**
- We can start with a low-risk pilot: no long commitments, specific outcomes, and a 2-week review loop

Would a short call this week make sense? If helpful, I can share a tailored 1-page flow for how this could work for your team and first 3 target use cases.

Best,
[Your name]  
AMC Partnerships

**Adaptation notes:**
- **Tier 1**: replace line 1 with “into your product/developer workflow” and “co-built integration template.”
- **Tier 2**: replace line 1 with “for your client project pipelines” and “joint delivery model.”
- **Tier 3**: replace line 1 with “for your portfolio growth support” and “non-invasive founder advisory.”

---

## Files created/updated
- `AMC_OS/PARTNERSHIPS/PARTNERSHIP_STRATEGY.md`

## Acceptance checks
1. **Coverage:** Includes exactly 10 Tier 1, 10 Tier 2, and 5 Tier 3 targets.
2. **Required fields:** Every partner row includes integration value prop, co-sell/refer mechanics, and intro approach.
3. **Actionability:** Every row contains a trigger tag and next step or outreach framing.
4. **Template:** One reusable pitch email included with clear per-tier adaptation instructions.
5. **Assumptions:** Explicitly labeled and separated from facts.

## Next actions
1. Assign owners and send ownership map into `LEADS/` (or CRM) with one tag per tier.
2. Prioritize top 3 from each tier and run outreach week 1 (10 total personalized touches).
3. Build partner-specific one-pagers for Tier 1 integration assets and publish templates.
4. Track partner conversations in CRM under `partner_tier` (`1-tech`, `2-channel`, `3-referral`).
5. Review partner motion assumptions after 30 days and update fee ranges after first two pilot discussions.

## Risks/unknowns
- Some listed large SIs (e.g., Accenture/Deloitte) may require slow legal/commercial cycles; use only low-friction intro motion initially.
- Reputational risk if integration claims overpromise performance; require legal/compliance review before any external messaging.
- Revenue percentage assumptions are directional; rates may need adjustment by company size and delivery model.
- Contact data for listed enterprises may require formal partnership channels and long lead times.
- Tier 3 portfolios vary in sector focus; referral quality likely uneven without strict fit scoring (`ICP + stage + urgency`).
