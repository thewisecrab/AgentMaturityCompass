# AMC Evaluation & Benchmark Framework
_Version 1.0 — INNO_EVAL_BENCHMARKER | 2026-02-18_

> **Purpose:** Define how AMC evaluates *its own* effectiveness. If our assessments don't actually improve client outcomes, we have a $0 product. This framework creates the measurement infrastructure to prove — or disprove — that AMC works.

---

## 1. The Core Question

**Does an AMC Compass Sprint cause measurable improvement in AI agent maturity and business outcomes?**

This is not a trivial question. Assessment tools routinely suffer from:
- **The Hawthorne Effect:** Teams improve because they're being watched, not because of the assessment itself
- **Selection bias:** Only mature teams buy assessments, skewing before/after comparisons
- **Attribution gaps:** Improvement may come from other initiatives running in parallel
- **Vanity metrics:** Clients "feel better" but nothing measurable changed

AMC's benchmark framework addresses all four.

---

## 2. Evaluation Domains

### Domain A — Assessment Accuracy
*Does AMC score what it claims to score?*
- Are scores reliable across assessors (inter-rater reliability)?
- Are scores stable when re-administered to the same client with no changes (test-retest reliability)?
- Do scores correlate with independent expert judgments?

### Domain B — Assessment Predictive Validity
*Do AMC scores predict real outcomes?*
- Do low AMS scores correlate with higher incident rates, outages, or rework?
- Do high AMS scores correlate with faster, safer agent deployments?

### Domain C — Intervention Effectiveness
*Does acting on AMC recommendations actually improve outcomes?*
- Before vs. after comparison (with control conditions where possible)
- Do clients who follow roadmap recommendations improve faster than those who don't?

### Domain D — Client Satisfaction & Perceived Value
*Do clients find assessments useful?*
- Net Promoter Score (NPS) for the Sprint
- Qualitative: "Did you change something based on this?"
- Commercial: Did they convert to retainer? Did they refer another client?

---

## 3. Measurement Instruments

### 3.1 Pre-Sprint Baseline Capture (T0)

Completed before any Sprint interaction. Client self-rates on 7 dimensions using 5-point Likert scale (same dimensions as AMC). This creates:
- Blind self-assessment benchmark
- Comparison point for AMC assessor score
- Calibration of client's self-awareness (a D7 signal)

**Instrument:** 21-item structured questionnaire (3 items per dimension). Takes ~15 minutes.

### 3.2 AMC Assessment Score (T1)

Assessor-generated score from Compass Sprint. Recorded with:
- Per-dimension score + confidence tag
- Evidence inventory (Tier 1/2/3 breakdown)
- Assessor ID (for inter-rater analysis)

### 3.3 Roadmap Follow-Through Tracker (T1 → T2)

At 30, 60, 90 days post-Sprint: client completes "Roadmap Action Tracker" — a structured checklist of top 5 recommendations and whether each was implemented.

Scale: 0 (not started) / 0.5 (in progress) / 1 (completed + evidenced)

### 3.4 Re-Assessment Score (T2)

At 90 days: repeat AMC assessment using same protocol. Compare T1 → T2 delta.

For clients who purchased retainer: re-assess every sprint cycle (typically 90 days).

### 3.5 Outcome Metrics (T2+)

Self-reported by client + publicly observable signals:
- AI agent incidents post-Sprint (production outages, safety failures, data leaks)
- Time-to-deploy new agent features
- Team confidence score (subjective, 1–10)
- External: any public incidents (press, SEC filings, social media)

### 3.6 Inter-Rater Reliability Protocol

For every 5th Sprint (or when a new assessor is onboarded):
- Two assessors independently complete the Sprint
- Scores reconciled using Cohen's κ
- Disagreements documented and used to refine rubric

**Target:** κ ≥ 0.70 (substantial agreement) per APA standards. Aspirational: κ ≥ 0.80.

---

## 4. Benchmark Design — Before/After Comparison

### 4.1 The Fundamental Problem: No Control Group

AMC cannot randomly assign clients to "assessment" vs. "no assessment" conditions. Alternatives:

**Option A — Waitlist Control (preferred when feasible)**
Clients who sign up but can't start for 60+ days serve as a natural control. We track observable signals (incident reports, deployment velocity) during their wait period and compare to post-Sprint trajectory.

**Option B — Paired Comparison**
Match Sprint clients to similar companies (by size, industry, agent type) who have not had an assessment. Observe divergence in observable outcomes over 6 months.

**Option C — Internal Arm Comparison**
Some clients have multiple teams deploying agents. Assess one team; observe differences in outcomes vs. assessed team vs. unassessed sibling team in same company.

**Option D — Dose-Response Analysis (always available)**
Among clients who received assessments, compare those who followed ≥70% of recommendations vs. those who followed <30%. If high follow-through correlates with better outcomes, this is strong evidence of intervention efficacy.

### 4.2 Primary Before/After Metric

**AMC Maturity Delta (AMD) = T2_AMS − T1_AMS**

Target benchmark: AMD ≥ 0.8 points (approximately one level improvement in at least two dimensions) within 90 days for clients who follow roadmap recommendations.

### 4.3 Secondary Metrics

| Metric | Measurement Method | Target |
|---|---|---|
| Incident rate change | Client self-report + public signals | ≥25% reduction |
| Deployment cycle time | Client DevOps metrics | ≥20% improvement |
| Safety guardrail coverage | Re-assessment D3 score | +1 level minimum |
| Team AI literacy | Pre/post quiz on AI risk concepts | ≥15% score improvement |
| Client NPS | Post-Sprint survey | ≥50 NPS |

---

## 5. Five Specific Hypotheses — First 10 Sprints

These are structured as falsifiable hypotheses with defined success criteria and measurement methods.

---

### H1 — Self-Assessment Optimism Bias

**Statement:** Client self-assessment scores (T0) will systematically exceed AMC assessor scores (T1) by ≥0.7 points on average across all dimensions.

**Why it matters:** Proves that external assessment adds value over self-evaluation. If clients score themselves accurately, a checklist might suffice. If there's systematic inflation, AMC's external perspective is essential.

**Measurement:** Calculate mean(T0_self − T1_AMC) across all dimensions for first 10 clients. Report 95% CI.

**Success criteria:** Mean gap ≥ 0.7 AND directional (self > AMC in >70% of cases).

**Falsification:** If self-assessment is accurate (gap < 0.3), revisit whether the T0 instrument is too transparent or clients are more sophisticated than expected.

**Sprint window:** Data available after Sprint 1. Full picture after Sprint 5 for statistical power.

---

### H2 — Safety Dimension Improvement Drives Incident Reduction

**Statement:** Clients who improve D3 (Safety & Alignment) by ≥1 point at 90-day re-assessment will report ≥30% fewer AI-related incidents compared to the 90-day pre-Sprint baseline.

**Why it matters:** Safety improvements should have a direct, measurable operational benefit. This is the most commercially defensible claim AMC can make.

**Measurement:** Client self-report incident log (structured form: date, severity, root cause, resolution time). Compare 90 days pre-Sprint vs. 90 days post-Sprint.

**Success criteria:** ≥30% reduction in incident count OR incident severity-weighted score for clients with D3 improvement ≥1.

**Confound controls:** Account for agent deployment growth (more agents = more incidents baseline). Normalize to incidents-per-agent-deployment.

**Falsification:** If D3 improvement does not reduce incidents, investigate whether the D3 rubric captures the right safety controls or if incidents are driven by dimensions AMC is not measuring.

**Sprint window:** Needs 90 days post-Sprint data. Testable at Sprint 6–10.

---

### H3 — Roadmap Follow-Through Predicts Maturity Delta

**Statement:** Clients who implement ≥60% of top-5 roadmap recommendations within 90 days will show AMD ≥ 1.0 point. Clients implementing <30% will show AMD < 0.3.

**Why it matters:** Tests whether AMC recommendations are actionable. If high follow-through doesn't drive improvement, recommendations are wrong. If low follow-through correlates with stagnation, we need to understand why (complexity, cost, organizational friction).

**Measurement:** Roadmap Action Tracker (T1→T2) cross-tabulated with AMD at T2.

**Success criteria:** Pearson r ≥ 0.6 between follow-through % and AMD. Visual dose-response curve.

**Falsification:** If r < 0.3, conduct interviews to understand: were recommendations wrong, unclear, too expensive, or blocked by dependencies?

**Sprint window:** Testable at Sprint 8–10 (need 90-day follow-up data from early sprints).

---

### H4 — Inter-Rater Reliability is Sufficient for Commercial Use

**Statement:** Two independent AMC assessors scoring the same client will achieve Cohen's κ ≥ 0.70 across all seven dimensions.

**Why it matters:** Proves the scoring rubric is objective enough to be trustworthy. If scores vary wildly by assessor, clients can (correctly) claim the assessment is subjective and commercially non-binding.

**Measurement:** First dual-scored sprint conducted at Sprint 5. Each dimension κ calculated. Overall κ calculated.

**Success criteria:** κ ≥ 0.70 on overall score AND ≥ 0.60 on all individual dimensions.

**Falsification:** If κ < 0.60 on any dimension, that dimension's rubric requires level behavioral descriptors to be more concrete/specific. Log as a rubric deficiency.

**Sprint window:** Requires Sprint 5 dual-scoring exercise. Results by end of Sprint 6.

---

### H5 — Dimension Scores Predict Observable Proxy Signals

**Statement:** D2 (Observability) scores at T1 will positively correlate with client-reported MTTR (mean time to recover from incidents) at T2. Teams with D2 ≥ 3 will have MTTR ≤ 4 hours. Teams with D2 ≤ 2 will have MTTR ≥ 12 hours.

**Why it matters:** Tests predictive validity — do AMC scores actually predict real-world performance? This is what converts the assessment from "interesting" to "evidence-based." It also builds the case that dimension weights are correct.

**Measurement:** Incident reports with MTTR timestamps. Collected retrospectively at T2.

**Success criteria:** Mann-Whitney U test (D2 ≥ 3 vs. ≤ 2 groups) on MTTR is significant at p < 0.10 (relaxed threshold given small N).

**Falsification:** If D2 score is uncorrelated with MTTR, either the D2 rubric is measuring the wrong things, or MTTR is being confounded by other factors (team size, incident type). In that case, revise D2 behavioral descriptors in consultation with clients.

**Sprint window:** Needs historical incident data at Sprint 1+. Testable at Sprint 10 with sufficient sample.

---

## 6. Data Infrastructure Requirements

### 6.1 Assessment Database Schema

```
clients: id, industry, agent_type, team_size, sprint_date
assessments: id, client_id, assessor_id, t0_self_scores[7], t1_assessor_scores[7], t1_confidence[7]
evidence_inventory: assessment_id, dimension, tier, artifact_description
roadmap_items: assessment_id, rank, recommendation_text, implementation_status, status_date
outcomes: client_id, measurement_date, incident_count, incident_severity, deploy_cycle_time, nps_score
reassessments: id, client_id, assessor_id, t2_scores[7]
```

### 6.2 Minimum Viable Data Stack (Sprint 1–10)
- Airtable base (free tier) for all above tables
- Typeform for T0 self-assessment and T2 outcome surveys
- Notion for roadmap tracking (shared with client)
- Manual export to CSV for statistical analysis in R or Python

### 6.3 Privacy and Consent
- Clients consent to anonymized aggregate analysis at Sprint start
- No company-identifiable data in published benchmarks
- Incident reports stored with client-controlled access keys

---

## 7. Reporting Cadence

| Milestone | Report Type | Audience |
|---|---|---|
| After Sprint 5 | **Calibration Report** — inter-rater κ results | Internal only |
| After Sprint 10 | **Benchmark Report v1** — H1-H5 results, preliminary AMD data | Internal + select clients |
| After Sprint 20 | **External Benchmark Publication** — anonymized outcomes data | Public (credibility building) |

---

## 8. Statistical Considerations for Small N

First 10 sprints = small sample. Appropriate methods:
- Bootstrap confidence intervals (not parametric CIs) for AMD estimates
- Bayesian updating of priors as data accumulates (avoids p-hacking on small samples)
- Non-parametric tests (Mann-Whitney, Spearman) where distribution is unknown
- Effect size reporting (Cohen's d, r) alongside p-values
- Pre-registration of hypotheses (this document serves as pre-registration)

---

## Files Created/Updated
- `AMC_OS/ENGINEERING/EVAL_BENCHMARK_FRAMEWORK.md` (this file)

## Acceptance Checks
- [ ] 5 hypotheses are specific, measurable, falsifiable, and time-bound
- [ ] Before/after comparison methodology accounts for absence of control group
- [ ] Inter-rater reliability standard defined (κ ≥ 0.70)
- [ ] Data infrastructure is minimal but sufficient for first 10 sprints
- [ ] Small-N statistical approach is appropriate

## Next Actions
1. Build Airtable base with schema above before Sprint 1
2. Draft T0 self-assessment questionnaire (21 items) for peer review
3. Design Roadmap Action Tracker template in Notion
4. Schedule Sprint 5 dual-scoring exercise in advance
5. Pre-register H1–H5 in internal decisions log (AMC_OS/HQ/DECISIONS.md)

## Risks/Unknowns
- 90-day re-assessment requires client retention — clients who churn won't provide T2 data, creating survivorship bias
- Incident self-reporting is unreliable; clients may underreport to avoid embarrassment
- Small N (10 sprints) limits statistical power for H2, H3, H5; interpret with caution
- Dual-scoring at Sprint 5 requires two trained assessors — capacity constraint
