# PRODUCT DEFINITION

## Product
AMC is an **assessment + operating system** that measures and improves AI-agent maturity across:
- Governance
- Security
- Reliability
- Evaluation
- Observability
- Cost
- Operating model

The system converts evidence artifacts into a defensible maturity score and a prioritized, time-bound improvement plan.

## Target user and buyer
- **Primary user:** AI/Engineering/Ops leads running agent workflows
- **Economic buyer:** CTO/CISO/COO (or equivalent)
- **Key jobs-to-be-done:**
  1. Baseline current AI-agent maturity quickly
  2. Prove findings with auditable evidence
  3. Prioritize highest-impact remediation work
  4. Track maturity velocity over recurring cycles

## Core outcomes (what customers buy)
1. **Maturity score** by domain + overall index
2. **Evidence confidence** (coverage + freshness + verification status)
3. **Prioritized roadmap** (impact/confidence/effort + owner + due date)
4. **Recurring improvement cadence** (re-assessment and trend tracking)

## Product principles
1. **Evidence over opinion** — every score must map to artifacts
2. **Actionable by default** — each finding must produce a next step
3. **Auditable and repeatable** — same inputs should produce same score
4. **Fast to first value** — Day0 setup, meaningful baseline within first week

## Day0–Day25 sequencing (product delivery plan)

### Day0 (Foundation)
**Goal:** install scoring model, workflow skeleton, and data contracts.
- Define domain rubric and scoring weights
- Define evidence artifact schema and confidence rubric
- Define workflow states (draft, submitted, verified, scored)
- Create backlog with acceptance criteria + sequencing

**Day0 acceptance criteria**
- Scoring rubric documented for all 7 domains
- Evidence schema documented with required/optional fields
- Workflow state machine documented and versioned
- Backlog items mapped to Day1–Day25 milestones

### Day1–Day5 (Baseline MVP)
**Goal:** complete first end-to-end assessment flow.
- Guided assessment workflow (inputs → domain scoring)
- Evidence vault with artifact upload/metadata/verification status
- Initial score computation + confidence indicator
- First roadmap generator (ranked recommendations)

**Exit criteria by Day5**
- User can complete one full assessment without manual intervention
- Every scored control links to at least one evidence record (or explicit gap)
- Roadmap exports top 10 prioritized actions with owner and target date
- Time-to-baseline: <= 90 minutes for a new workspace

### Day6–Day15 (Decision-grade product)
**Goal:** make outputs reliable for leadership decisions.
- Add assessor/reviewer roles + approval checkpoints
- Add audit trail for score/evidence changes
- Add dashboard: domain score, confidence, open risks
- Add trend tracking for repeated assessments

**Exit criteria by Day15**
- Reviewer approval required before final score publish
- Audit trail available for all scoring-impacting edits
- Dashboard shows current score + delta vs previous run
- Confidence score decomposed into coverage/freshness/verification

### Day16–Day25 (Scale + operationalization)
**Goal:** improve repeatability, speed, and org adoption.
- Templates/playbooks for common remediation actions
- Notification cadence for stale evidence and due actions
- Benchmarking cohort views (team/program comparisons)
- Readiness package export (exec summary + evidence appendix)

**Exit criteria by Day25**
- Re-assessment cycle can be launched from prior run in <= 15 minutes
- Stale evidence alerts operational with configurable thresholds
- Benchmark view supports at least 3 comparison slices
- Executive export generated in one click with traceable evidence links

## Non-goals (Day0–Day25)
- Deep custom policy engine for every regulatory framework
- Fully automated evidence ingestion from every third-party tool
- Prescriptive legal/compliance guarantees

## Assumptions
- Initial customers can provide at least minimal evidence artifacts
- Buyer values auditable scoring over opaque AI recommendations
- A recurring 2–4 week reassessment cadence is operationally feasible
