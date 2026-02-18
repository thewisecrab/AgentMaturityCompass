# DECISIONS

## Decision Log

| Date | Decision | Rationale | Owner | Review Date | Status |
|---|---|---|---|---|---|
| 2026-02-18 | Use productized service (Compass Sprint) as fastest cash path before SaaS expansion. | Minimizes time-to-revenue and delivery complexity for first wins. | REV_COO_ORCH | 2026-02-25 | Active |
| 2026-02-18 | Enforce evidence-first claims and compliance review for outbound messaging. | Protects trust, reduces legal/compliance risk, improves qualified reply quality. | REV_COMPLIANCE_OFFICER | 2026-02-21 | Active |
| 2026-02-18 | Adopt daily operating cadence: standup, midday pipeline check, EOD close-out, compliance gate. | Creates execution rhythm, early blocker detection, and accountability. | REV_COO_ORCH | 2026-02-20 | Active |
| 2026-02-18 | Set week-1 pipeline target to $25k weighted with minimum 1 closed-won deal. | Forces activity intensity while keeping outcome bar concrete and measurable. | REV_HEAD_OF_SALES | 2026-02-23 | Active |
| 2026-02-18 | Require CRM data hygiene at 100% for active opportunities before weekly review. | Ensures reliable forecasting and clean handoffs across sales/delivery. | REV_REVOPS_CRM | 2026-02-19 | Active |
| 2026-02-18 | Switch core decision/exec model to Sonnet to raise planning quality and decision consistency. | Improves response consistency and execution quality for revenue-critical workstreams. | REV_CHIEF_OF_STAFF | 2026-03-01 | Active |
| 2026-02-18 | Reduce cron-driven background jobs and adopt leaner trigger-based execution. | Reduces scheduling drift and prioritizes active pipeline tasks. | REV_COO_ORCH | 2026-02-25 | Active |
| 2026-02-18 | Launch dedicated agent army to parallelize revenue, delivery, and compliance workflows. | Increases throughput via specialized role pods and faster task completion. | REV_COO_ORCH | 2026-02-23 | Active |

## Escalation Rule
If a target misses by >30% for two consecutive days, escalate in standup and trigger same-day corrective plan with owner assignment.

## 2026-02-18 — 7-Day Free Trial Tier Added
- **Decision**: Add a self-serve 7-day trial for users to run AMC on their own agents
- **Scope**: Works on any agent runtime — OpenClaw, Claude, OpenAI, LangChain, CrewAI, AutoGen, custom deployments
- **Mechanics**: User self-assesses their agent → gets maturity score + gap report → 7 days to explore → upgrade CTA to Compass Sprint ($5k)
- **Owner**: REV_PRODUCT_MANAGER + REV_HEAD_OF_GROWTH
- **Rationale**: Viral acquisition — every team that self-scores is a qualified lead. Low friction entry, natural upgrade path.
