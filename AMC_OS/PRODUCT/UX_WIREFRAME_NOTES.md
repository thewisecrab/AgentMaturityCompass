# AMC UX Wireframe Notes (Client-Facing Touchpoints)

**Audience:** REV_UX_UI_DESIGNER + REV_QA_TESTER
**Purpose:** Screen-by-screen UX descriptions for Compass sprint client experiences (not full visual spec)
**Related SOP:** `AMC_OS/CUSTOMER_SUCCESS/SPRINT_DELIVERY_SOP.md`
**Assumptions:**
1. Scoring levels use existing 4-level maturity model (L1–L4).
2. Product delivers one client workspace + stakeholder-level login.
3. Evidence artifacts are file/email/Slack artifacts with metadata for dimension mapping.
4. Readout uses the readout deck structure in `AMC_OS/CUSTOMER_SUCCESS/SPRINT_READOUT_DECK_TEMPLATE.md`.

---

## 1) Intake Questionnaire Flow (Day 1–2 data capture)

### User goal
A sponsor and their SMEs can complete the assessment quickly with confidence, knowing what is required, what is already answered, and where to upload supporting evidence.

### Flow: What each screen/step shows and why

#### 1. Entry / “Welcome to your assessment” screen
- **What it shows:**
  - Client/project name and sprint dates
  - Brief purpose statement (“Evidence-based baseline, no guessing”)
  - Three-way status indicators: **Kickoff completed**, **Questionnaire started**, **Evidence folder ready**
  - Primary CTA: `Start questionnaire`
  - Secondary CTA: `Upload evidence first`
- **Why:** Establishes legitimacy and reduces anxiety; clarifies that this is a guided process, not an ad hoc audit.

#### 2. Progress shell / step rail
- **What it shows:**
  - Multi-step rail (e.g., Overview → Questions → Evidence → Review → Submit)
  - Percent complete + remaining required items
  - Section-level completion (e.g., “Governance 40% complete”)
- **Why:** Prevents drop-off and lets stakeholders continue later.

#### 3. Question block (dimension-scoped)
- **What it shows per question:**
  - Dimension tag (e.g., Security, Autonomy, Observability)
  - Plain-language question
  - Structured answer controls (single/multi-select + free text if needed)
  - “Why we ask this” helper text with example evidence types
  - Evidence-needed chips (e.g., `Add runbook`, `Add policy`, `Add dashboard screenshot`)
- **Why:** Supports non-experts to provide high-quality, scorable inputs.

#### 4. Evidence uploader (contextual)
- **What it shows:**
  - Drag/drop + browse
  - Accepted file types (document, spreadsheet, screenshot, policy text)
  - Auto-tag by dimension if possible
  - Privacy reminder (“Only tagged team can view”)
  - Mandatory/optional marks per requirement
- **Why:** Keeps evidence tied to specific control questions to avoid disconnected files.

#### 5. Confidence / completeness nudges
- **What it shows:**
  - For each section: “High / Medium / Low evidence confidence” based on citation coverage
  - `Missing evidence` panel with owner + deadline fields
- **Why:** Makes data quality visible before submission and avoids downstream scoring rework.

#### 6. Review + submit
- **What it shows:**
  - Summary cards by dimension: answered questions, uploaded artifacts, unresolved asks
  - “I confirm all answers are true to best knowledge” checkbox + legal disclosure
  - CTA: `Submit for scoring`
- **Why:** Explicit handoff state required for auditability and avoids rework.

### Key UX decisions
- Keep one question format per dimension per screen to reduce cognitive switching.
- Keep required evidence inline to each question, never in hidden links.
- Auto-save after every interaction with “Last saved X minutes ago.”
- Surface confidence and confidence reason (coverage + freshness), not just percent done.
- Make “upload later” explicit with deadline expectations.

### What NOT to do
- Don’t show raw scoring scale to clients during intake (prevents priming and argumentation during scoring).
- Don’t let users upload unlimited untagged files.
- Don’t lock them into single-pass completion with no resume.
- Don’t use technical jargon without plain-language translation.
- Don’t hide failed required evidence until final submit.

---

## 2) Scorecard Report Layout (Day 3 score deliverable)

### User goal
Client sees an understandable maturity view: overall level, what each dimension means, and evidence-backed confidence in each score.

### Screen/structure and what it shows

#### 1. Executive header
- **What it shows:**
  - Overall maturity index (e.g., 2.7/4.0) + maturity band
  - Sprint metadata (scope dates, workflow count, evidence count, scoring date)
  - Confidence grade (High/Medium/Low)
  - One-line interpretation for executives
- **Why:** Enables quick leadership comprehension before digging into details.

#### 2. Dimension score rail / cards
- **What it shows per dimension:**
  - Score (numeric + level label)
  - Color and icon (e.g., green/yellow/red)
  - Evidence coverage bar or score confidence dot
  - Number of controls scored and citation count
- **Why:** Supports prioritization and shows where data is stronger/weaker.

#### 3. Dimension drill-down panel
- **What it shows per dimension:**
  - `What this means` summary (2–3 lines)
  - Top 3 supporting controls with evidence links
  - Gaps/caveats (e.g., conflicting interview vs artifact)
  - “What changed since intake” if prior sprint exists
- **Why:** Keeps score justifiable and defensible in readout discussion.

#### 4. Evidence confidence indicators
- **What it shows:**
  - Green: fully verified artifacts + recent date
  - Amber: one source only / older evidence
  - Red: inference-heavy or interview-only scoring with explicit warning
  - Confidence formula note: `(verified controls / total controls) × freshness/consistency factor`
- **Why:** Makes limitations explicit and protects credibility.

#### 5. Evidence index appendix
- **What it shows:**
  - Evidence ID, file owner, type, date, mapped control(s), validation status
  - One-click jump to raw source if user has permissions
- **Why:** Supports audit-ready transparency and cross-functional trust.

### Key UX decisions
- Keep score first, evidence rationale second, recommendations third.
- Show confidence as a **primary** attribute, not a tooltip.
- Ensure every non-full confidence score has action text (“additional evidence needed”).
- Use consistent level language across all dimensions (L1–L4 definitions).

### What NOT to do
- Don’t show raw raw interview transcript excerpts without context.
- Don’t collapse all dimensions into one donut chart only.
- Don’t allow score editing from client side after submission.
- Don’t include legal/compliance certainty language (“guaranteed,” “fully compliant by default”).
- Don’t omit control IDs and evidence mapping.

---

## 3) Readout Presentation Flow (Day 5 readout)

### User goal
Client quickly grasps outcome, sees urgent risks, and agrees on a prioritized 90-day path.

### Presentation order (recommended)

#### A. First 60 seconds (focus & trust)
- Cover slide: what was assessed, what was excluded, confidence statement.
- Why first: aligns expectations and prevents score disputes from context mismatch.

#### B. Core evidence-backed scoring (next 20 minutes)
- Overall index → each dimension → confidence markers.
- For each dimension, call out one validated strength and one gap.
- Why now: creates shared picture before recommendations.

#### C. Prioritize risks/opportunities (next 20 minutes)
- Top 3 risks first, then top 3 opportunities with score lift estimate.
- Use impact framing: urgency × business consequence.
- Why now: risk-first framing aligns executive attention.

#### D. Roadmap with sequencing (next 20 minutes)
- Present 30/60/90 day buckets with owners, dependency logic, and quick wins.
- Explicitly tie each action to evidence-backed gap.
- Why now: preserves credibility from data to execution.

#### E. Close + next steps (last 15 minutes)
- Decision menu: continue support options / self-drive with checkpoints.
- Confirm top 3 owners and target dates.
- Why now: converts report into action momentum.

### Key UX decisions for readout interface
- One-screen-at-a-time narrative (executive-friendly): headline then cards.
- Keep recommendation list sorted by `impact × confidence ÷ effort` priority.
- Use “first readout question expected” patterns: what changes first, who owns it, when done.
- Repeat score references consistently with the scoring workbook.

### What NOT to do
- Don’t begin with deep technical internals before summary.
- Don’t present unprioritized long lists of issues.
- Don’t display low-confidence recommendations as firm commitments.
- Don’t show future revenue outcomes as promised guarantees.
- Don’t end without owner/date commitments.
