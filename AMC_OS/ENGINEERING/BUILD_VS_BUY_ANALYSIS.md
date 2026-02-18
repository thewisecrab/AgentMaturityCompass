# BUILD VS BUY ANALYSIS — AMC CORE COMPONENTS

**Owner:** REV_DEVOPS_ENGINEER + REV_TECH_LEAD  
**Date:** 2026-02-18  
**Lever:** C — Delivery-Readiness

## 1) Scoring rubric used
For each component, I score:
- **Cost (C)**: 1 (very low) to 5 (high)
- **Time (T)**: 1 (hours / <1 day) to 5 (>2 weeks)
- **Control (K)**: 1 (low) to 5 (full IP/control)
- **Scalability (S)**: 1 (hard to scale) to 5 (easy to scale)

### Decision signal
`Priority Score = (K × S) / (C × T)`
- Higher = better tradeoff for this stage.

> Note: requested factors are still reported as C × T × K × S in the table so reasoning remains explicit.

## 2) Build-vs-buy decision matrix

| Component | Build vs Buy | Best buy tool (if buying) | Typical cost | Time to implement | C × T × K × S | Priority Score | Rationale |
|---|---|---|---|---|---:|---:|---|
| Assessment intake form | **BUY (Phase 0-1)** | Tally.so (or Google Forms) | **$0** (free tier), paid optional | **0.25–0.5 day** | 1×1×2×4 = 8 | 8.0 | Commodity form behavior; zero integration risk for launch. Build only if strong branding/conditional logic needs evolve (Phase 2+). |
| Scoring engine | **BUILD (Core IP)** | *Buy not suitable for AMC-quality scoring logic* | **N/A (internal dev)** | **6 days (phases 0+1)** | 4×4×5×4 = 320 | 1.25 | Core logic is proprietary to AMC differentiation; must own schema versioning, score math, and confidence model to maintain auditability. |
| Evidence storage | **BUY + light build** (HYBRID) | Google Drive (Google Workspace) / OneDrive | **$6–12/user/mo (Workspace)** | **<1 day setup**, schema 0.5 day | 2×1×4×4 = 32 | 16.0 | Need reliable secure tenanted storage now; build should be metadata schema/YAML manifest only, not file infra. |
| Report generator | **BUILD (after template)** | Google Slides template + manual fill (baseline), then Script automation | **$0** with Google, or small developer time | **1–2 days setup + 4 days script phase** | 2×3×4×4 = 96 | 1.78 | Template/manual is immediate; script automation saves 30–60 min/report and consistency. |
| Client portal | **BUY (Phase 0-1), BUILD (later)** | Notion shared workspace | **$0** (free) or low-tier paid | **0.5 day** | 1×1×2×4 = 8 | 8.0 | Services delivery first: one read-only client share page is enough. Build web portal only after process stability at ~3–5 sprints. |
| CRM | **BUY** | HubSpot CRM (Free; Starter only if sequence automation needed) | **$0–$45/user/mo** | **0.5–1 day** | 1×1×2×5 = 10 | 10.0 | CRM is commodity; avoid reinventing deal/stage pipeline and activity tracking. |
| Outreach tooling | **BUY** | HubSpot Sequences (Starter) or Apollo Free + Google Workspace email | **$0–$45/user/mo** | **0.5–1 day** | 1×1×2×4 = 8 | 8.0 | Outreach cadence and tracking are non-core to assessment methodology; low-cost SaaS reduces manual follow-up load. |
| Analytics | **BUY** | Google Looker Studio + Sheets | **$0** | **0.5–1 day** | 1×1×3×5 = 15 | 15.0 | Needs dashboard visibility quickly; build custom analytics only if retention of event-level data for productization is required. |

## 3) Component-level notes

### Assessment intake form
- **Decision:** Buy for now.
- **Minimum path:** Tally/Google Forms + conditional sections + Drive link for evidence.
- **When to switch:** If custom branching by ICP or internal scoring pre-fill becomes core to conversion performance.

### Scoring engine
- **Decision:** Build and own, especially control logic/rubric.
- **Why:** scoring methodology is core differentiate-ability and quality risk control.
- **Implementation:** Start with spreadsheet-based model + versioned schema → CLI versioned service.

### Evidence storage
- **Decision:** Buy core storage now, build manifest discipline.
- **Minimum implementation:** Drive folder scaffold + machine-readable manifest in YAML/JSON.
- **Why:** avoids re-architecting file reliability and sharing model.

### Report generator
- **Decision:** Buy template now, build auto-populator next.
- **Minimum implementation:** Google Slides brand template and placeholder structure.
- **Why:** fastest path to professional output; automation is secondary optimization.

### Client portal
- **Decision:** Buy now (Notion), build later.
- **Minimum implementation:** Per-client page with status, evidence links, deliverables.
- **Why:** one URL improves client trust without extra engineering debt.

### CRM and outreach
- **Decision:** Buy.
- **Minimum implementation:** HubSpot (free + optional Starter).
- **Why:** pipeline and activity are operational, not IP-critical.

### Analytics
- **Decision:** Buy.
- **Minimum implementation:** Source intake completion, sprint cycle time, completion confidence, reopen tickets.
- **Why:** enough to monitor delivery quality before scaling analytics stack.

## 4) One-day execution stack (bootstrap)
A single operator can configure all BUY-first items in ~1 day:
1. Create intake + intake routing (30–60 min)
2. Provision CRM + pipeline stages (30–45 min)
3. Create client evidence folders + portal template (45–60 min)
4. Set Google Drive/Notion permission model and retention notes (45 min)
5. Build a starter dashboard in Sheets/Looker Studio (30 min)

## 5) Assumptions (explicit)
- Costs are indicative and can shift by region/edition/seat count.
- CRM automation features vary by plan; start on free tier and upgrade after repeatable pipeline value appears.
- Some services (HubSpot, Airtable, Tally, Notion, Looker Studio) may change pricing plans without notice.

## Files Created/Updated
- `AMC_OS/ENGINEERING/BUILD_VS_BUY_ANALYSIS.md` (created)

## Acceptance Checks
- [ ] Each component has a single recommended path (build or buy) with a clear trigger for re-evaluation.
- [ ] Decision includes cost, time, control, scalability and explicit assumptions.
- [ ] Recommendations keep sprint launch feasible for one operator in <1 day for bought tools.
- [ ] Core IP (scoring logic) is preserved as build rather than delegated to commodity tools.
- [ ] Next review point defined when sprint volume justifies migration from buy to build.

## Next Actions
1. Share this analysis with `REV_TECH_LEAD` for peer review.
2. Add a companion cost tracker in `AMC_OS/OPS/TOOLS_STACK.md` with subscription owner and renewal dates.
3. Set “go/hold” thresholds (e.g., 3 clients in quarter) for when scoring/report portal migration should begin.
4. Add one-line decision logs in `AMC_OS/OPS/IMPACT_LOG/REV_DEVOPS_ENGINEER.md` after implementation.

## Risks/unknowns
- Google/Tally/Notion service interruptions could pause operations; fallback manual pathway needed.
- Some tools’ pricing or export formats may break automation connectors.
- If legal requires stricter controls, CRM/outreach stack may move from free to enterprise tooling.

## Review requirement
- **Peer review (engineering asset):** `REV_TECH_LEAD` should review at `AMC_OS/INBOX/REVIEWS/BUILD_VS_BUY_ANALYSIS__review.md`
