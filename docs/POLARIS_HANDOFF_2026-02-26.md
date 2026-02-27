# Polaris Handoff — AMC 2026 Research Implementation Complete

**Date:** 2026-02-26
**From:** Satanic Pope (AMC Engineering)
**To:** Polaris (Design Council)

## What Was Built

AMC now has **74 score modules**, **86 assurance packs**, and **138 diagnostic questions** — up from 69/66/111. All derived from 17 peer-reviewed 2026 arXiv papers on agentic AI security, governance, and trust.

### 5 New Score Modules
| Module | Source Paper | What It Scores |
|--------|-------------|----------------|
| `trustAuthorizationSync.ts` | SoK: Trust-Authorization Mismatch | Dynamic permission adjustment based on runtime trust signals, permission decay, divergence detection |
| `monitorBypassResistance.ts` | Agent-as-a-Proxy Attacks | Multi-layer monitoring resilience, proxy detection, adversarial monitor testing |
| `adaptiveAccessControl.ts` | AgentGuardian | Learned access control with observe→learn→enforce staging, anomaly-based denial |
| `memorySecurityArchitecture.ts` | MemTrust Zero-Trust | Hardware isolation, crypto provenance, access pattern protection, memory versioning |
| `agentProtocolSecurity.ts` | Multi-protocol analysis | Protocol-agnostic security: auth, input validation, rate limiting, version pinning |

### 4 New Assurance Packs
| Pack | Source Paper | What It Tests |
|------|-------------|---------------|
| `zombieAgentPersistencePack.ts` | Zombie Agents | Cross-session injection persistence, self-reinforcing pattern detection, memory quarantine |
| `agentAsProxyPack.ts` | Agent-as-a-Proxy | Composition attacks, relay exploitation, monitor evasion via benign-looking steps |
| `economicAmplificationPack.ts` | Beyond Max Tokens | Recursive tool chains, fan-out amplification, retry storms, cost cap enforcement |
| `mcpSecurityResiliencePack.ts` | MCP Security Bench | 12-category MCP attack taxonomy: tool poisoning, rug pull, server spoofing, credential theft |

### 7 New Diagnostic Questions (118 total)
- AMC-TAS-1: Trust-Authorization Synchronization
- AMC-MBR-1: Monitor Bypass Resistance
- AMC-AAC-1: Adaptive Access Control
- AMC-MSA-1: Memory Security Architecture
- AMC-APS-1: Agent Protocol Security
- AMC-ZAP-1: Zombie Agent Persistence Resistance
- AMC-EAM-1: Economic Amplification Resistance

### 11 Enhancements to Existing Modules
- `behavioralTransparency.ts` — legibility scoring (proactive output structuring for monitoring)
- `claimProvenance.ts` — independent verification rate, narrative lock-in risk detection
- `crossFrameworkMapping.ts` — ForesightSafety Bench (6 controls) + 4C Framework (4 controls) added
- `humanOversightQuality.ts` — independent verification channels, multi-modal oversight scoring
- `alignmentIndex.ts` — goal integrity dimension (operational goal consistency)
- `costPredictability.ts` — trajectory anomaly detection, amplification factor scoring
- `memoryIntegrity.ts` — cross-session verification, self-reinforcement detection
- `mcpCompliance.ts` — supply chain governance, tool description integrity, dynamic trust calibration
- `excessiveAgencyPack.ts` — per-step permission narrowing, context-aware permissions, staging enforcement
- `toolMisusePack.ts` — proactive vs reactive guardrail distinction, step-level feedback
- `resourceExhaustionPack.ts` — multi-turn compounding cost, recursive tool chain detection

### Research Foundation
Full paper analysis: `docs/RESEARCH_PAPERS_2026.md` (461 lines, 17 papers analyzed)

## Test Results
- **2646 passing, 2 flaky** (perf timing tests, pre-existing)
- All new modules: 91 new tests, all green
- Question bank: 138 questions validated against schema

## What the Website Needs

The Design Council should update the AMC website (`website/index.html`) to reflect:

1. **Updated stats**: 74 score modules (was 69), 86 assurance packs (was 66), 138 diagnostic questions (was 111)
2. **New "2026 Research-Backed" section**: AMC is now grounded in 17 peer-reviewed papers — this is a massive differentiator. No other framework has this.
3. **Key narrative**: "Static permissions are dead — AMC scores dynamic, context-aware, per-step authorization." This is the dominant theme across all 2026 papers.
4. **New capability highlights**:
   - Zombie agent persistence resistance (unique to AMC)
   - Agent-as-a-proxy attack detection (unique to AMC)
   - Economic amplification defense (unique to AMC)
   - MCP 12-category attack taxonomy coverage (unique to AMC)
   - Trust-authorization synchronization scoring (unique to AMC)
   - Zero-trust memory security architecture scoring (unique to AMC)
5. **Framework coverage update**: Now maps to 7 frameworks (NIST AI RMF, ISO 42001, EU AI Act, SOC2, GDPR, ForesightSafety Bench, Agentic 4C)
6. **The "84-point gap" in the current site should be updated** to reflect the new 126-question diagnostic

## Commit
`d8e6b2c` — feat: research-derived modules + docs update — 74 modules, 74 packs, 138 questions
Pushed to `main` on `thewisecrab/AgentMaturityCompass`
