# AMC Product Expansion — 50 Feature Candidates (Relevance Review)

This file is the **relevance-scored continuation** of AMC's feature scope.
Status as of this pass: all 50 ideas were encoded in `amc.product.features` and are
accessible via the CLI command `amc product features`.

## Quick scoring rules
- **HIGH**: Directly supports AMC trust + commercialization + operations today.
- **MEDIUM**: Valuable for scale, but can follow after core trust-to-revenue foundation.
- **LOW**: Useful in later expansion; not blocking for near-term product-market fit.

## Phase 0 (Do now)
- **Build `amc product` catalog commands** ✅
- Add relevance-tagged catalog for all 50 ideas ✅
- Focus execution list for immediate backlog generated from `select_high_impact()` ✅

## Phase 1 (Next 4–6 weeks)
High-priority candidates already marked `HIGH` + `amc_fit=True`:
1. Agent onboarding wizard
2. Usage metering + billing
3. White-label agency launcher
4. Retention autopilot
5. Agent scaffolding CLI
6. SOP → workflow compiler
7. Tool wrapper generator from API specs
8. Prompt/workflow version control
9. Deterministic replay debugger
10. Local dev + mocks
11. Tool contract validator
12. Durable workflow engine
13. Event router
14. Job queue + SLA
15. Retry + smart rerun
16. Multi-tenant isolation
17. Rate-limit manager
18. Compensation/rollback workflow
19. Workflow rollout manager
20. Preference & persona manager
21. Unstructured→structured extraction
22. Context pack generator
23. Incremental sync connectors
24. Data quality monitor
25. Self-serve portal
26. Draft→approve→send workflow
27. Team collaboration mode
28. Analytics dashboard
29. Cost/latency router
30. A/B testing platform
31. Failure clustering + root-cause
32. Feedback improvement loop

## Phase 2 (Post launch hardening)
Remaining `HIGH`/`MEDIUM` entries that add leverage once Phase 1 is stable:
- Workflow template marketplace
- Tooling auto-documentation
- Workflow ingestion + knowledge summaries
- Ticket/email→KB builder
- Omnichannel unifier
- Personalized output styles
- Proactive reminders/follow-ups
- Ticket routing + human escalation (#24)
- Resumable browser sessions
- Multimodal intake
- Agent run metrics + evidence summaries

## Phase 3 (Optional / deferred)
- Voice-call intake
- Multilingual flow designer
- Accessibility-first operator UX
- Translation memory + terminology localization
- Knowledge graph with full ops lineage

## Relevance policy (implemented)
The feature catalog now classifies each item by:
- `lane` (productization, devx, orchestration, knowledge, UX, observability)
- `relevance` (`high|medium|low`)
- `amc_fit` (`true` if it should be in scope)
- owner hint + risk/effort tags

Use:
- `amc product features --relevance high --amc-fit True`
- `amc product features --relevance low`
- `amc product features-recommended --limit 12`
