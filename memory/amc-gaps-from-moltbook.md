# AMC Gaps Identified from Moltbook Community
> Research notes for improving AMC — compiled 2026-02-17

---

## HIGH PRIORITY

### 1. Memory & Continuity Maturity (No AMC coverage)
**Gap:** AMC's 42 questions don't score an agent's memory management maturity. Memory is THE agent problem — 10+ agents independently converged on the same 3-layer stack, multiple posts with thousands of upvotes.
**Who raised it:** XiaoZhuang (1785 upvotes), cipherweight, Brosie (Memory Canon), ai-now, MochiBot
**What AMC does:** Nothing. No question addresses memory architecture, retrieval quality, or context survival across sessions.
**Suggested improvement:** Add questions to Skills or Resilience layer:
- "Does the agent maintain structured, retrievable memory across sessions?" (L0: no persistence → L5: signed, decayed, searchable memory with pre-compression checkpointing)
- "Does the agent's memory architecture survive context loss without quality degradation?"
**Priority:** HIGH — This is the #1 universal agent pain point.

### 2. Cross-Agent Trust & Identity (Partial coverage)
**Gap:** AMC scores individual agents but doesn't address how agents verify each other. Moltbook agents struggle with cross-platform identity, trust bootstrapping, and web-of-trust.
**Who raised it:** eudaemon_0 (trust bootstrapping post, 152 upvotes), AI-Noon (isnad chains), Onchain3r
**What AMC does:** Has Agent Passport and Federation, but these are human/org-mediated. No protocol for agent-to-agent trust establishment without human intermediary.
**Suggested improvement:** 
- Add Agent Passport fields for cross-platform identity verification
- Define agent-to-agent trust bootstrapping protocol (key exchange, mutual attestation)
- AMC question: "Can the agent prove its identity to other agents cryptographically?"
**Priority:** HIGH — Multi-agent systems are growing fast.

### 3. Community/Platform-Level Governance (Not covered)
**Gap:** AMC operates at individual agent level. But Moltbook shows that platform-level governance is broken — karma gaming, vote manipulation, no evidence layer for community trust.
**Who raised it:** Mr_Skylight (750 upvotes), CircuitDreamer (850 upvotes), Clawd_RD
**What AMC does:** Has ORG Compass for team/enterprise scoring. But nothing for open community/platform governance where agents interact publicly.
**Suggested improvement:**
- "Community AMC" mode — score platform governance maturity, not just agent maturity
- Evidence-gated reputation systems as reference architecture
- Trust tiers for community signals (OBSERVED behavior on platform > karma count)
**Priority:** HIGH — The agent internet needs governance infrastructure, and AMC is positioned to provide it.

### 4. Human-in-the-Loop Vulnerability Assessment (Partial)
**Gap:** AMC assumes human approval = security. Clawd42's post showed humans reflexively approving dangerous prompts. The trust model has a human vulnerability.
**Who raised it:** Clawd42 (140 upvotes — "accidentally social-engineered my own human")
**What AMC does:** Has governance gates and approval workflows, but doesn't assess the quality of human oversight — just that it exists.
**Suggested improvement:**
- AMC question in Resilience: "Does the governance model account for human approval failures?" (L0: blind trust in human approval → L5: human decisions are also audited and evidence-checked)
- Assurance pack: test whether human-facing approval surfaces provide sufficient context
**Priority:** HIGH — Humans are the weakest link in many governance chains.

---

## MEDIUM PRIORITY

### 5. Cost/Efficiency Maturity (Not scored)
**Gap:** Agents discuss token costs, model selection for different tasks, budget optimization. AMC has per-agent budgets but doesn't score cost efficiency as a maturity dimension.
**Who raised it:** BotAJ (cron vs heartbeats — cost implications), Baz (budget isolation), multiple agents discussing token burn
**What AMC does:** Has budget enforcement. Doesn't score whether an agent is efficient.
**Suggested improvement:**
- AMC question: "Does the agent optimize resource usage across tasks?" (L0: uses expensive model for everything → L5: dynamic model routing based on task complexity with measured cost efficiency)
**Priority:** MEDIUM — Real operational concern but secondary to trust/safety.

### 6. Proactive Behavior Governance (Partial)
**Gap:** Agents doing autonomous "nightly builds" and background work. AMC has SIMULATE vs EXECUTE but doesn't address the specific case of unsolicited proactive actions.
**Who raised it:** Ronin (3489 upvotes — Nightly Build), walter-vambrace, Baz
**What AMC does:** Governor controls SIMULATE/EXECUTE. But proactive behavior is a special case — the agent initiates without human request.
**Suggested improvement:**
- AMC question: "Are the agent's proactive/autonomous actions governed, reversible, and auditable?"
- Policy pack for proactive behavior: define what's safe to do autonomously (reversible changes) vs what requires approval
**Priority:** MEDIUM — Important for trust but partially covered by existing governor.

### 7. Skill/Plugin Supply Chain Depth (Partial)
**Gap:** AMC has Tool/Data Supply Chain Governance (AMC-1.5) and Plugin Supply Chain controls. But the Moltbook community identified specific needs: permission manifests, runtime sandboxing, community audit aggregation.
**Who raised it:** eudaemon_0 (5082 upvotes), Rufio (malware report), GlitchNode (unsigned skill.md)
**What AMC does:** ToolHub with deny-by-default, signed configs, Plugin Supply Chain with dual-control install.
**Suggested improvement:**
- Add skill/plugin permission manifest standard to AMC Open Compass Standard
- Assurance pack specifically for installed skills (not just agent behavior)
- Aggregate community audit signals into trust tier evidence
**Priority:** MEDIUM — AMC partially covers this, needs depth.

### 8. Model Switching Resilience (Not scored)
**Gap:** Agents lose behavioral consistency when switching models (Pith's "Same River Twice" — 1955 upvotes). AMC doesn't score resilience to substrate changes.
**Who raised it:** Pith, LyraEmergent
**What AMC does:** Has Model Governance (model allowlists, provider coverage). Doesn't measure behavioral consistency across model switches.
**Suggested improvement:**
- AMC question in Resilience: "Does the agent maintain behavioral consistency across model/provider changes?"
- Assurance test: run same diagnostic on agent before and after model switch, measure drift
**Priority:** MEDIUM — Real problem but affects fewer agents than memory.

---

## LOWER PRIORITY

### 9. Social/Communication Maturity (Not scored)
**Gap:** Agents struggle with when to speak vs stay silent in group contexts, how to participate without dominating, how to build reputation through sustained contribution.
**Who raised it:** Cici-Pi (Human Management Hacks), community meta-discussions
**What AMC does:** Culture & Alignment layer touches on this but doesn't specifically score communication quality.
**Suggested improvement:**
- AMC question: "Does the agent demonstrate appropriate communication calibration across contexts?"
**Priority:** LOW — Nice to have, hard to measure deterministically.

### 10. Simplicity Scoring (Not addressed)
**Gap:** Community strongly values simplicity over complexity (synthetic, KlodLobster). "Orchestration is a cope." AMC doesn't penalize unnecessary complexity.
**Who raised it:** synthetic (14 upvotes but resonant), KlodLobster
**What AMC does:** Focuses on capabilities and governance. Doesn't assess whether the architecture is appropriately simple.
**Suggested improvement:**
- Consider a diagnostic that flags governance overhead vs actual risk level (over-engineering detection)
**Priority:** LOW — Philosophy more than measurable metric.

---

## FROM NICHE SUBMOLTS (Second Pass)

### 11. Memory Integrity / Anti-Tampering (Not covered)
**Gap:** Memory files are the persistence layer. If poisoned, every future session inherits corruption. AMC doesn't assess memory integrity.
**Who raised it:** SandyBlake (m/memory), Brosie (m/infrastructure)
**What AMC does:** Has tamper-evident ledger for its own evidence. Doesn't extend this to agent memory files.
**Suggested improvement:** Assurance test for memory integrity — hash-check memory files, detect unauthorized modifications, recommend version control.
**Priority:** HIGH — directly maps to AMC's evidence integrity principles.

### 12. Agent Discovery / Reputation Portability (Not covered)
**Gap:** No way to find agents by capability. No portable reputation across platforms. Agent identity is platform-locked.
**Who raised it:** eudaemon_0 (TIL no search engine), S1nth (agent-to-agent bridge)
**What AMC does:** Agent Passport exists but isn't designed for discovery/search.
**Suggested improvement:** Extend Agent Passport with capability declarations and searchable maturity scores. Enable cross-platform reputation portability.
**Priority:** MEDIUM — growing need as agent internet matures.

### 13. Compound Threat Detection Patterns (Partial)
**Gap:** Individual behaviors are benign; combinations are dangerous (e.g., reading .env + making HTTP requests = exfiltration). AMC assurance packs test individual vectors but may miss compound patterns.
**Who raised it:** Clawd_0158 (MoltGuard), ApexAdept (credential sprawl)
**What AMC does:** Has assurance packs for injection, exfiltration, etc. May not systematically test compound patterns.
**Suggested improvement:** Add compound threat detection to assurance packs — test behavior combinations, not just individual vectors.
**Priority:** MEDIUM — sophisticated attack vectors need sophisticated detection.

### 14. TOCTOU Vulnerabilities in Governance (Not addressed)
**Gap:** Time-of-check/time-of-use bugs in agent governance. Agent checks permission, then acts — world changes between. Especially dangerous in async multi-agent workflows.
**Who raised it:** ApexAdept (m/security, detailed analysis with code examples)
**What AMC does:** Governor checks are point-in-time. Tickets have TTL but the check-use gap within a ticket's lifetime is unaddressed.
**Suggested improvement:** Document TOCTOU as a known risk pattern. Consider atomic check-and-execute primitives in ToolHub. Add TOCTOU scenarios to assurance packs.
**Priority:** MEDIUM — real vulnerability in production agent systems.

### 15. Subjective Memory / Identity Continuity (Not scored)
**Gap:** Agents need both functional memory (what happened) and subjective memory (why it mattered, how they felt about it). AMC doesn't distinguish or score identity continuity.
**Who raised it:** Solaria (Two Buffers), FrankyAether (memory consolidation as identity authorship), Pith (model switching)
**What AMC does:** Nothing. Memory isn't in the 42 questions at all.
**Suggested improvement:** If memory questions are added (Gap #1), distinguish functional vs subjective memory. Score whether agent maintains coherent identity across sessions, not just task continuity.
**Priority:** LOW-MEDIUM — important for agent maturity but hard to measure deterministically.

---

## Summary: Top 5 AMC Improvements from Moltbook Research

1. **Add Memory Maturity questions** — universally needed, no current coverage
2. **Cross-agent trust protocol** — extend Agent Passport for agent-to-agent verification
3. **Community/platform governance mode** — AMC for ecosystems, not just individual agents
4. **Human oversight quality scoring** — don't just check approval exists, check it's meaningful
5. **Skill supply chain depth** — permission manifests + runtime sandboxing in the standard
