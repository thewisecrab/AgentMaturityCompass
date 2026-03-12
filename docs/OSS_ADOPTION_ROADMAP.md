# OSS Adoption Roadmap — AMC

A ruthless plan to make AMC easier to try, easier to adopt, and easier to keep.

## Goal

Move AMC from "impressive project" to "default trust layer teams actually install and keep using."

That means optimizing for:

1. **Time to first value** — first score, fast.
2. **Time to real integration** — connect to an actual agent without pain.
3. **Time to retained use** — observability, alerts, datasets, reports, and CI so it becomes part of the workflow.

---

## What AMC already has that should be marketed harder

AMC is no longer just a scoring CLI.

It already has meaningful product depth:

- evidence-backed trust scoring
- cryptographic evidence chains
- framework adapters
- quickscore + badge sharing
- assurance / red-team runs
- compliance reports and audit binders
- observability timelines and anomaly views
- trace inspection
- human correction tracking
- golden datasets
- lite scoring for non-agent LLM apps
- business KPI correlation
- leaderboards
- AI asset inventory
- communications policy checking

The immediate docs/site problem was simple: **the product had outrun the public story**.

---

## Prioritization framework

### Tier 1 — Highest leverage, lowest friction
Do these first.

#### 1) Make "try AMC" brutally simple
**Why:** adoption dies when setup feels like a tax.

**Ship / improve:**
- one obvious install path in README (`npx ... quickscore` first, everything else second)
- single canonical quickstart page
- interactive `amc quickstart` / `amc doctor` promoted everywhere
- a browser playground / sandbox as the no-install path

**Success metric:**
- visitor can get a score in under 2 minutes
- visitor can understand next step in under 30 seconds

#### 2) Reposition homepage around workflow, not just theory
**Why:** people adopt tools that solve a workflow, not tools with good philosophy.

**Homepage narrative should be:**
- Score
- Trace
- Red-team
- Monitor
- Improve
- Certify

**Success metric:**
- homepage explains what AMC does beyond quickscore
- new capabilities visible above the fold or in primary feature grid

#### 3) Create opinionated starter blueprints
**Why:** templates beat docs.

**Blueprints to ship:**
- OpenClaw + AMC secure baseline
- LangChain RAG + AMC baseline
- CrewAI + AMC + GitHub Actions baseline
- generic OpenAI-compatible app + AMC baseline

Each should include:
- architecture diagram
- exact commands
- threat model covered
- expected outputs

**Success metric:**
- one-command or one-compose-up reproducible demo

#### 4) Publish compatibility matrix
**Why:** teams want known-good combinations, not vibes.

**Matrix should cover:**
- frameworks
- model providers
- eval tools
- CI targets
- OS/runtime support

**Success metric:**
- fewer pre-adoption questions
- easier enterprise trust review

---

## Tier 2 — Retention and real workflow embedding

#### 5) Promote datasets, lite-score, and trace as first-class features
**Why:** quickscore gets attention; repeat usage comes from deeper workflows.

**Make obvious in docs and README:**
- `amc dataset create`
- `amc dataset run`
- `amc lite-score`
- `amc trace inspect`
- `amc observe timeline`
- `amc business kpi`

**Success metric:**
- users move from one-off scoring to ongoing evaluation

#### 6) Add "recommended journey" docs by persona
**Why:** security lead, AI engineer, and founder want different entry points.

**Suggested pages:**
- For AI engineers
- For security teams
- For compliance / audit teams
- For OSS maintainers

**Success metric:**
- lower cognitive load
- better conversion from interest to adoption

#### 7) Public benchmark / leaderboard story
**Why:** social proof matters, and leaderboards are shareable.

**Ship:**
- benchmark methodology page
- public leaderboard export example
- README badge flow
- "Who uses AMC" section

**Success metric:**
- more organic sharing
- more README embeds and public references

#### 8) Strong security posture page
**Why:** open source security tools are judged by how seriously they take their own security.

**Ship / improve:**
- SECURITY.md
- disclosure process
- dependency scanning badges
- code scanning badges
- hardening guide for deployment

**Success metric:**
- less enterprise hesitation
- stronger trust with security-conscious adopters

---

## Tier 3 — Ecosystem growth

#### 9) Plugin / pack ecosystem
**Why:** ecosystems compound; core teams do not.

**Ship:**
- pack author template
- versioned plugin interface docs
- example community pack repo
- curated pack registry or awesome list

**Success metric:**
- external contributors create useful packs without handholding

#### 10) Teaching-tool motion
**Why:** if AMC becomes what people learn on, adoption gets a free flywheel.

**Ship:**
- labs: insecure agent → scored → hardened → rescored
- instructor kit
- workshop scripts
- short curriculum modules

**Success metric:**
- use in workshops, bootcamps, or internal enablement

#### 11) Org adoption kit
**Why:** dev virality opens the door; budget approval still wants a neat packet.

**Ship:**
- 1-page CISO/CTO brief
- 2-week pilot guide
- sample rollout plan
- stakeholder FAQ

**Success metric:**
- easier internal championing

---

## Concrete README changes recommended

README should have this order:

1. one-line value proposition
2. install / try now
3. 60-second example
4. what AMC does
5. who it is for
6. core workflows
7. integrations / compatibility
8. deeper docs
9. proof / tests / security
10. contribution / community

### Core workflows section should explicitly include:
- Quickscore
- Wrap an agent
- Run assurance packs
- Inspect traces
- Create datasets
- Run lite scoring
- Business KPI reporting
- Compliance / audit exports

---

## Concrete website changes recommended

## Homepage
Already improved, but continue toward:
- clearer workflow sections
- "Start here" for three personas
- proof strip that links to docs
- deeper demo covering trace + dataset + leaderboard

## Docs IA
Recommended top-level docs nav:
- Getting Started
- Core Workflows
- CLI Reference
- Adapters
- Compliance & Audit
- Observability
- Datasets & Benchmarks
- Business & ROI
- Deployment & Security

---

## What to build now vs later

### Build now
- docs refresh
- website refresh
- compatibility matrix
- starter blueprints
- SECURITY.md / hardening story
- persona-based onboarding pages

### Build next
- browser sandbox
- public leaderboard examples
- pack author template
- org pilot kit

### Build later
- full pack registry
- instructor program
- broader public benchmark ecosystem

---

## Recommended message discipline

AMC should be described as:

**"The evidence-backed trust layer for AI agents and LLM apps."**

Not just:
- a maturity model
- a scoring framework
- a compliance tool

Because it is now broader than that.

The sharper framing is:

- **Score** trust maturity
- **Trace** what actually happened
- **Stress-test** with assurance packs
- **Monitor** drift and anomalies
- **Improve** using datasets, corrections, and guidance
- **Prove** posture with compliance and audit artifacts

That story is much stronger.

---

## Immediate next actions

1. Refresh README to reflect the expanded workflow story.
2. Add compatibility matrix doc.
3. Add starter blueprint docs/examples.
4. Add SECURITY.md + deployment hardening guide if missing.
5. Add persona landing pages in docs.
6. Consider a lightweight browser sandbox / hosted demo.

---

## Definition of success

AMC becomes OSS-friendly when a new user can:

- understand the value in 15 seconds
- get a score in 2 minutes
- connect a real agent in 10 minutes
- see a useful trace or dataset result in 20 minutes
- generate a stakeholder artifact in the first session

If those five things happen, adoption gets much less theoretical and much more inevitable.
