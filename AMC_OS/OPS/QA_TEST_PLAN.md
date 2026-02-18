# QA Test Plan — AMC Delivery Process (Compass Sprint)

**Scope:** Delivery quality and compliance controls for sprint execution and client-facing outputs

**Owner roles:** REV_UX_UI_DESIGNER + REV_QA_TESTER (authoring); REV_QA_LEAD (peer review)

## Test plan principles
- All tests are executable with the latest sprint artifacts and workspace data.
- Each test case includes: **Scenario, Steps, Expected Result, Pass/Fail Criteria, Owner**.
- Priority levels:
  - **Critical:** must pass before client-facing handoff
  - **Major:** must pass or have approved exception with fix date
  - **Minor:** track for next iteration

---

## TC-01 Scoring Consistency (Critical)

**Scenario:** Re-running the scoring engine on identical input set returns identical dimension scores and overall index.

**Steps:**
1. Open one completed sprint workspace and snapshot raw inputs (answers + evidence links + interview notes).
2. Run scoring workflow v1 once and save output A.
3. Re-run scoring workflow v1 with the same raw inputs (same scoring guide version, same timestamp window).
4. Compare output A vs output B (dimension and overall scores).

**Expected result:** All control scores, dimension averages, and overall index match exactly.

**Pass criteria:** No differences across all score cells; no rounding/formatting divergence beyond display precision.

**Fail criteria:** Any score or index mismatch, including hidden recalculation caused by unstable sort/order or non-deterministic tie handling.

**Owner:** REV_QA_TESTER

---

## TC-02 Scoring Determinism Across Environment (Critical)

**Scenario:** Same workspace inputs produce identical scores when executed in separate environments/repro runs.

**Steps:**
1. Execute scoring for Sprint X in two sessions (local + backup environment).
2. Freeze scoring guide version and control map.
3. Export normalized JSON outputs and compare digests.

**Expected result:** No environment-specific drift.

**Pass criteria:** Hash/digest match for full score output + citations list.

**Fail criteria:** Environment mismatch from dependency/version differences.

**Owner:** REV_TECH_LEAD

---

## TC-03 Scorecard Report Accuracy (Critical)

**Scenario:** Scorecard displayed values match scoring worksheet and evidence citations are valid.

**Steps:**
1. Open `SCORING_WORKSHEET.md` and score table output.
2. Open final scorecard report shared to client.
3. Verify for every control/dimension: score, level, and citation IDs are identical.
4. Randomly sample 20% of evidence links and validate they resolve to correct source artifacts.

**Expected result:** Perfect numeric and citation parity.

**Pass criteria:** 100% match for all listed controls in sampled + mandatory fields.

**Fail criteria:** Missing/incorrect citation IDs, control-level score mismatch, stale snapshots.

**Owner:** REV_QA_LEAD

---

## TC-04 Confidence Indicator Accuracy (Major)

**Scenario:** Confidence indicator shown per dimension correctly reflects coverage and evidence quality.

**Steps:**
1. Calculate confidence using formula from SOP/scoring guide.
2. Compare against UI/report indicator colors and labels.
3. Validate at least one low-confidence and one high-confidence dimension behavior.

**Expected result:** Dimension confidence matches calculation source and includes explicit rationale.

**Pass criteria:** No dimension where confidence label contradicts formula inputs.

**Fail criteria:** Generic static labels, missing freshness/coverage adjustments.

**Owner:** REV_UX_UI_DESIGNER

---

## TC-05 Report Completeness (Critical)

**Scenario:** Required report sections are present before readout.

**Steps:**
1. Check final report for required sections: executive summary, methodology/scope, dimension table, risk/opportunity list, roadmap, next-step options, appendix evidence index.
2. Check readout handout is present.
3. Validate all section anchors/naming align with approved deck template.

**Expected result:** No mandatory section missing.

**Pass criteria:** 100% of required sections present and populated.

**Fail criteria:** Missing readout appendix or appendix without evidence IDs.

**Owner:** REV_UX_UI_DESIGNER

---

## TC-06 Client Data Handling: Access Control (Critical)

**Scenario:** Only authorized client roles can view only their sprint artifacts.

**Steps:**
1. Create test users with roles: client admin, stakeholder, external viewer.
2. Attempt cross-customer artifact access.
3. Attempt unauthorized direct-link access to report/evidence.
4. Verify redaction of non-authorized fields (internal notes, pricing intent if hidden).

**Expected result:** Access control blocks unauthorized users; no cross-tenant leaks.

**Pass criteria:** 0 unauthorized reads; only approved roles can access full artifacts.

**Fail criteria:** Any ability to access another client’s intake data, scorecard, evidence, or notes.

**Owner:** REV_SECURITY_OFFICER

---

## TC-07 Client Data Handling: Privacy and Retention (Major)

**Scenario:** Data handling aligns with workspace retention and privacy obligations.

**Steps:**
1. Verify retention settings for sprint artifacts and exports are set per policy.
2. Confirm client evidence has storage access logs and deletion/archive behavior.
3. Verify PII fields are minimized in scorecards.

**Expected result:** Privacy defaults active and documented in retention configuration.

**Pass criteria:** No exposed PII beyond need-to-know and documented retention workflow exists.

**Fail criteria:** Missing deletion/archive path or undefined retention state.

**Owner:** REV_QA_LEAD

---

## TC-08 Outreach Sequence Compliance: No banned claims (Critical)

**Scenario:** All outreach and readout language uses compliant phrasing (no guaranteed outcomes/superlatives/absolute claims).

**Steps:**
1. Collect Day 1–5 written communications + readout transcript template variants.
2. Run phrase scan for banned patterns: guarantee, always, never, risk-free, 100%, eliminate risk, fully compliant, best/only leader, fastest path.
3. Map each hit to rewrite if unsupported.

**Expected result:** No active banned claims remain in outbound or readout materials.

**Pass criteria:** 0 critical violations, 0 unresolved moderate claims.

**Fail criteria:** Any unqualified outcome claim or unverifiable superlative in client-facing language.

**Owner:** REV_COMPLIANCE_OFFICER

---

## TC-09 Outreach Sequence Compliance: Sequence Cadence and CTA Integrity (Major)

**Scenario:** Outreach steps and CTA structure match approved sequence policy.

**Steps:**
1. Pull outreach log for the client sprint.
2. Verify message order, touch count, and role alignment against approved sequence.
3. Check every message has one clear CTA and tone/pressure level compliant.

**Expected result:** No cadence breaches and no multi-pressure CTA messages.

**Pass criteria:** All touches follow approved order + one primary CTA each.

**Fail criteria:** Repeated follow-ups without value progression or overly coercive CTA language.

**Owner:** REV_QA_TESTER

---

## TC-10 Proposal Review Checklist (Critical)

**Scenario:** Day 5 proposal/readout continuation options are accurate, scoped, and compliant.

**Steps:**
1. Open final proposal draft or retainers section.
2. Verify scope, exclusions, assumptions, timeline, fee model, owners, acceptance criteria, dependencies.
3. Check that recommendations referenced in proposal map to scored gaps.
4. Validate no claim is expressed as guaranteed ROI/compliance outcomes.

**Expected result:** Proposal is internally consistent with scorecard and compliant claims policy.

**Pass criteria:** 100% of checklist fields completed and gap linkage present.

**Fail criteria:** Scope mismatch, ambiguous exclusions, or unsupported outcome claims.

**Owner:** REV_PROPOSAL_SOW_SPECIALIST

---

## TC-11 End-to-End Delivery Sequence Check (Major)

**Scenario:** Sprint day-by-day flow follows SOP with required artifacts and gates.

**Steps:**
1. Verify Day 0 gate completion in onboarding evidence folder.
2. Check each day 1–5 artifact is created and archived.
3. Check Day 5 readout references exactly match final score output.

**Expected result:** SOP gate adherence from Day 0 to Day 5.

**Pass criteria:** No missing required artifact, and no score mismatch at readout.

**Fail criteria:** Any required artifact absent or archived readout inconsistent with scoring.

**Owner:** REV_CUSTOMER_SUCCESS_MANAGER

---

## Logging format
- Record all run results in `AMC_OS/OPS/QA_SCOREBOARD_DAILY.md`.
- For each failed test include owner, root cause, remediation owner, ETA, and retest date.

## Acceptance checks
- All Critical tests pass before Day 5 handoff.
- All Major tests have resolution plan and owner by end of Day 5.
- Regression suite includes at least one deterministic replay test and one client privacy test.

## Risks/unknowns
- Evidence artifact quality from clients may force manual overrides and increase confidence mismatch review time.
- Cross-environment score hashing depends on fixed dependencies and control map versioning discipline.
- Banned-claim detection relies partly on NLP scan quality; manual review remains necessary for tone nuances.
