# AMC Product — Day0 to Day7 Execution Priorities

## Objective
Deliver a usable, auditable baseline MVP by Day7 with explicit quality gates tied to backlog items F0.1–F2.1.

## Scope anchor (from backlog/definition)
- Day0 foundation: **F0.1, F0.2, F0.3**
- Day1–Day5 MVP: **F1.1, F1.2, F1.3**
- Day6–Day7 hardening start: **F2.1 (thin slice)**

---

## Priority ladder (highest first)
1. **Scoring/evidence/workflow contracts must be stable** (enables deterministic scoring + auditability)
2. **End-to-end assessment completion** (user can finish all 7 domains)
3. **Evidence-linked scoring + explicit gaps** (trust and actionability)
4. **Roadmap output with owner/date/score-lift** (decision utility)
5. **Reviewer gate thin slice** (publish control and decision-grade readiness)

---

## Day-by-day execution plan

## Day0 — Foundation Contracts (P0)
### Priority items
- Finalize **F0.1 Scoring rubric + weighting model**
- Finalize **F0.2 Evidence schema + confidence model**
- Finalize **F0.3 Workflow state machine**

### Acceptance checks
- 7 domains each have explicit 0–5 scoring bands and documented weights.
- Given same sample inputs, scoring output is deterministic across 3 repeated runs.
- Evidence schema enforces required fields: source, timestamp, owner, control mapping, verification status.
- Confidence formula documented with thresholds for coverage/freshness/verification.
- Workflow states and transitions are machine-testable; invalid transitions return reason codes.

### Deliverables
- `AMC_OS/PRODUCT/PRODUCT_DEFINITION.md` (validated sections)
- `AMC_OS/PRODUCT/FEATURE_BACKLOG.md` (dependency integrity check complete)

---

## Day1 — Assessment UX skeleton (P0)
### Priority items
- Start **F1.1 Guided assessment workflow UX** for all 7 domains.

### Acceptance checks
- New assessment can be created and navigated domain-by-domain.
- Required input validation blocks incomplete submissions.
- Progress state persists after refresh/re-entry.
- Preliminary score preview generated per completed domain.

### Dependency gate
- Day1 cannot close unless Day0 contracts are versioned and frozen for MVP window.

---

## Day2 — Evidence vault core (P0)
### Priority items
- Implement core of **F1.2 Evidence vault + attestations**.

### Acceptance checks
- User can upload/link evidence and map to one/many controls.
- Each evidence record shows owner/date/verification state.
- Attested vs unverified status visible in assessment flow.
- Missing evidence appears as explicit gaps in scoring context.

### Dependency gate
- F1.2 mapping must consume Day0 control IDs without manual remapping.

---

## Day3 — Scoring integration & confidence (P0)
### Priority items
- Complete scoring + evidence linkage integration across F1.1/F1.2.

### Acceptance checks
- Every scored control links to >=1 evidence record OR explicit “gap” marker.
- Overall index + domain scores recompute on evidence state change.
- Confidence value renders with component breakdown (coverage/freshness/verification).
- Test pack covers at least 10 control/evidence edge cases.

---

## Day4 — Roadmap generator alpha (P0)
### Priority items
- Build **F1.3 Initial roadmap generator**.

### Acceptance checks
- Generator outputs top 10 actions sorted by impact/confidence/effort.
- Each action includes owner role, due date, expected score lift.
- Duplicate/overlapping actions are deduplicated by rule.
- Markdown export works for one completed assessment snapshot.

---

## Day5 — End-to-end baseline MVP exit (P0)
### Priority items
- Full E2E test from assessment creation to roadmap export.
- Resolve P0 defects blocking baseline completion.

### Acceptance checks (Day5 exit criteria)
- User completes one full assessment with no manual backend edits.
- All scored controls have evidence link or explicit gap.
- Top-10 roadmap export is generated with owner + target date.
- Time-to-baseline is <= 90 minutes for a first-time workspace run.

---

## Day6 — Decision-grade hardening start (P1 thin slice)
### Priority items
- Start **F2.1 Reviewer workflow + approvals** (thin slice only).
- Add publish guard requiring reviewer approval flag.

### Acceptance checks
- Reviewer can approve/reject; rejection requires rationale text.
- Publish blocked when approval state != approved.
- Approval event logs actor + timestamp in audit-ready format.

---

## Day7 — Stabilization and readiness checkpoint
### Priority items
- Stabilize Day6 reviewer gate path.
- Prepare Day8+ backlog entry criteria for F2.2 audit trail.
- Run readiness review for decision-grade phase.

### Acceptance checks
- Smoke test passes for: assessment -> evidence -> scoring -> roadmap -> reviewer -> publish.
- Known defects triaged with severity and owner.
- F2.2 implementation plan drafted with event taxonomy and immutable-log approach.
- Leadership-ready status note produced: shipped, blocked, next 7-day priorities.

---

## Cross-functional ownership map (Day0–Day7)
- **REV_PRODUCT_MANAGER:** priority/order, acceptance gate ownership, dependency management
- **REV_TECH_LEAD / REV_FULLSTACK_ENGINEER:** implementation of F1.x and F2.1 thin slice
- **REV_QA_LEAD:** test design for deterministic scoring + E2E exit checks
- **REV_SECURITY_OFFICER / REV_COMPLIANCE_OFFICER:** evidence verification and reviewer policy constraints

---

## Go/No-Go gates
- **Go to Day1:** F0.1/F0.2/F0.3 contracts frozen for MVP
- **Go to Day4:** scoring-evidence linkage verified (no orphan score path)
- **Go to Day6:** Day5 exit criteria all green or documented exception approved by PM + Tech Lead

---

Files created/updated:
- `AMC_OS/PRODUCT/DAY0_DAY7_EXECUTION_PRIORITIES.md`

Acceptance checks:
- Plan maps each day to explicit backlog IDs (F0.1–F2.1).
- Each day includes measurable acceptance checks.
- Day5 and Day7 include phase-level exit/readiness gates.

Next actions:
- Convert each day’s priorities into engineering tickets with estimates and owners.
- Add test case IDs to each acceptance check for QA traceability.
- Align reviewer rejection taxonomy with compliance/legal policy.
- Baseline measurement setup for time-to-baseline and evidence coverage.

Risks/unknowns:
- Confidence thresholds may need recalibration after first real dataset.
- Reviewer throughput may constrain Day6/Day7 publish cycle.
- Deduplication logic for roadmap actions may need domain-specific tuning.