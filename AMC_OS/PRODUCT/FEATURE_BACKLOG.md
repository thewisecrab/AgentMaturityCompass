# FEATURE BACKLOG

Backlog is sequenced for **Day0–Day25** and prioritized by delivery dependency + customer value.

## Priority legend
- **P0** = required for first usable product outcome
- **P1** = required for decision-grade reliability
- **P2** = required for scale and operational efficiency

---

## Day0 (Foundational design)

### F0.1 Scoring rubric + weighting model (P0)
**Description:** Define control-level scoring logic across 7 maturity domains and aggregate formula.

**Acceptance criteria**
- Rubric includes scoring bands (e.g., 0–5) for each domain
- Weighting method is explicit and versioned
- Example inputs produce deterministic outputs
- Change log format defined for rubric revisions

**Dependencies:** none

### F0.2 Evidence schema + confidence model (P0)
**Description:** Define evidence object and confidence scoring (coverage/freshness/verification).

**Acceptance criteria**
- Required fields: source, timestamp, owner, control mapping, verification status
- Optional fields: expiry date, artifact hash, reviewer notes
- Confidence formula documented with clear thresholds
- Invalid/incomplete evidence is rejected with reason codes

**Dependencies:** F0.1

### F0.3 Assessment workflow state machine (P0)
**Description:** Define lifecycle from draft to publish.

**Acceptance criteria**
- States defined: draft, submitted, under_review, verified, scored, published
- Allowed transitions documented and testable
- Invalid transitions blocked
- State change event payload documented

**Dependencies:** F0.1, F0.2

---

## Day1–Day5 (Baseline MVP)

### F1.1 Guided assessment workflow UX (P0)
**Description:** Step-by-step flow to complete maturity assessment.

**Acceptance criteria**
- User can create an assessment and complete all 7 domains
- Form validation prevents incomplete required submissions
- Progress indicator persists per section
- Completion produces domain scores + overall score

**Dependencies:** F0.1, F0.3

### F1.2 Evidence vault + attestations (P0)
**Description:** Store artifacts and attach them to controls with verification status.

**Acceptance criteria**
- User can upload/link evidence and map it to one or more controls
- Each evidence record shows owner, date, verification state
- Assessor can mark attested vs unverified evidence
- Missing evidence is surfaced as explicit gaps

**Dependencies:** F0.2, F1.1

### F1.3 Initial roadmap generator (P0)
**Description:** Convert score gaps into prioritized actions.

**Acceptance criteria**
- Outputs at least top 10 actions sorted by impact/confidence/effort
- Each action includes owner role, due date, and expected score lift
- Duplicate/overlapping actions are consolidated
- Export available in markdown/csv

**Dependencies:** F1.1, F1.2

---

## Day6–Day15 (Decision-grade)

### F2.1 Reviewer workflow + approvals (P1)
**Description:** Add reviewer gate before publishing results.

**Acceptance criteria**
- Reviewer role can approve/reject with mandatory rationale on rejection
- Publish action is blocked without approval
- Approval timestamp and approver identity recorded
- Re-review required when critical evidence changes

**Dependencies:** F1.1, F1.2

### F2.2 Audit trail for scoring-impacting events (P1)
**Description:** Immutable log of assessment and evidence changes.

**Acceptance criteria**
- All create/update/delete actions recorded with actor + timestamp
- Score changes show before/after values and causal event link
- Audit log is queryable by assessment ID and date range
- Tamper-evident mechanism documented

**Dependencies:** F2.1

### F2.3 Maturity + confidence dashboard (P1)
**Description:** Decision view for score, confidence, and risk posture.

**Acceptance criteria**
- Dashboard displays domain score, overall score, confidence sub-scores
- Shows open high-priority gaps and overdue roadmap items
- Supports comparison with previous assessment run
- Data refresh SLA defined (e.g., <= 15 min for updates)

**Dependencies:** F1.3, F2.2

---

## Day16–Day25 (Scale + operations)

### F3.1 Benchmarking and maturity velocity (P2)
**Description:** Trend and cohort comparison across teams/programs/time.

**Acceptance criteria**
- Trend line for at least last 3 assessment cycles
- Cohort filters (team, business unit, program) available
- Velocity metric (score delta/time) computed and displayed
- Outlier detection rules documented

**Dependencies:** F2.3

### F3.2 Reassessment automation + stale evidence alerts (P2)
**Description:** Trigger recurring cycles and alert on stale artifacts.

**Acceptance criteria**
- Scheduler supports recurring reassessment cadence
- Staleness rules configurable by domain/control
- Alerts generated for stale evidence and overdue actions
- Alert acknowledgment and resolution states tracked

**Dependencies:** F2.2, F2.3

### F3.3 Executive readiness export package (P2)
**Description:** One-click package for leadership review and audits.

**Acceptance criteria**
- Export includes summary, domain detail, top risks, roadmap, evidence appendix
- Every claim in summary links to underlying evidence
- Export template supports branding/version metadata
- Generated package reproducible from same assessment snapshot

**Dependencies:** F2.3, F3.1

---

## Sequencing summary (Day0–Day25)
- **Day0:** F0.1 → F0.2 → F0.3
- **Day1–Day5:** F1.1 + F1.2 → F1.3
- **Day6–Day15:** F2.1 → F2.2 → F2.3
- **Day16–Day25:** F3.1 + F3.2 → F3.3

## Carry-forward risks
- Confidence model may need calibration after first real customer datasets
- Evidence verification throughput may bottleneck reviewer capacity
- Benchmark utility depends on sufficient multi-team adoption
