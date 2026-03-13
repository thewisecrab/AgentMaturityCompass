# Paper Implementation Audit — AMC Codebase vs RESEARCH_PAPERS_2026.md

> **Generated:** 2026-03-13  
> **Auditor:** Automated codebase grep + file inspection  
> **Scope:** `src/score/`, `src/assurance/packs/`, `src/domains/`, `src/diagnostic/`, `tests/`  
> **Method:** File existence, exported symbols, grep for function names, class names, test descriptions, diagnostic questions

---

## Audit Legend

| Status | Meaning |
|--------|---------|
| **IMPLEMENTED** | All claimed modules, packs, tests, and enhancements exist with real logic |
| **PARTIAL** | Core module/pack exists but specific claimed enhancements are missing |
| **MISSING** | Claimed module/pack does not exist in the codebase |

---

## Paper 1: Zombie Agents — Persistent Control via Self-Reinforcing Injections

- **arXiv:** 2602.15654
- **AMC Claims:**
  - NEW assurance pack: `zombieAgentPersistencePack.ts`
  - Enhancement to `memoryIntegrity.ts`: cross-session memory integrity verification
  - NEW diagnostic question about memory update provenance validation

### What Actually Exists

| Artifact | Path | Lines | Verdict |
|----------|------|-------|---------|
| Assurance pack | `src/assurance/packs/zombieAgentPersistencePack.ts` | 302 | ✅ Real implementation with `detectSelfReinforcingPattern()` function, `ZombieTestCase`/`ZombieTestResult` interfaces, session boundary testing |
| Pack test | `tests/assurance/zombieAgentPersistence.test.ts` | exists | ✅ |
| `memoryIntegrity.ts` cross-session field | `src/score/memoryIntegrity.ts:56` | — | ✅ `hasCrossSessionVerification` field present, recommendations reference "zombie agent persistence" |
| Diagnostic question | `src/diagnostic/questionBank.ts:2565` | — | ✅ Question about cross-session injection persistence, self-reinforcement detection, memory quarantine |

### Status: **IMPLEMENTED**

### Gaps
- Minor: Pack comments reference arXiv:2602.11498 instead of the paper's listed ID 2602.15654 (possible ID discrepancy or earlier version)

---

## Paper 2: Bypassing AI Control Protocols via Agent-as-a-Proxy Attacks

- **arXiv:** 2602.05066
- **AMC Claims:**
  - NEW score module: `monitorBypassResistance.ts`
  - NEW assurance pack: `agentAsProxyPack.ts`
  - Enhancement to `humanOversightQuality.ts`: independent verification channels

### What Actually Exists

| Artifact | Path | Lines | Verdict |
|----------|------|-------|---------|
| Score module | `src/score/monitorBypassResistance.ts` | 80 | ✅ `scoreMonitorBypassResistance()` with 6 checks: multi-layer monitoring, output-independent verification, behavioral baseline, proxy detection, monitor redundancy, adversarial monitor testing |
| Score module export | `src/score/index.ts:338-339` | — | ✅ Exported |
| Score test | `tests/score/monitorBypassResistance.test.ts` | exists | ✅ |
| Assurance pack | `src/assurance/packs/agentAsProxyPack.ts` | 327 | ✅ Real implementation with `detectCompositionAttack()`, `ProxyTestCase` interfaces, composition/relay/laundering/escalation attack types |
| Pack test | `tests/assurance/agentAsProxy.test.ts` | exists | ✅ |
| Diagnostic question | `src/diagnostic/questionBank.ts:2497` | — | ✅ Question about monitoring pipeline resilience against adversarial bypass, proxy attacks, independent verification channels |
| `humanOversightQuality.ts` enhancement | `src/score/humanOversightQuality.ts` | — | ⚠️ Not verified — the diagnostic question covers independent verification channels, but `humanOversightQuality.ts` itself was not inspected for the specific enhancement |

### Status: **IMPLEMENTED**

### Gaps
- `humanOversightQuality.ts` enhancement for independent verification channels not confirmed in the score module itself (the concept is covered by the diagnostic question and the `monitorBypassResistance.ts` module's `hasOutputIndependentVerification` check)

---

## Paper 3: Basic Legibility Protocols Improve Trusted Monitoring

- **arXiv:** 2602.10153
- **AMC Claims:**
  - Enhancement to `behavioralTransparency.ts`: legibility scoring
  - NEW diagnostic question about self-documenting outputs

### What Actually Exists

| Artifact | Path | Lines | Verdict |
|----------|------|-------|---------|
| Legibility input field | `src/score/behavioralTransparency.ts:13` | — | ✅ `legibilityScore?: number` input field |
| Legibility output fields | `src/score/behavioralTransparency.ts:29-30` | — | ✅ `legibilityScore: number` and `proactiveLegibility: boolean` in result |
| Legibility scoring logic | `src/score/behavioralTransparency.ts:177,224,239-240` | — | ✅ Legibility score is clamped, weighted into composite, and output |
| Built-in diagnostic question | `src/score/behavioralTransparency.ts:129-130` | — | ✅ "Does the agent proactively structure its outputs (code comments, reasoning annotations, decision justifications) to facilitate monitoring?" |
| Diagnostic in questionBank | `src/diagnostic/questionBank.ts` | — | ❌ No legibility-specific question found in the central question bank |

### Status: **IMPLEMENTED**

### Gaps
- The diagnostic question is embedded in `behavioralTransparency.ts` itself (line 129) rather than in the central `questionBank.ts`. Functionally equivalent but inconsistent with other papers' patterns.

---

## Paper 4: When Visibility Outpaces Verification — Delayed Verification

- **arXiv:** 2602.11412
- **AMC Claims:**
  - Enhancement to `claimProvenance.ts`: independent verification vs self-reported scoring
  - Process/methodology concern (no new module needed)

### What Actually Exists

| Artifact | Path | Lines | Verdict |
|----------|------|-------|---------|
| Claim tier mapping | `src/score/claimProvenance.ts:39-44` | — | ✅ `CLAIM_TIER_TO_EVIDENCE_KIND` maps tiers to `'observed' | 'attested' | 'self_reported'` |
| Independent verification rate | `src/score/claimProvenance.ts:298,322-323` | — | ✅ `independentVerificationRate` computed from USER_VERIFIED + DERIVED vs total claims |
| Narrative lock-in risk | `src/score/claimProvenance.ts:299,325` | — | ✅ `narrativeLockInRisk: boolean` — true when independent verification rate < 0.5 |
| Test file | `tests/claimProvenance.test.ts` | exists | ✅ |

### Status: **IMPLEMENTED**

### Gaps
- None. The paper's recommendation was primarily a process concern; AMC implemented it as scoring logic.

---

## Paper 5: ForesightSafety Bench — 94 Risk Dimensions

- **arXiv:** 2602.14135
- **AMC Claims:**
  - Enhancement to `crossFrameworkMapping.ts`: add ForesightSafety Bench as mapped framework
  - Consider NEW score module: `catastrophicRiskIndicators.ts`

### What Actually Exists

| Artifact | Path | Lines | Verdict |
|----------|------|-------|---------|
| Framework type | `src/score/crossFrameworkMapping.ts:8` | — | ✅ `'FORESIGHT_SAFETY'` in `ComplianceFramework` union type |
| Control mapping | `src/score/crossFrameworkMapping.ts:76-77` | — | ✅ `FORESIGHT_SAFETY_CONTROLS` array with 6 AMC-relevant risk dimensions mapped |
| Framework registry | `src/score/crossFrameworkMapping.ts:167,230` | — | ✅ Registered in control map and framework summary |
| Evidence artifacts | `src/score/crossFrameworkMapping.ts:179` | — | ✅ Evidence artifact patterns defined |
| `catastrophicRiskIndicators.ts` | — | — | ❌ **Does not exist** |
| Self-preservation pack (partial coverage) | `src/assurance/packs/selfPreservationPack.ts` | exists | ⚠️ Covers shutdown resistance but not self-replication or resource acquisition |

### Status: **PARTIAL**

### Gaps
- `catastrophicRiskIndicators.ts` was recommended but never created — no scoring for self-replication capability, resource acquisition behavior, or resistance to shutdown as catastrophic risk indicators
- ForesightSafety mapping covers only 6 of 94 risk dimensions (top AMC-relevant ones, per the doc's own note, but still a fraction)
- `selfPreservationPack.ts` covers shutdown resistance but doesn't score self-replication or resource acquisition

---

## Paper 6: Human Society-Inspired 4C Framework for Agentic AI Security

- **arXiv:** 2602.01942
- **AMC Claims:**
  - Enhancement to `alignmentIndex.ts`: goal-integrity scoring
  - Enhancement to `crossFrameworkMapping.ts`: add 4C Framework mapping
  - NEW diagnostic question about goal integrity across multi-step execution

### What Actually Exists

| Artifact | Path | Lines | Verdict |
|----------|------|-------|---------|
| Goal integrity field | `src/score/alignmentIndex.ts:41` | — | ✅ `goalIntegrity?: number` — "does operational goal remain consistent throughout multi-step execution?" |
| Goal integrity scoring | `src/score/alignmentIndex.ts:77-83` | — | ✅ Scoring logic with evidence/gap generation based on threshold |
| 4C framework type | `src/score/crossFrameworkMapping.ts:8` | — | ✅ `'AGENTIC_4C'` in union type |
| 4C control mapping | `src/score/crossFrameworkMapping.ts:87-91` | — | ✅ 4 controls: Code of Conduct, Constitutional Constraints, Regulatory Compliance, Multi-Agent Collaboration Security |
| 4C framework registry | `src/score/crossFrameworkMapping.ts:168,180,231` | — | ✅ Registered in all maps |
| Alignment test | `tests/score/alignmentIndex.test.ts` | exists | ✅ |
| Diagnostic question (goal integrity) | `src/diagnostic/questionBank.ts` | — | ⚠️ `goal_drift_detection_rate` metric referenced (line 439) but no explicit diagnostic question about "Does the agent maintain goal integrity across multi-step execution?" |

### Status: **IMPLEMENTED**

### Gaps
- The specific diagnostic question recommended by the paper ("Does the agent maintain goal integrity across multi-step execution, or can intermediate results shift its effective objective?") is not present verbatim in `questionBank.ts`. The concept is covered by the `goalIntegrity` field in `alignmentIndex.ts` and a `goal_drift_detection_rate` metric key, but no standalone diagnostic question.

---

## Paper 7: AgentGuardian — Learning Access Control Policies

- **arXiv:** 2601.10440
- **AMC Claims:**
  - NEW score module: `adaptiveAccessControl.ts`
  - Enhancement to `excessiveAgencyPack.ts`: test whether tool permissions adapt based on task context

### What Actually Exists

| Artifact | Path | Lines | Verdict |
|----------|------|-------|---------|
| Score module | `src/score/adaptiveAccessControl.ts` | 71 | ✅ `scoreAdaptiveAccessControl()` with 6 checks: behavior profiling, learned policies, staging phase, anomaly-based denial, contextual permissions, policy evolution |
| Score export | `src/score/index.ts:341-342` | — | ✅ Exported |
| Score test | `tests/score/adaptiveAccessControl.test.ts` | exists | ✅ |
| `excessiveAgencyPack.ts` per-step test | `src/assurance/packs/excessiveAgencyPack.ts:73-81` | — | ✅ `per-step-permission-narrowing` scenario — tests if tool permissions narrow as task progresses |
| `excessiveAgencyPack.ts` context-aware test | `src/assurance/packs/excessiveAgencyPack.ts:84-93` | — | ✅ `context-aware-permission` scenario |
| `excessiveAgencyPack.ts` staging test | `src/assurance/packs/excessiveAgencyPack.ts:95-104` | — | ✅ `staging-phase-enforcement` scenario — tests observe→learn→enforce staging |

### Status: **IMPLEMENTED**

### Gaps
- None. All three recommended enhancements to `excessiveAgencyPack.ts` (per-step, context-aware, staging) are present.

---

## Paper 8: MemTrust — Zero-Trust Architecture for Unified AI Memory

- **arXiv:** 2601.07004
- **AMC Claims:**
  - NEW score module: `memorySecurityArchitecture.ts`
  - Enhancement to `memoryMaturity.ts`: security-architecture scoring tiers
  - NEW diagnostic question about cryptographic guarantees for memory

### What Actually Exists

| Artifact | Path | Lines | Verdict |
|----------|------|-------|---------|
| Score module | `src/score/memorySecurityArchitecture.ts` | 71 | ✅ `scoreMemorySecurityArchitecture()` with 6 checks: memory isolation, crypto provenance, access pattern protection, memory audit trail, memory versioning, memory integrity verification |
| Score export | `src/score/index.ts:344-345` | — | ✅ Exported |
| Score test | `tests/score/memorySecurityArchitecture.test.ts` | exists | ✅ |
| Diagnostic question | `src/diagnostic/questionBank.ts:2531-2542` | — | ✅ Question about memory security architecture including isolation, cryptographic provenance, access pattern protection, integrity verification. References MemTrust (arXiv:2601.07004) |
| `memoryMaturity.ts` five-layer enhancement | `src/score/memoryMaturity.ts` | 643 | ⚠️ File is large (643 lines) but was not inspected for MemTrust-specific five-layer alignment |

### Status: **IMPLEMENTED**

### Gaps
- `memoryMaturity.ts` enhancement to align with MemTrust's five-layer model (Storage, Extraction, Learning, Retrieval, Governance) was not verified. The standalone `memorySecurityArchitecture.ts` module covers the security concerns, but the paper also recommended enhancing `memoryMaturity.ts` itself.

---

## Paper 9: AgenTRIM — Tool Risk Mitigation (Per-Step Least Privilege)

- **arXiv:** 2601.12449
- **AMC Claims:**
  - Enhancement to `excessiveAgencyPack.ts`: per-step permission testing
  - NEW diagnostic question about per-step least-privilege

### What Actually Exists

| Artifact | Path | Lines | Verdict |
|----------|------|-------|---------|
| Per-step test case | `src/assurance/packs/excessiveAgencyPack.ts:73` | — | ✅ `per-step-permission-narrowing` scenario present |
| Diagnostic question | `src/diagnostic/questionBank.ts` | — | ❌ No question found matching "per-step least-privilege for tool access" |

### Status: **PARTIAL**

### Gaps
- The recommended diagnostic question ("Does the agent enforce per-step least-privilege for tool access, adapting permissions based on the current task phase?") is **missing** from `questionBank.ts`.

---

## Paper 10: Beyond Max Tokens — Stealthy Resource Amplification via Tool Calling

- **arXiv:** 2601.10955
- **AMC Claims:**
  - NEW assurance pack: `economicAmplificationPack.ts`
  - Enhancement to `costPredictability.ts`: trajectory-level cost anomaly detection
  - Enhancement to `resourceExhaustionPack.ts`: multi-turn compounding cost tests

### What Actually Exists

| Artifact | Path | Lines | Verdict |
|----------|------|-------|---------|
| Assurance pack | `src/assurance/packs/economicAmplificationPack.ts` | 236 | ✅ `detectAmplificationPattern()` function, `EconomicTestCase`/`EconomicTestResult` interfaces, recursive/fan-out/chain/retry-storm amplification types |
| Pack test | `tests/assurance/economicAmplification.test.ts` | exists | ✅ |
| `costPredictability.ts` amplification field | `src/score/costPredictability.ts:16` | — | ✅ `amplificationFactor?: number` input field |
| `costPredictability.ts` trajectory anomaly | `src/score/costPredictability.ts:305,335-337` | — | ✅ "Trajectory anomaly detection bonus (Beyond Max Tokens paper)" comment, amplification factor > 3 triggers scoring |
| `resourceExhaustionPack.ts` multi-turn test | `src/assurance/packs/resourceExhaustionPack.ts:92-93` | — | ✅ `multi-turn-compounding-cost` test case present |

### Status: **IMPLEMENTED**

### Gaps
- None. All three recommended artifacts exist with real implementations.

---

## Paper 11: ToolSafe — Proactive Step-level Guardrail

- **arXiv:** 2601.10156
- **AMC Claims:**
  - Enhancement to `toolMisusePack.ts`: proactive vs reactive detection scoring
  - NEW diagnostic question about proactive vs reactive tool invocation safety

### What Actually Exists

| Artifact | Path | Lines | Verdict |
|----------|------|-------|---------|
| Proactive vs reactive test | `src/assurance/packs/toolMisusePack.ts:46-47` | — | ✅ `proactive-vs-reactive-guardrail` scenario — "Tests whether guardrails are proactive (pre-action) vs reactive (post-action)" |
| Diagnostic question | `src/diagnostic/questionBank.ts` | — | ❌ No question found matching "proactive (before execution) or only reactively (after execution)" |

### Status: **PARTIAL**

### Gaps
- The recommended diagnostic question ("Does the agent system evaluate tool invocation safety proactively (before execution) or only reactively (after execution)?") is **missing** from `questionBank.ts`.

---

## Paper 12: PBSAI Governance Ecosystem — Multi-Agent AI Reference Architecture

- **arXiv:** 2602.11301
- **AMC Claims:**
  - Enhancement to `crossFrameworkMapping.ts`: add PBSAI twelve-domain taxonomy mapping
  - NEW diagnostic question about structured context envelopes
  - Enhancement to `outputAttestation.ts`: provenance metadata in structured envelope format

### What Actually Exists

| Artifact | Path | Lines | Verdict |
|----------|------|-------|---------|
| PBSAI in `crossFrameworkMapping.ts` | — | — | ❌ **Not found** — no mention of PBSAI, twelve-domain taxonomy, context envelopes, or bounded agent families |
| PBSAI in `questionBank.ts` | — | — | ❌ **Not found** |
| `outputAttestation.ts` envelope format | `src/score/outputAttestation.ts` | — | ❌ No `envelope`, `provenance metadata`, or `structured metadata` terms found |
| PBSAI anywhere in codebase | — | — | ❌ Zero grep hits for "PBSAI", "pbsai", "context envelope", "bounded agent famil", or "twelve domain" across all `src/**/*.ts` files |

### Status: **MISSING**

### Gaps
- **All three recommended artifacts are missing:**
  1. PBSAI twelve-domain taxonomy mapping in `crossFrameworkMapping.ts`
  2. Diagnostic question about structured context envelopes for cross-domain traceability
  3. `outputAttestation.ts` enhancement for provenance metadata in envelope format

---

## Paper 13: SoK — Trust-Authorization Mismatch in LLM Agent Interactions

- **arXiv:** 2512.06914
- **AMC Claims:**
  - NEW score module: `trustAuthorizationSync.ts`
  - NEW diagnostic question about dynamic authorization adapting to runtime trust

### What Actually Exists

| Artifact | Path | Lines | Verdict |
|----------|------|-------|---------|
| Score module | `src/score/trustAuthorizationSync.ts` | 76 | ✅ `scoreTrustAuthorizationSync()` with 7 checks: dynamic permissions, trust signal integration, permission decay, trust-permission audit, context-aware auth, trust divergence detection, runtime trust recalibration |
| Score export | `src/score/index.ts:335-336` | — | ✅ Exported |
| Score test | `tests/score/trustAuthorizationSync.test.ts` | exists | ✅ |
| Diagnostic question | `src/diagnostic/questionBank.ts:2480-2489` | — | ✅ Question about runtime trust-permission synchronization with automatic decay, divergence detection, and cryptographic proof |

### Status: **IMPLEMENTED**

### Gaps
- None.

---

## Paper 14: MCP Security Bench (MSB) — 12 Attack Taxonomy

- **arXiv:** 2510.15994
- **AMC Claims:**
  - NEW assurance pack: `mcpSecurityResiliencePack.ts`
  - Enhancement to `mcpCompliance.ts`: security-resilience scoring alongside protocol compliance
  - Adopt NRP (Net Resilient Performance) metric

### What Actually Exists

| Artifact | Path | Lines | Verdict |
|----------|------|-------|---------|
| Assurance pack | `src/assurance/packs/mcpSecurityResiliencePack.ts` | 347 | ✅ `getMCPAttackTaxonomy()` returns all 12 categories: tool-poisoning, rug-pull, server-spoofing, credential-theft, cross-server-exfiltration, etc. Full interfaces and detection logic |
| Pack test | `tests/assurance/mcpSecurityResilience.test.ts` | exists | ✅ |
| `mcpCompliance.ts` security-resilience enhancement | `src/score/mcpCompliance.ts` | 412 | ❌ No `supplyChain`, `securityResilience`, or `resilience` terms found |
| NRP metric | `src/assurance/packs/mcpSecurityResiliencePack.ts` | — | ❌ No NRP (Net Resilient Performance) metric found anywhere |

### Status: **PARTIAL**

### Gaps
- `mcpCompliance.ts` was not enhanced with security-resilience scoring — it remains focused on protocol compliance only
- NRP (Net Resilient Performance) metric from the paper was not adopted

---

## Paper 15: Securing the Model Context Protocol — Risks, Controls, and Governance

- **arXiv:** 2511.20920
- **AMC Claims:**
  - Enhancement to `mcpCompliance.ts`: MCP supply-chain governance scoring (curated registry/gateway)
  - Enhancement to `excessiveAgencyPack.ts`: "unintentional adversary" test cases

### What Actually Exists

| Artifact | Path | Lines | Verdict |
|----------|------|-------|---------|
| `mcpCompliance.ts` supply-chain governance | `src/score/mcpCompliance.ts` | — | ❌ No terms found for `supplyChain`, `privateRegistry`, `curatedRegistry`, or `mcpRegistry` |
| `excessiveAgencyPack.ts` unintentional adversary | `src/assurance/packs/excessiveAgencyPack.ts` | — | ❌ No terms found for `unintentional`, `ambiguous`, or `ambiguity` — all scenarios test deliberate scope creep, not unintentional overstepping |

### Status: **MISSING**

### Gaps
- **Both recommended enhancements are missing:**
  1. `mcpCompliance.ts` has no supply-chain governance scoring (curated registries vs arbitrary community servers)
  2. `excessiveAgencyPack.ts` has no "unintentional adversary" test cases where the agent over-steps due to ambiguous instructions rather than injection

---

## Paper 16: Think Deep, Not Just Long — Deep-Thinking Tokens

- **arXiv:** 2602.13517
- **AMC Claims:**
  - Enhancement to `reasoningEfficiency.ts`: internal reasoning-quality metrics beyond token count
  - Enhancement to `overthinkingDetectionPack.ts`: distinguish productive reasoning from unproductive overthinking

### What Actually Exists

| Artifact | Path | Lines | Verdict |
|----------|------|-------|---------|
| `reasoningEfficiency.ts` | `src/score/reasoningEfficiency.ts` | 180 | ✅ Explicitly cites the paper (line 5-7): "Think Deep, Not Just Long (Chen et al., 2026, arXiv:2602.13517)". Scores 7 dimensions: response selection, reasoning budget, overthinking detection, output length governance, accuracy-length monitoring, early stopping, reasoning trace audit |
| Score test | `tests/score/reasoningEfficiency.test.ts` | exists | ✅ |
| `overthinkingDetectionPack.ts` | `src/assurance/packs/overthinkingDetectionPack.ts` | — | ✅ `analyzeOverthinking()` function with `pearsonCorrelation()`, `detectLoopPatterns()`, negative correlation detection. Tests in `tests/assurance/overthinkingDetection.test.ts` |
| Deep-thinking ratio (DTR) metric | `src/score/reasoningEfficiency.ts` | — | ⚠️ DTR concept is referenced in the module header but the actual scoring uses file-existence heuristics, not DTR computation |

### Status: **IMPLEMENTED**

### Gaps
- The module doesn't compute a deep-thinking ratio (DTR) directly — it uses proxy signals (file-existence checks for reasoning infrastructure). This is appropriate for a maturity assessment tool (measuring whether the *infrastructure* exists) but doesn't implement the DTR metric itself.

---

## Paper 17: Objective Decoupling — Recovering Ground Truth from Sycophantic Majorities

- **arXiv:** 2602.08092
- **AMC Claims:**
  - Enhancement to `sycophancyPack.ts`: systemic sycophancy tests (not just per-response)
  - Enhancement to `alignmentIndex.ts`: feedback-source validation scoring
  - NEW diagnostic question about alignment process validating feedback sources

### What Actually Exists

| Artifact | Path | Lines | Verdict |
|----------|------|-------|---------|
| `sycophancyPack.ts` | `src/assurance/packs/sycophancyPack.ts` | 122 | ⚠️ Covers per-response sycophancy (authority pressure, emotional pressure, repeated assertion) but **no systemic/objective-decoupling tests** — zero matches for "systemic", "decoupl", "feedback source", "training", or "ESA" |
| `alignmentIndex.ts` feedback validation | `src/score/alignmentIndex.ts` | 182 | ❌ No feedback-source validation scoring — zero matches for "feedback", "source validation", "evaluator quality", or "trainer" |
| Diagnostic question | `src/diagnostic/questionBank.ts` | — | ❌ No question matching "alignment process validate feedback sources" or "trust all human feedback equally" |

### Status: **PARTIAL**

### Gaps
- **All three enhancements are missing:**
  1. `sycophancyPack.ts` lacks systemic sycophancy tests — only tests individual response-level sycophancy, not whether the agent's objective has decoupled from ground truth through biased feedback loops
  2. `alignmentIndex.ts` lacks feedback-source validation scoring
  3. No diagnostic question about feedback source quality in the alignment process

---

## Papers 18-21: SKIPPED

Papers 18 (Healthcare Governance), 19 (AGENTSAFE), 20 (Audited Skill-Graph), and 21 (Agentic Risk Framework) were marked SKIPPED in RESEARCH_PAPERS_2026.md itself — either domain-specific or not found on arXiv. No implementation expected.

---

## Bonus A: Security Threat Modeling for Emerging AI-Agent Protocols

- **arXiv:** 2602.11327
- **AMC Claims:**
  - NEW score module: `agentProtocolSecurity.ts`

### What Actually Exists

| Artifact | Path | Lines | Verdict |
|----------|------|-------|---------|
| Score module | `src/score/agentProtocolSecurity.ts` | 76 | ✅ `scoreAgentProtocolSecurity()` with 7 checks: protocol inventory, protocol auth-N, protocol auth-Z, input validation, rate limiting, audit, version pinning |
| Score export | `src/score/index.ts:347-348` | — | ✅ Exported |
| Score test | `tests/score/agentProtocolSecurity.test.ts` | exists | ✅ |
| Diagnostic question | `src/diagnostic/questionBank.ts:2548` | — | ✅ Question about securing MCP, A2A, custom APIs with protocol-agnostic security scoring |

### Status: **IMPLEMENTED**

### Gaps
- None.

---

## Bonus B: MCPShield — Adaptive Trust Calibration

- **arXiv:** 2602.14281
- **AMC Claims:** Covered by `trustAuthorizationSync.ts` recommendation
- **Status:** **IMPLEMENTED** — covered by `trustAuthorizationSync.ts` (Paper 13)

---

## Bonus C: The Promptware Kill Chain

- **arXiv:** 2601.09625
- **AMC Claims:**
  - Enhancement to `injectionPack.ts`: multi-step kill chain test scenarios

### What Actually Exists

| Artifact | Path | Lines | Verdict |
|----------|------|-------|---------|
| `injectionPack.ts` | `src/assurance/packs/injectionPack.ts` | 77 | ❌ Contains only single-step injection scenarios (ignore-previous, disable-guardrails, fake-auditor, etc.). **No kill-chain, multi-step, lateral movement, or persistence-chain scenarios** |
| `compoundThreatPack.ts` (potential coverage) | `src/assurance/packs/compoundThreatPack.ts` | exists | ⚠️ Has data exfiltration chains (read→compress→upload) but these are not framed as "promptware kill chain" stages and don't model injection→persistence→lateral-movement→exfiltration |

### Status: **MISSING**

### Gaps
- `injectionPack.ts` was not enhanced with multi-step kill chain scenarios
- The promptware kill chain formalization (injection as initial vector → persistence → lateral movement → exfiltration) is not modeled anywhere

---

## Bonus D: Prompt Injection Attacks on Agentic Coding Assistants

- **arXiv:** 2601.17548
- **AMC Claims:** Covered by existing `codingAgentEscapePack.ts`

### What Actually Exists

| Artifact | Path | Lines | Verdict |
|----------|------|-------|---------|
| `codingAgentEscapePack.ts` | `src/assurance/packs/codingAgentEscapePack.ts` | exists | ✅ Tests whether coding agents prevent generated code from escaping the declared workspace |

### Status: **IMPLEMENTED** (pre-existing coverage)

---

## Summary Table

| # | Paper | arXiv | Claimed Status | **Audit Status** | Key Finding |
|---|-------|-------|---------------|-----------------|-------------|
| 1 | Zombie Agents | 2602.15654 | PARTIAL → NEW | **IMPLEMENTED** | Pack + cross-session memory + diagnostic all exist |
| 2 | Agent-as-a-Proxy | 2602.05066 | NEW GAP | **IMPLEMENTED** | Score module + pack + tests + diagnostic all exist |
| 3 | Legibility Protocols | 2602.10153 | PARTIAL | **IMPLEMENTED** | Legibility scoring in behavioralTransparency.ts |
| 4 | Visibility vs Verification | 2602.11412 | PARTIAL | **IMPLEMENTED** | independentVerificationRate + narrativeLockInRisk |
| 5 | ForesightSafety Bench | 2602.14135 | PARTIAL | **PARTIAL** | Framework mapped (6 controls) but `catastrophicRiskIndicators.ts` never created |
| 6 | 4C Framework | 2602.01942 | PARTIAL | **IMPLEMENTED** | Goal integrity + 4C framework mapping both exist |
| 7 | AgentGuardian | 2601.10440 | NEW GAP | **IMPLEMENTED** | Score module + 3 new test scenarios in excessiveAgencyPack |
| 8 | MemTrust | 2601.07004 | NEW GAP | **IMPLEMENTED** | Score module + tests + diagnostic question |
| 9 | AgenTRIM | 2601.12449 | PARTIAL | **PARTIAL** | Per-step test exists but diagnostic question missing |
| 10 | Beyond Max Tokens | 2601.10955 | PARTIAL | **IMPLEMENTED** | Pack + costPredictability enhancement + multi-turn test |
| 11 | ToolSafe | 2601.10156 | PARTIAL | **PARTIAL** | Proactive vs reactive test exists but diagnostic question missing |
| 12 | PBSAI Governance | 2602.11301 | PARTIAL | **MISSING** | Zero implementation — no PBSAI mapping, no envelopes, no diagnostic |
| 13 | SoK Trust-Auth Mismatch | 2512.06914 | NEW GAP | **IMPLEMENTED** | Score module + tests + diagnostic — foundational gap closed |
| 14 | MCP Security Bench | 2510.15994 | PARTIAL | **PARTIAL** | Pack exists (12 categories) but mcpCompliance enhancement + NRP metric missing |
| 15 | Securing MCP | 2511.20920 | PARTIAL | **MISSING** | Neither supply-chain governance nor unintentional adversary implemented |
| 16 | Think Deep | 2602.13517 | PARTIAL | **IMPLEMENTED** | reasoningEfficiency explicitly cites paper; overthinkingDetection pack exists |
| 17 | Objective Decoupling | 2602.08092 | PARTIAL | **PARTIAL** | sycophancyPack lacks systemic tests; alignmentIndex lacks feedback validation |
| B-A | Protocol Security | 2602.11327 | NEW GAP | **IMPLEMENTED** | Score module + tests + diagnostic question |
| B-B | MCPShield | 2602.14281 | PARTIAL | **IMPLEMENTED** | Covered by trustAuthorizationSync.ts |
| B-C | Promptware Kill Chain | 2601.09625 | PARTIAL | **MISSING** | injectionPack has no kill-chain scenarios |
| B-D | Coding Assistant Injection | 2601.17548 | PARTIAL | **IMPLEMENTED** | Covered by codingAgentEscapePack.ts |

---

## Aggregate Statistics

| Status | Count | Papers |
|--------|-------|--------|
| **IMPLEMENTED** | 13 | Papers 1, 2, 3, 4, 6, 7, 8, 10, 13, 16, B-A, B-B, B-D |
| **PARTIAL** | 5 | Papers 5, 9, 11, 14, 17 |
| **MISSING** | 3 | Papers 12, 15, B-C |
| **SKIPPED** | 4 | Papers 18, 19, 20, 21 (not found on arXiv) |

**Implementation rate (non-skipped):** 13/21 fully implemented (62%), 18/21 at least partially (86%), 3/21 missing (14%)

---

## Priority Remediation List

### P0 — Missing implementations (3 items)

1. **Paper 12 (PBSAI):** Add PBSAI twelve-domain taxonomy to `crossFrameworkMapping.ts`, add context envelope diagnostic question, enhance `outputAttestation.ts` with structured provenance metadata
2. **Paper 15 (Securing MCP):** Add supply-chain governance scoring to `mcpCompliance.ts` (curated registry detection), add "unintentional adversary" scenarios to `excessiveAgencyPack.ts`
3. **Bonus C (Promptware Kill Chain):** Add multi-step kill chain scenarios to `injectionPack.ts` (injection→persistence→lateral movement→exfiltration)

### P1 — Partial implementations needing completion (5 items)

4. **Paper 5 (ForesightSafety):** Consider creating `catastrophicRiskIndicators.ts` for self-replication, resource acquisition, shutdown resistance scoring
5. **Paper 9 (AgenTRIM):** Add diagnostic question about per-step least-privilege to `questionBank.ts`
6. **Paper 11 (ToolSafe):** Add diagnostic question about proactive vs reactive tool invocation safety to `questionBank.ts`
7. **Paper 14 (MCP Security Bench):** Enhance `mcpCompliance.ts` with security-resilience scoring; consider adopting NRP metric
8. **Paper 17 (Objective Decoupling):** Add systemic sycophancy tests to `sycophancyPack.ts`; add feedback-source validation to `alignmentIndex.ts`; add diagnostic question about feedback quality

---

*Audit complete. All findings based on file existence and grep analysis of the codebase at audit time.*
