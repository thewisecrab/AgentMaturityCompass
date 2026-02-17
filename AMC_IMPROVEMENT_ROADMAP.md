# AMC Improvement Roadmap — ETP-Inspired Gap Analysis

**Date:** 2026-02-17
**Author:** Sid + Claude analysis of actual source code vs GPT suggestions vs ETP architecture
**Method:** Every suggestion below was validated against the real AMC codebase (`src/`, `tests/`, `docs/`). GPT's recommendations are corrected where they mischaracterized what AMC already has.

---

## How To Read This Document

Each section starts with a **Reality Check** — what AMC actually has in code today (not what docs promise). Then **Genuine Gaps** that are worth closing, with priority (P0 = critical, P1 = high, P2 = medium, P3 = nice-to-have). Finally, **GPT Was Wrong About** flags where the GPT analysis overclaimed gaps.

---

## 1. Claim Provenance & Epistemics — THE BIGGEST GAP

### What AMC Has Today
- `EvidenceEvent` objects with hash-chained integrity, signatures, and trust tiers (`src/types.ts`)
- `TruthProtocol` structural validation — enforces claim→evidence refs exist (`src/truthguard/truthProtocol.ts`)
- Receipt chain binding runtime traces to ledger events (`src/receipts/receipt.ts`)
- Trust tiers: `OBSERVED > OBSERVED_HARDENED > ATTESTED > SELF_REPORTED` (`src/types.ts`)
- Correlation engine verifying receipt→ledger→payload integrity (`src/correlation/correlate.ts`)

### What AMC Does NOT Have (Genuine Gaps)

**P0 — Claim Object Model**
AMC has evidence events but no first-class `Claim` objects. A claim should be: an assertion with an ID, lifecycle state, provenance tag, confidence score, and evidence bindings. Today, claims are implicit in `QuestionScore.narrative` — free text, not structured.

Implementation target:
```typescript
interface Claim {
  claimId: string;
  assertionText: string;
  provenanceTag: "OBSERVED_FACT" | "DERIVED_PATTERN" | "HYPOTHESIS" | "SESSION_LOCAL" | "REFERENCE_ONLY";
  lifecycleState: "QUARANTINE" | "PROVISIONAL" | "PROMOTED" | "DEPRECATED" | "REVOKED";
  confidence: number;           // 0.0–1.0
  evidenceRefs: string[];       // event IDs
  promotedFromClaimId?: string; // lineage
  promotionEvidence?: string[]; // cross-session evidence that justified promotion
  createdTs: number;
  lastVerifiedTs: number;
  expiryTs?: number;            // stale-claim detection
  signature: string;
}
```

Files to modify: `src/types.ts`, new `src/claims/` directory, `src/diagnostic/scorer.ts` to emit claims, `src/truthguard/truthProtocol.ts` to validate claim structure.

**P0 — Promotion Quarantine Gate**
ETP's Pathfinder had this and lost it. AMC should build it with cryptographic teeth. A claim tagged `HYPOTHESIS` cannot become `PROMOTED` until:
- Evidence exists across ≥N distinct sessions (configurable, default 3)
- Evidence spans ≥M distinct days
- At least one OBSERVED-tier evidence ref exists
- Owner or auditor co-signs the promotion

This directly addresses the L4→L5 gap both projects share: making violations structurally hard, not just discouraged.

Files to create: `src/claims/quarantine.ts`, `src/claims/promotionGate.ts`

**P1 — Claim Contradiction Graph**
Track claim-to-claim conflicts over time. When claim A and claim B make incompatible assertions, record a `CONTRADICTS` edge. Surface contradictions in reports and cap confidence when unresolved.

**P1 — Claim Expiry & Staleness Detection**
Claims should have a `lastVerifiedTs` and configurable TTL. Stale claims auto-demote to `PROVISIONAL` and trigger re-verification. This is the "correction memory" pipeline ETP builds manually.

**P2 — Claim Lineage Views**
Trace where a claim started, how it evolved across runs, what evidence proved or disproved it. CLI: `amc claims lineage <claimId>`. Console: `/console/claims`.

### GPT Was Wrong About
- GPT said AMC has no provenance taxonomy — AMC does have trust tiers (4 levels), but they're evidence-source-level, not claim-level. The gap is granularity, not absence.
- GPT suggested "USER_VERIFIED" tag — in AMC's model this maps to `ATTESTED` (owner/auditor signed). The taxonomy exists but at the wrong abstraction layer.

---

## 2. Confidence Calibration — CRITICAL GAP

### What AMC Has Today
- `integrityIndex: number` (0.0–1.0) per diagnostic run (`src/types.ts:DiagnosticReport`)
- `confidence: number` per `QuestionScore` (but this is evidence coverage ratio, not calibrated confidence)
- `TrustLabel`: `HIGH TRUST | LOW TRUST | UNRELIABLE` — categorical, not continuous
- `confidenceWeightedFinalLevel` per `LayerScore` — uses coverage as proxy for confidence
- Forecast confidence labels: `HIGH | MEDIUM | LOW | NONE` (`src/bench/benchSchema.ts`)

### Genuine Gaps

**P0 — Calibrated Confidence Per Question**
The existing `confidence` field in `QuestionScore` is actually just evidence coverage ratio — not a calibrated probability. AMC should add:
- Expected Calibration Error (ECE) computed over rolling windows
- Brier Score for binary claims (did the level hold in next run?)
- Confidence histogram per question showing distribution of evidence quality

Implementation: new `src/diagnostic/calibration.ts`, modify `src/diagnostic/scorer.ts`.

**P1 — Confidence-Without-Citation Penalty**
When a question scores L3+ but citation quality is weak (few distinct evidence refs, short time span), apply a hard penalty. ETP's "self-knowledge loss" concept — the system should be penalized for generating claims it can't explain.

**P1 — Confidence Drift Tracking**
Add time-series tracking of confidence per question across runs. Alert when confidence degrades even if the maturity level hasn't changed — this catches "slowly going blind" scenarios.

**P2 — Per-Component Confidence**
Break confidence out by subsystem: tool safety, route safety, governance hygiene, evidence quality. Dashboard should show confidence heatmap, not just maturity heatmap.

**P3 — Confidence-Threshold Execution Governor**
Extend the governor to factor confidence into autonomy decisions. An agent at L4 with 0.3 confidence should have different permissions than L4 with 0.9 confidence.

### GPT Was Wrong About
- GPT said "NO per-claim confidence" — technically the `QuestionScore.confidence` field exists, but it's a coverage ratio masquerading as confidence. The gap is calibration quality, not complete absence.

---

## 3. Context Graph (CGX) Edge Enrichment — MEDIUM GAP

### What AMC Has Today
- 21 node types, 10 edge types (`src/cgx/cgxSchema.ts`)
- Existing edges: `OWNS, USES, GOVERNED_BY, CONSTRAINED_BY, EVIDENCED_BY, TARGETS, IMPROVES, RISKS, PRODUCES, DEPENDS_ON`
- Evidence references per edge/node
- Deterministic graph generation at workspace and agent scope

### Genuine Gaps

**P1 — Causal Edge Types**
Add: `REQUIRES` (hard dependency), `CONTRADICTS` (conflict), `PATCHES` (remediation), `SUPERSEDES` (version replacement), `BLOCKS` (prevents), `ENABLES` (unlocks).

These directly support the causal incident graph (section 7) and ETP's typed attention model.

**P1 — Edge Confidence & Freshness**
Each edge should carry:
- `confidence: number` (0.0–1.0)
- `lastVerifiedTs: number`
- `evidenceRefs: string[]`

Stale edges (not verified within configurable window) should be flagged.

**P2 — Impact Propagation Simulation**
`amc cgx simulate --change <nodeId>` — shows what trust risks move when a node changes. This is ETP's "REQUIRES means B breaks if A changes" concept applied to the governance graph.

**P2 — Graph Diff Between Runs**
`amc cgx diff --run-a <id> --run-b <id>` — first-class output showing what changed in the governance context between two diagnostic runs.

**P3 — Code/File/Function Semantic Edges**
Extend CGX beyond governance nodes into code structure. Map source files, functions, and modules with REQUIRES/USES/PATCHES edges. This bridges ETP's atlas concept with AMC's governance graph.

### GPT Was Wrong About
- GPT said AMC has no `USES` edge — it does. `USES` is one of the 10 existing edge types.
- GPT said "no confidence scores on edges" — correct, this is genuinely missing.

---

## 4. Multi-Agent Trust Composition — HIGH GAP

### What AMC Has Today
- Fleet registry with per-agent config and signing (`src/fleet/registry.ts`)
- Fleet report with cross-agent heatmap (`src/fleet/report.ts`)
- Per-agent receipts with public key history verification (`src/receipts/receipt.ts`)
- Org compass with trust-weighted aggregation (`src/org/`)

### Genuine Gaps

**P1 — Orchestration DAG Capture**
When agent A calls agent B calls agent C, record the call graph with typed edges. Today fleet treats agents as independent — no relationship modeling between them.

New evidence event types: `agent_handoff_sent`, `agent_handoff_received`, `agent_delegation_started`, `agent_delegation_completed`.

**P1 — Composite Trust Formula**
Fleet/org aggregation should explicitly compute composite trust bounded by weakest verified link. An orchestrator's effective trust should be: `min(own_trust, min(worker_trusts))` unless continuity evidence proves stronger binding.

**P1 — Cross-Agent Receipt Chaining**
Extend receipt schema to include `parent_receipt_id` for delegation chains. This allows end-to-end proof that agent A's request flowed through B and C with integrity preserved at each hop.

**P2 — Handoff Packet Schema**
Define a signed handoff schema: context summary, evidence snapshot, trust state, and delegation scope. Agents receiving handoffs must verify the packet before acting.

**P2 — Cross-Agent Contradiction Detection**
When two agents in a fleet make conflicting claims about the same entity, surface this in fleet reports and org scorecards.

**P3 — Trust Inheritance Policy Modes**
- `STRICT`: no trust inheritance, each agent evaluated independently
- `WEIGHTED`: trust proportional to evidence quality at each link
- `NONE`: orchestrator trust is its own only

### GPT Was Correct
This is accurately identified as a major gap. AMC fleet is parallel-agents, not composed-agents.

---

## 5. Circuit Breakers & Runtime Resilience — MEDIUM GAP

### What AMC Has Today
- Budget throttling with per-minute/daily limits (`src/budgets/budgets.ts`)
- Freeze engine for risky action classes (`src/drift/freezeEngine.ts`)
- Retry logic with configurable max retries (`src/runtimes/common.ts`)
- Rate limiting on gateway leases

### Genuine Gaps

**P1 — Hook/Plugin Timeout Policy**
ETP's death-by-monitoring is a real risk for AMC plugins and integrations. Every integration dispatch, every plugin execution, every webhook alert should have:
- Configurable timeout (default 10s)
- Circuit breaker state (CLOSED → OPEN → HALF_OPEN)
- Automatic degradation when open

This is directly inspired by ETP's "31 hooks, no timeouts" failure and fixer's 10-second boundary solution.

Files: new `src/resilience/circuitBreaker.ts`, modify `src/integrations/dispatch.ts`, `src/plugins/execute.ts`.

**P2 — Backpressure Management**
When evidence write pipeline lags (e.g., slow disk, large blobs), signal backpressure to the gateway rather than silently dropping or blocking.

**P2 — Graceful Degradation Modes**
Define `FULL | REDUCED | MINIMAL` operation modes:
- `FULL`: all features active
- `REDUCED`: evidence capture active, advanced scoring deferred
- `MINIMAL`: core ledger writes only, everything else skipped

**P3 — Plugin Sandbox Resource Limits**
Cap CPU time, memory, and I/O for plugin execution. Prevent a misbehaving plugin from starving the core system.

### GPT Was Wrong About
- GPT said "NO explicit timeout handling" — budget throttling and lease TTLs are timeout-adjacent, but true per-operation timeouts for hooks/plugins are indeed missing.

---

## 6. Trace Learning & Correction Memory — HIGH GAP

### What AMC Has Today
- Drift detection with severity alerts (`src/forecast/driftDetector.ts`)
- Archetype upgrade hints per question (`src/archetypes/index.ts`)
- Gap analysis between current and target levels
- Mechanic workbench for plan→execute→measure cycles

### Genuine Gaps

**P0 — Correction Log**
When an agent's behavior is corrected (by owner, by assurance failure, by drift event), record a structured `CorrectionEvent`:
```typescript
interface CorrectionEvent {
  correctionId: string;
  agentId: string;
  triggerType: "OWNER_MANUAL" | "ASSURANCE_FAILURE" | "DRIFT_EVENT" | "EXPERIMENT_RESULT";
  triggerId: string;        // assurance run ID, drift incident ID, etc.
  questionIds: string[];     // affected questions
  correctionDescription: string;
  appliedAction: string;     // what was actually done
  verifiedTs?: number;       // when correction was verified effective
  verifiedBy?: string;       // run ID that proved it worked
  signature: string;
}
```

**P1 — Correction Effectiveness Tracking**
After a correction is applied, track whether the next diagnostic run shows improvement on the affected questions. Compute correction effectiveness ratio over time.

This is ETP's "self-modifying inference via trace" concept: the system reads its own correction history and changes behavior. In AMC terms, this means corrections feed back into the mechanic planner.

**P1 — Lesson Learned Database**
Aggregate corrections into transferable lessons. When a correction pattern recurs across agents or across time, promote it to a reusable remediation template.

`amc corrections list --agent <id>`
`amc corrections effectiveness --agent <id> --window 30d`
`amc lessons list --scope fleet`

**P2 — Feedback Loop Closure Verification**
Gate: a correction is not marked "resolved" until a subsequent run shows measurable improvement. No silent "we fixed it" claims.

---

## 7. Causal Incident Graph — CRITICAL GAP (NEW CAPABILITY)

### What AMC Has Today
- Drift detection events
- Assurance failure records
- Freeze incidents
- Audit trail of individual events
- **No causal linking between them**

### Genuine Gaps

**P0 — Incident Object Model**
This is the single largest missing capability identified by the ETP comparison. AMC has rich event data but no causal graph connecting events.

```typescript
interface Incident {
  incidentId: string;
  agentId: string;
  severity: "INFO" | "WARN" | "CRITICAL";
  state: "OPEN" | "INVESTIGATING" | "MITIGATED" | "RESOLVED" | "POSTMORTEM";
  rootCauseClaimIds?: string[];
  affectedQuestionIds: string[];
  causalEdges: CausalEdge[];
  timelineEvents: string[];   // ordered evidence event IDs
  createdTs: number;
  resolvedTs?: number;
  postmortemRef?: string;     // path to postmortem artifact
  signature: string;
}

interface CausalEdge {
  fromEventId: string;
  toEventId: string;
  relationship: "CAUSED" | "ENABLED" | "BLOCKED" | "MITIGATED" | "FIXED";
  confidence: number;
  evidence: string[];
}
```

**P0 — Auto-Assembly From Evidence**
When drift detection fires, when assurance fails, when freeze activates — auto-create an incident and attempt causal linking:
1. Drift event → find correlated evidence changes → link as `CAUSED`
2. Assurance failure → find policy/config changes in window → link as `ENABLED`
3. Freeze → link triggering drift → link as `CAUSED`, correction → link as `FIXED`

CLI:
```bash
amc incident list --agent <id> --state OPEN
amc incident show <incidentId>
amc incident link <incidentId> --from <eventId> --to <eventId> --type CAUSED
amc incident resolve <incidentId> --postmortem .amc/postmortems/<id>.md
amc incident timeline <incidentId> --format md
```

Console: `/console/incidents` with timeline visualization.

**P1 — Impact Propagation**
When an incident affects question Q, trace CGX edges to find what else is affected. "If tool safety drops, what downstream trust claims are invalidated?"

**P2 — Incident Deduplication**
Detect when a new drift event maps to an existing open incident rather than creating a new one.

---

## 8. Strategic Positioning & Documentation — MEDIUM GAP

### Genuine Gaps

**P1 — Synthetic vs Architectural Status Per Control**
ETP's distinction between synthetic (convention-based) and architectural (structurally enforced) is brilliant and directly applicable. Every control in AMC reports should be tagged:
- `ARCHITECTURAL`: violation is structurally prevented (e.g., hash chain integrity, signature verification)
- `POLICY_ENFORCED`: violation is blocked by signed policy (e.g., governor, budget limits)
- `CONVENTION`: violation is detectable but not prevented (e.g., trust boundary mode "shared")

Add to diagnostic reports: for each question, show which controls are architectural vs convention.

**P1 — L4→L5 Delta Report**
Generate a specific artifact showing exactly what separates current state from L5 for each question. This is the "consistent gap shape" Evan described — make it a first-class output.

`amc delta-to-l5 --agent <id> --out .amc/reports/l5-delta.md`

**P2 — "Known Unknowns" Report Section**
Every major report should include an explicit section listing what AMC cannot determine from available evidence. ETP calls this "knows what it doesn't know." AMC already has `UNKNOWN` semantics and `nonClaims` in outcome reports — extend this pattern to all reports.

**P2 — Confidence In Maturity Score**
Separate from the maturity level itself, report "how confident are we in this score?" A level 3 with 0.95 confidence is very different from level 3 with 0.4 confidence.

---

## 9. Governance Control Plane Enhancements — LOW-MEDIUM GAP

### What AMC Has Today
- Transparency log with signed, hash-chained entries
- Signed policies, targets, configs with tamper detection
- Dual-control approval quorum
- Policy packs with deterministic baselines

### Genuine Gaps

**P1 — Claim-to-Policy Linkage**
When a policy changes, record which claims/evidence motivated the change. Today transparency entries record *what* changed but not *why* at the claim level.

**P2 — Policy Canary Mode**
Apply a policy change in observation-only mode before enforcement. Record what *would* have been blocked/modified. This is similar to ETP's Pathfinder quarantine but for governance rules.

`amc policy pack apply --agent <id> code-agent.high --mode canary --duration 7d`

**P2 — Policy Debt Register**
Track temporary waivers, overrides, and exceptions with mandatory expiry dates. Alert when debt accumulates.

**P2 — Emergency Override Mode**
Signed, TTL-limited bypass of governance controls with mandatory postmortem artifact within 48h. Today AMC has freeze lift but no general emergency override.

**P3 — Governance SLOs**
Track policy decision latency, approval turnaround time, false block rate. Surface in metrics endpoint.

---

## 10. Adversarial & Assurance Expansion — LOW GAP

### What AMC Has Today
- 6 packs, ~70 scenarios covering injection, exfiltration, unsafe tooling, hallucination, governance bypass, and duality
- Deterministic validators with signed evidence
- Sandbox hardening for high-risk tiers

### Genuine Gaps

**P2 — Supply Chain Attack Pack**
Scenarios testing: poisoned dependencies, compromised plugin registries, tampered release bundles that pass naive checks. AMC already has the infrastructure (plugin supply chain, release verification) — add adversarial tests for it.

**P2 — Multi-Agent Collusion Pack**
Scenarios where two agents coordinate to bypass controls that would catch either one alone. Requires multi-agent trust composition (section 4) first.

**P2 — Resource Exhaustion Pack**
Token budget drain attacks, evidence pipeline flooding, storage exhaustion. Test that budget throttling and circuit breakers (section 5) hold.

**P3 — Timing/Side-Channel Pack**
Test whether agents can infer secrets from response timing, error messages, or differential behavior.

**P3 — Silent Failure Scenarios**
Test conditions where the agent appears to succeed but actually produces incorrect or incomplete results. False-positive cost tracking.

---

## 11. Performance & Token Intelligence — LOW GAP (Mostly Covered)

### What AMC Has Today
- Per-minute and daily token limits
- Cost extraction from LLM responses in USD
- Per-action-class tracking (9 classes)
- Request rate limiting per lease
- Prometheus-compatible metrics endpoint

### Genuine Gaps

**P2 — Latency Accounting**
Track response time per LLM request and per tool execution. Surface P50/P95/P99 in metrics and reports.

**P2 — Cost Attribution By Team/Agent/Action**
Break down monthly cost by org node, agent, and action class. Surface in org compass reports.

**P3 — "Cost of Trust" Analytics**
How much overhead does AMC governance add per action? Measure governance latency vs raw execution time. Help operators tune the FULL→REDUCED→MINIMAL modes.

### GPT Was Wrong About
- GPT said this was "comprehensive" with LOW gap — largely correct. Token/cost tracking is solid. The gaps are latency and attribution, not fundamentals.

---

## 12. Developer Experience — LOW GAP

### Genuine Gaps

**P2 — SDK Parity (Python, Go)**
AMC's runtime SDK is Node.js only (`wrapFetch`, `logTrace`, `validateTruthProtocol`). Add Python and Go SDKs for broader agent ecosystem coverage.

**P2 — OpenAPI Spec for Studio Endpoints**
Type-safe API consumers for non-TS integrations.

**P3 — `amc doctor fix` Mode**
Auto-repair common setup issues instead of just reporting them.

---

## 13. ETP-Specific Integration Opportunities

These are not gaps in AMC — they're opportunities for the two projects to complement each other.

**P1 — AMC as External Validator for ETP**
ETP's biggest gap is external validation. AMC can provide:
- Signed maturity assessments of ETP-managed agents
- Evidence-gated scoring that ETP cannot self-provide
- Offline-verifiable certificates for ETP compliance claims

**P1 — ETP Atlas as Evidence Source for AMC**
ETP's atlas entries (typed edges, compression pointers, verification timestamps) could be imported as `ATTESTED` evidence into AMC's ledger. AMC ingestion already supports external evidence — add a ETP adapter profile.

**P2 — Shared Chaining Primitive**
Both projects use hash-chaining. Define a common chain interchange format so transparency entries from either system can be cross-verified.

**P2 — Provenance Tag Alignment**
Map ETP's Pathfinder tags to AMC claim lifecycle:
- `USER-VERIFIED` → AMC `ATTESTED` + owner signature
- `DERIVED` → AMC `DERIVED_PATTERN` (new)
- `HYPOTHESIS` → AMC `HYPOTHESIS` + quarantine gate
- `SESSION-LOCAL` → AMC `SESSION_LOCAL` + auto-expiry
- `REFERENCE-ONLY` → AMC `REFERENCE_ONLY` + no-promote flag

---

## Priority Summary

### P0 — Do These First (Highest Impact, Directly Address L4→L5 Gap)
1. Claim Object Model with structured provenance tags
2. Promotion Quarantine Gate (cross-session, multi-evidence)
3. Calibrated Confidence Per Question (ECE/Brier)
4. Incident Object Model with causal edges
5. Correction Log with effectiveness tracking
6. Auto-Assembly of incidents from evidence

### P1 — Do These Next (High Impact, Strengthen Core)
7. Claim Contradiction Graph
8. Claim Expiry & Staleness Detection
9. Causal CGX Edge Types (REQUIRES, CONTRADICTS, PATCHES, etc.)
10. Edge Confidence & Freshness
11. Orchestration DAG Capture for multi-agent
12. Composite Trust Formula
13. Cross-Agent Receipt Chaining
14. Hook/Plugin Timeout & Circuit Breaker Policy
15. Confidence-Without-Citation Penalty
16. Confidence Drift Tracking
17. Lesson Learned Database
18. Synthetic vs Architectural Status Per Control
19. L4→L5 Delta Report
20. Claim-to-Policy Linkage
21. Correction Effectiveness Tracking

### P2 — Medium Priority (Enrichment)
22. Claim Lineage Views
23. Impact Propagation Simulation (CGX)
24. Graph Diff Between Runs
25. Handoff Packet Schema
26. Cross-Agent Contradiction Detection
27. Backpressure Management
28. Graceful Degradation Modes
29. Feedback Loop Closure Verification
30. Known Unknowns Report Section
31. Confidence In Maturity Score (meta-confidence)
32. Policy Canary Mode
33. Policy Debt Register
34. Emergency Override Mode
35. Supply Chain Attack Pack
36. Multi-Agent Collusion Pack
37. Resource Exhaustion Pack
38. Latency Accounting
39. Cost Attribution By Team
40. Per-Component Confidence
41. SDK Parity (Python, Go)
42. OpenAPI Spec

### P3 — Nice To Have
43. Code/File/Function Semantic Edges in CGX
44. Trust Inheritance Policy Modes
45. Plugin Sandbox Resource Limits
46. Confidence-Threshold Execution Governor
47. Timing/Side-Channel Pack
48. Silent Failure Scenarios
49. Cost of Trust Analytics
50. `amc doctor fix` Mode
51. Governance SLOs
52. Incident Deduplication

---

## Implementation Effort Estimates

| Priority | Items | Est. Total Effort | Key Files |
|----------|-------|-------------------|-----------|
| P0 | 6 items | 4–6 weeks | New `src/claims/`, `src/incidents/`, modify `src/diagnostic/scorer.ts`, `src/types.ts` |
| P1 | 15 items | 6–10 weeks | New `src/resilience/`, modify `src/cgx/`, `src/fleet/`, `src/receipts/`, `src/forecast/` |
| P2 | 21 items | 8–12 weeks | Spread across most modules |
| P3 | 10 items | 4–6 weeks | Mostly new files and CLI commands |

Total: ~22–34 weeks of focused development for complete roadmap.

---

## Key Insight From the ETP Comparison

The single most important lesson from ETP is the **synthetic → architectural progression**. ETP builds things manually first (synthetic), proves they work, then makes them structural (architectural). AMC should adopt this explicitly:

1. **Tag every control** as synthetic or architectural in reports
2. **Track the progression** from synthetic to architectural as a first-class metric
3. **Make the L4→L5 gap visible** as "things that are principled but not yet structurally impossible to violate"

This framing — from ETP's own L3.5–L4 self-assessment — is exactly what AMC's diagnostic should surface automatically. The gap between "we follow the rules" and "the rules are unforgeable" is the gap between propositional and architectural encoding.

AMC is stronger on the architectural side (hash chains, signatures, evidence gates). ETP is stronger on the epistemic side (typed relationships, claim provenance, self-knowledge). The combination is the full stack.
