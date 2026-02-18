# AMC Implementation Plan — All Gaps
> Created 2026-02-18 by Satanic Pope

## Status Legend: ✅ Exists | 🔧 Partial | ❌ Missing

## From AMC_IMPROVEMENT_ROADMAP.md (ETP comparison)
### P0 — Critical
1. 🔧 Claim Object Model — `src/claims/` exists (3.5K lines) but need to verify completeness
2. 🔧 Promotion Quarantine Gate — `src/claims/promotionGate.ts` + `quarantine.ts` exist
3. 🔧 Calibrated Confidence — `src/claims/claimConfidence.ts` exists (618 lines)
4. 🔧 Incident Object Model — `src/incidents/` exists (1.8K lines)
5. 🔧 Correction Log — `src/corrections/` exists (743 lines)
6. 🔧 Auto-Assembly — `src/incidents/autoAssembly.ts` exists

### P1 — High
7. 🔧 Claim Contradiction Graph — `src/claims/contradictions.ts` exists
8. ❌ Claim Expiry & Staleness Detection — need to verify
9. ❌ Causal CGX Edge Types — need to check cgxSchema
10. ❌ Edge Confidence & Freshness on CGX
11. ❌ Orchestration DAG Capture — fleet is parallel, not composed
12. 🔧 Composite Trust Formula — `src/fleet/trustComposition.ts` (725 lines)
13. ❌ Cross-Agent Receipt Chaining
14. 🔧 Circuit Breaker — `src/ops/circuitBreaker.ts` exists
15. ❌ Confidence-Without-Citation Penalty
16. ❌ Confidence Drift Tracking
17. ❌ Lesson Learned Database
18. ❌ Synthetic vs Architectural Status Per Control
19. ❌ L4→L5 Delta Report
20. 🔧 Governance Lineage — `src/claims/governanceLineage.ts` exists (856 lines)
21. 🔧 Correction Effectiveness — `src/corrections/correctionTracker.ts` exists

### P2-P3 — Medium/Low
22-52: Mix of partial and missing

## From Moltbook Gaps (15 items)
1. ❌ Memory Maturity Questions — NO dedicated AMC questions for memory management
2. 🔧 Cross-Agent Trust — trustComposition exists but no agent-to-agent protocol
3. ❌ Community/Platform Governance Mode
4. ❌ Human Oversight Quality Scoring
5. ❌ Skill Supply Chain Permission Manifests
6. ❌ Cost/Efficiency Maturity Scoring
7. ❌ Proactive Behavior Governance Questions
8. ❌ Model Switching Resilience Scoring
9. ❌ Social/Communication Maturity
10. ❌ Simplicity Scoring
11. ❌ Memory Integrity/Anti-Tampering
12. ❌ Agent Discovery/Reputation Portability
13. ❌ Compound Threat Detection Patterns (in assurance)
14. ❌ TOCTOU Vulnerability Testing
15. ❌ Subjective Memory/Identity Continuity

## Implementation Phases
### Phase 1: Core Framework Gaps (P0 items + Moltbook HIGH)
### Phase 2: Question Bank Expansion (new AMC questions from Moltbook)
### Phase 3: Assurance Pack Expansion
### Phase 4: Tooling & DX
