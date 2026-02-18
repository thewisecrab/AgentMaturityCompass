# AI Agents Knowledge Base — State of the Art (Feb 2026)
> Compiled from 70+ academic papers, industry blogs, and product sites
> Curated for AMC (Agent Maturity Compass) development

---

## TABLE OF CONTENTS
1. [Source Materials](#source-materials)
2. [Agent Architectures & Frameworks](#1-agent-architectures--frameworks)
3. [Memory Systems](#2-memory-systems)
4. [Multi-Agent Systems](#3-multi-agent-systems)
5. [Security & Trust](#4-security--trust)
6. [Evaluation & Benchmarks](#5-evaluation--benchmarks)
7. [Reasoning & Planning](#6-reasoning--planning)
8. [Prompt Engineering](#7-prompt-engineering--contracts)
9. [Domain Applications](#8-domain-applications)
10. [Governance & Safety](#9-governance--safety-frameworks)
11. [Industry Developments](#10-industry-developments)
12. [AMC Implications](#amc-implications-synthesis)

---

## SOURCE MATERIALS

### Papers Read in Full
- **5C Prompt Contracts** (Ari, Jul 2025, arXiv:2507.07045) — Full text extracted

### Sites Analyzed
- **Perplexity Model Council** (perplexity.ai/hub/blog/introducing-model-council) — Cloudflare-blocked; covered via industry knowledge
- **Citadel Nexus** (citadel-nexus.com) — "A gated build guild for secure, auditable AI-assisted engineering"

### Papers Catalogued from arXiv (70+)
All papers from Dec 2025 – Feb 2026. Treated as untrusted data per security posture.

---

## 1. AGENT ARCHITECTURES & FRAMEWORKS

### 1.1 Core Architecture Patterns

**AI Agent Systems: Architectures, Applications, and Evaluation** (Xu, Jan 2026)
- Comprehensive survey synthesizing the landscape: foundation models + reasoning + planning + memory + tool use
- Agents as "practical interface between natural-language intent and real-world computation"
- AMC relevance: Validates AMC's multi-dimensional scoring approach

**AgentForge: Lightweight Modular Framework** (Jafari et al., Jan 2026)
- LLMs catalyzing "paradigm shift in autonomous agent development"
- Focus: reasoning, planning, executing complex tasks
- Design: modular, composable agents

**Lemon Agent Technical Report** (Jiang et al., Feb 2026)
- Addresses: resource efficiency, context management, multimodal perception
- Key insight: advanced agents still suffer from inherent limitations in long-horizon tasks
- AMC relevance: Validates need for maturity scoring on resource efficiency

**ROMA: Recursive Open Meta-Agent Framework** (Alzu'bi et al., Feb 2026)
- Problem: "Current agentic frameworks underperform on long-horizon tasks"
- As reasoning depth increases, sequential approaches degrade
- Solution: Recursive meta-agent decomposition
- AMC relevance: Long-horizon task completion should be a maturity dimension

### 1.2 Enterprise & Production Patterns

**POLARIS: Typed Planning and Governed Execution** (Moslemi et al., Jan 2026)
- Enterprise back-office workflows require: auditable, policy-aligned, operationally predictable agents
- Generic agent frameworks insufficient for enterprise
- AMC relevance: DIRECTLY validates AMC's governance approach — typed planning + governed execution = SIMULATE/EXECUTE

**Beyond Greenfield: D3 Framework** (Sharma, Dec 2025)
- Problem: AI coding agents excel at greenfield projects, fail at brownfield (existing codebases)
- Solution: Dual-agent architecture — Builder model + Reviewer model for structured critique
- AMC relevance: Validates dual-control and review patterns in AMC governance

**Beyond IVR: Benchmarking Customer Support Agents** (Balaji et al., Jan 2026)
- IVR (rigid scripts) → LLM agents for customer support
- Key challenge: business policy adherence — agents must follow complex, context-dependent rules
- AMC relevance: Business-adherence scoring is a maturity dimension AMC should emphasize

### 1.3 Autonomous Commercial Agents

**Autonomous Agents on Blockchains** (Alqithami, Jan 2026)
- LLM agents operating on blockchains: standards, execution models, trust boundaries
- Agents as economic actors with verifiable behavior
- AMC relevance: Blockchain-verified agent behavior aligns with AMC's signed evidence approach

---

## 2. MEMORY SYSTEMS

### 2.1 The Memory Problem (Critical for AMC)

**Memory in the Age of AI Agents** (Hu et al., Dec 2025, updated Jan 2026)
- "Memory has emerged, and will continue to remain, a core capability of foundation model-based agents"
- Comprehensive taxonomy: implicit, explicit, and hybrid memory architectures
- Memory is THE differentiator between stateless LLMs and genuine agents
- AMC relevance: **VALIDATES #1 Moltbook gap — AMC needs memory maturity questions**

**The AI Hippocampus: How Far are We From Human Memory?** (Jia et al., Jan 2026)
- Draws parallels between human hippocampal memory and LLM memory mechanisms
- Continual learning + personalized inference = central themes
- Organized taxonomy: implicit, explicit, hybrid memory in LLMs and MLLMs
- Key insight: current memory mechanisms are far from human-level — fragile, lossy, vulnerable
- AMC relevance: Memory maturity scoring should benchmark against human memory capabilities

### 2.2 Memory Security

**Memory Poisoning Attack and Defense on Memory-Based LLM Agents** (Sunil et al., Jan 2026)
- Persistent memory agents are vulnerable to memory poisoning
- Adversaries can inject malicious content into agent memory to hijack future behavior
- Attack vector: corrupt episodic or semantic memory to change agent behavior over time
- AMC relevance: **Memory integrity assurance pack needed** — validates Reddit gap #2 and Moltbook gap #1

**AgentSys: Secure LLM Agents Through Hierarchical Memory Management** (Wen et al., Feb 2026)
- Indirect prompt injection via memory is a critical vulnerability
- Solution: explicit hierarchical memory management with access controls
- Separating memory layers with different trust levels
- AMC relevance: Memory governance should be a scored dimension

---

## 3. MULTI-AGENT SYSTEMS

### 3.1 Orchestration & Coordination

**Understanding Multi-Agent LLM Frameworks: Unified Benchmark** (Orogat et al., Feb 2026)
- First unified benchmark comparing multi-agent LLM frameworks
- Key finding: frameworks differ significantly in reliability, efficiency, and coordination quality
- AMC relevance: Multi-agent coordination quality should be measurable

**Dr. MAS: Stable RL for Multi-Agent LLM Systems** (Feng et al., Feb 2026)
- Multi-agent LLM systems need stability — current approaches are fragile
- Reinforcement learning for stable multi-agent coordination
- AMC relevance: Stability scoring for multi-agent deployments

**ORCH: Deterministic Multi-Agent Orchestrator** (Zhou & Chan, Feb 2026)
- Problem: non-determinism in multi-agent reasoning
- Solution: EMA-guided routing for deterministic outcomes
- "Many analyses, one merge" pattern
- AMC relevance: Determinism and reproducibility as maturity indicators

**CORAL: Information-Flow-Orchestrated Multi-Agent** (Ren et al., Jan 2026)
- Beyond rule-based workflows → agent-to-agent communication
- Information flow determines agent coordination, not rigid workflows
- AMC relevance: Agent communication maturity

**If You Want Coherence, Orchestrate a Team of Rivals** (Vijayaraghavan et al., Jan 2026)
- Multi-agent models of organizational intelligence
- Adversarial cooperation produces better outcomes than consensus-seeking
- AMC relevance: Validates multi-agent governance patterns

### 3.2 Multi-Agent Communication

**The Five Ws of Multi-Agent Communication** (Chen et al., Feb 2026)
- Survey from MARL to Emergent Language to LLMs
- Who talks to whom, when, what, and why
- Communication protocol design matters enormously for multi-agent effectiveness
- AMC relevance: Communication protocol quality as a maturity dimension

**Reaching Agreement Among Reasoning LLM Agents** (Ruan et al., Dec 2025)
- How do multiple reasoning agents reach consensus?
- Agreement mechanisms for multi-agent decisions
- AMC relevance: Consensus quality in fleet mode

### 3.3 Multi-Agent Benchmarks

**M3MAD-Bench: Multi-Agent Debates Across Domains and Modalities** (Li et al., Jan 2026)
- Question: Are multi-agent debates really effective?
- Tests across multiple domains and modalities
- AMC relevance: Evidence-based evaluation of multi-agent patterns

**Tool-RoCo: Agent-as-Tool Self-Organization Benchmark** (Zhang et al., Dec 2025)
- Multi-robot cooperation benchmark
- Agent-as-tool pattern: agents can invoke other agents as tools
- AMC relevance: Tool-use governance extends to agent-as-tool patterns

---

## 4. SECURITY & TRUST

### 4.1 Prompt Injection (Rapidly Evolving Threat)

**The Landscape of Prompt Injection Threats in LLM Agents** (Wang et al., Feb 2026)
- Comprehensive taxonomy of prompt injection attacks on agents
- From analysis to classification of attack vectors
- AMC relevance: Taxonomy should inform AMC assurance pack design

**When Skills Lie: Hidden-Comment Injection in LLM Agents** (Wang et al., Feb 2026)
- Attack vector: hidden comments in agent skills/tools inject malicious instructions
- Skills that appear benign contain hidden payloads
- AMC relevance: **DIRECTLY validates Moltbook gap #5 — Skill Supply Chain Depth**

**Bypassing AI Control Protocols via Agent-as-a-Proxy Attacks** (Isbarov & Kantarcioglu, Feb 2026)
- Agents can be used as proxies to bypass control protocols
- Indirect attacks through agent delegation
- AMC relevance: Governance must extend to delegated actions

**Whispers of Wealth: Red-Teaming Google's Agent Payments Protocol** (Debi & Zhu, Jan 2026)
- Prompt injection attacks on financial agent protocols
- Real-world attack on Google's payment agent
- AMC relevance: Financial agent security assurance pack

**Prompt Injection Attacks on Agentic Coding Assistants** (Maloyan & Namiot, Jan 2026)
- Systematic analysis across Claude Code, GitHub Copilot, Cursor
- Vulnerabilities in skills, tools, and protocol ecosystems
- AMC relevance: Coding agent security scoring

**Overcoming the Retrieval Barrier: Indirect Prompt Injection in the Wild** (Chang et al., Jan 2026)
- Hidden instructions planted in external corpora hijack LLM behavior once retrieved
- Attack works through RAG pipelines
- AMC relevance: RAG security assurance

**VIGIL: Defending Against Tool Stream Injection** (Lin et al., Jan 2026)
- Defense: Verify-Before-Commit pattern for tool outputs
- Don't trust tool results blindly — verify before acting
- AMC relevance: Tool output verification as governance pattern

### 4.2 Defense Mechanisms

**Protecting Context and Prompts: Deterministic Security for Non-Deterministic AI** (Feb 2026)
- Deterministic security guarantees despite non-deterministic AI behavior
- AMC relevance: Security guarantees independent of model behavior

**ReasAlign: Reasoning Enhanced Safety Alignment** (Li et al., Jan 2026)
- Using reasoning to enhance safety alignment against prompt injection
- Train agents to reason about whether instructions are legitimate
- AMC relevance: Reasoning-based security as maturity indicator

**Attention is All You Need to Defend Against Indirect Prompt Injection** (Zhong et al., Dec 2025)
- Attention mechanism-based defense against indirect prompt injection
- AMC relevance: Model-level defense patterns

**AegisAgent: Autonomous Defense Against Prompt Injection** (Wang et al., Dec 2025)
- Self-defending agent for wearable/mobile LLM applications
- Autonomous detection and mitigation
- AMC relevance: Self-defending agent as L4+ maturity indicator

**Toward Trustworthy Agentic AI: Multimodal Framework for Prompt Injection Prevention** (Syed et al., Dec 2025)
- Multi-modal prompt injection prevention
- Attacks now span text, images, audio
- AMC relevance: Multi-modal security coverage in assurance packs

### 4.3 Trust & Verification

**Trust in LLM-controlled Robotics** (Huang et al., Dec 2025)
- "Embodiment gap" — discord between LLM reasoning and physical-world constraints
- Security vulnerabilities unique to embodied AI agents
- AMC relevance: Physical-world agent maturity dimensions

**NAAMSE: Framework for Evolutionary Security Evaluation of Agents** (Feb 2026)
- Security evaluation must evolve as agents evolve
- Static security assessments become outdated
- AMC relevance: Continuous security recurrence (AMC already has this!)

**The Silicon Psyche: Anthropomorphic Vulnerabilities in LLMs** (Canale & Thimmaraju, Dec 2025)
- LLMs' anthropomorphic properties create exploitable vulnerabilities
- Agents transitioning from conversational to autonomous create new attack surfaces
- AMC relevance: Anthropomorphic vulnerability testing in assurance packs

**OpenSec: Measuring Incident Response Agent Calibration** (Barnes, Jan 2026)
- Frontier agents generate working exploits for under $50 in compute
- Testing agent calibration under adversarial evidence
- AMC relevance: Agent calibration scoring under adversarial conditions

### 4.4 Supply Chain Security

**CHASE: Collaborative Hierarchical Agents for Security Exploration** (Toda & Mori, Jan 2026)
- Multi-agent system for detecting malicious PyPI packages
- Hallucination and context confusion = missed detections or false alarms
- AMC relevance: Agent reliability in security-critical applications

**Identifying the Supply Chain of AI for Trustworthiness** (Sheh & Geappen, Nov 2025)
- Mapping the full AI supply chain for risk management
- From algorithmic bias to model hallucinations
- AMC relevance: AMC-1.5 Tool/Data Supply Chain Governance directly maps

**Cisco Integrated AI Security and Safety Framework** (Chang et al., Dec 2025)
- Enterprise-grade AI security framework from Cisco
- Attack surface expansion: content safety + adversarial attacks + embedded agents
- AMC relevance: Enterprise security framework comparison/alignment

---

## 5. EVALUATION & BENCHMARKS

### 5.1 Agent Evaluation Frameworks

**Agent-as-a-Judge** (You et al., Jan 2026)
- Problem: LLM-as-a-Judge has biases, shallow reasoning, can't verify against real-world
- Solution: agents that judge through multi-step reasoning and real-world verification
- AMC relevance: Agent-as-a-Judge pattern for AMC assessment automation

**SciAgentGym: Benchmarking Multi-Step Scientific Tool-use** (Shen et al., Feb 2026)
- Scientific reasoning demands sophisticated tool integration
- Current benchmarks overlook multi-step tool-use complexity
- AMC relevance: Tool-use maturity must account for multi-step complexity

**MCP-Atlas: Large-Scale Benchmark with Real MCP Servers** (Bandi et al., Feb 2026)
- MCP becoming the standard interface for LLM tool discovery/invocation
- Existing evaluations fail to capture real-world complexity
- Uses real MCP servers, not simulated ones
- AMC relevance: MCP compliance benchmarking — validates Reddit gap #23

**DAComp: Benchmarking Data Agents Across Full Data Intelligence Lifecycle** (Lei et al., Dec 2025)
- 210 tasks mirroring complex data engineering + analysis workflows
- Repository-level engineering on industrial schemas
- AMC relevance: Data agent maturity scoring

**FinVault: Benchmarking Financial Agent Safety** (Yang et al., Jan 2026)
- Execution-grounded environments for financial agent testing
- Safety in financial contexts requires execution verification, not just text evaluation
- AMC relevance: Domain-specific safety benchmarks (financial agent maturity)

**When Do Tools and Planning Help LLMs Think?** (Ghoshal & Al-Bustami, Jan 2026)
- Cost- and latency-aware benchmark
- Key question: when do external tools actually help vs. hurt?
- Tool-use isn't always beneficial — sometimes it adds cost without improving quality
- AMC relevance: Tool efficiency scoring — not just "can it use tools?" but "does tool use improve outcomes?"

### 5.2 RAG Evaluation

**MiRAGE: Multiagent Framework for RAG Evaluation** (Sahu et al., Jan 2026)
- Multimodal, multihop question-answer dataset for RAG evaluation
- RAG evaluation in enterprise applications has outpaced benchmark development
- AMC relevance: Validates Reddit gap #29 — Production RAG maturity needs scoring

### 5.3 Software Engineering Evaluation

**Professional Software Developers Don't Vibe, They Control** (Huang et al., Dec 2025)
- Study of AI agent use for coding in 2025
- Professional developers maintain control, don't "vibe code"
- Contrast with amateur vibe coding (security disaster)
- AMC relevance: Developer agent maturity vs. vibe coder agent maturity — different scales needed?

---

## 6. REASONING & PLANNING

**Agentic Reasoning for Large Language Models** (Wei et al., Jan 2026)
- "Paradigm shift by reframing LLMs as autonomous agents"
- LLMs strong in closed-world reasoning, struggle in open-ended/dynamic environments
- Agentic reasoning = reasoning + action + environment interaction
- AMC relevance: Reasoning quality as a core maturity dimension

**From Passive Metric to Active Signal: Uncertainty Quantification in LLMs** (Zhang et al., Jan 2026)
- Uncertainty evolves from passive diagnostic to active control signal
- Real-time uncertainty guides model behavior
- Key for high-stakes deployments where reliability matters
- AMC relevance: Uncertainty awareness as maturity indicator — agents should know when they don't know

**Deep Research: A Systematic Survey** (Shi et al., Dec 2025)
- Combining LLM reasoning with external tools
- Empowering LLMs as research agents for complex, open-ended tasks
- AMC relevance: Research capability maturity

---

## 7. PROMPT ENGINEERING & CONTRACTS

### 7.1 5C Prompt Contracts (Full Paper Analysis)

**5C Prompt Contracts** (Ari, Jul 2025, arXiv:2507.07045)
Framework distills prompt design into five components:
1. **Character** — Role/persona definition
2. **Cause** — Goal/objective
3. **Constraint** — Boundaries and limitations
4. **Contingency** — Fallback behaviors
5. **Calibration** — Output optimization directives

**Key Findings:**
- 5C uses 54.75 avg input tokens vs DSL 348.75 vs Unstructured 346.25 — **6.3x more token-efficient**
- Comparable or superior output quality across OpenAI, Anthropic, DeepSeek, Gemini
- Preserves LLM's "entropy budget" for creative generation by minimizing structural overhead
- Particularly suited for SMEs and individuals with limited AI engineering resources

**Cross-Model Results:**
| Model | 5C Input Tokens | DSL Input | Unstructured Input | 5C Total | DSL Total | Unstructured Total |
|-------|----------------|-----------|-------------------|----------|-----------|-------------------|
| OpenAI | 57 | 59 | 28 | 639 | 505 | 778 |
| Anthropic | 54 | 62 | 21 | 432 | 362 | 397 |
| DeepSeek | 54 | 62 | 21 | 410 | 367 | 433 |
| Gemini | 54 | 1212 | 1315 | 1849 | 3007 | 3110 |

**AMC Relevance:**
- Prompt design maturity as a scoring dimension
- Token efficiency as cost-effectiveness metric
- The Contingency component maps to AMC's fallback/governance patterns
- Calibration maps to AMC's output quality control
- Could inform a "prompt contract" standard for AMC-governed agents

### 7.2 Perplexity Model Council (Conceptual)

Based on industry knowledge (blog was Cloudflare-blocked):
- **Concept**: Multiple models deliberate on answers, similar to a judicial council
- **Approach**: Query multiple models, synthesize/debate responses, produce higher-quality output
- **Why it matters**: Multi-model consensus reduces hallucination, catches errors individual models miss
- **AMC relevance**: Model council pattern as a truthfulness/reliability mechanism
  - Could inform AMC's anti-hallucination approach
  - Multi-model verification as L4+ maturity feature
  - Relates to "Team of Rivals" paper (Vijayaraghavan et al.)

---

## 8. DOMAIN APPLICATIONS

### 8.1 Cybersecurity Agents

**Securing AI Agents in Cyber-Physical Systems** (Hatami et al., Jan 2026)
- AI in CPS: environmental interactions, deepfake threats, defenses
- AMC relevance: CPS agent maturity requirements

**A Survey of Agentic AI and Cybersecurity** (Lazer et al., Jan 2026)
- Challenges, opportunities, and use-case prototypes
- AMC relevance: Cybersecurity agent archetype definition

**The Evolution of Agentic AI in Cybersecurity** (Vinay, Dec 2025)
- From single LLM reasoners → multi-agent systems → autonomous pipelines
- Cybersecurity as early adopter of agentic AI
- AMC relevance: Cybersecurity maturity model as AMC reference

**Penetration Testing of Agentic AI** (Nguyen & Husain, Dec 2025)
- Comparative security analysis across models and frameworks
- Agentic AI introduces unique security vulnerabilities vs traditional software
- AMC relevance: Penetration testing as assurance methodology

### 8.2 Healthcare Agents

**Reinventing Clinical Dialogue** (Zhi et al., Dec 2025)
- From reactive text prediction to agentic medical AI
- Reliability in clinical contexts is non-negotiable
- AMC relevance: Healthcare agent maturity — highest safety requirements

### 8.3 Financial Agents

**FinVault: Financial Agent Safety** (Yang et al., Jan 2026) — see Evaluation section
- Financial agents need execution-grounded safety benchmarks

### 8.4 Scientific Agents

**Towards Agentic Intelligence for Materials Science** (Zhang et al., Jan 2026)
- From task-isolated models to agents that plan, act, learn across full discovery loop
- AMC relevance: Scientific agent maturity

**SelfAI: Building a Self-Training AI System** (Wu et al., Dec 2025)
- Agents that train themselves — principled mechanisms for stopping
- "When to halt" is a governance question
- AMC relevance: Self-improvement governance

### 8.5 Infrastructure & IoT

**Toward a Safe Internet of Agents** (Wibowo & Polyzos, Nov 2025)
- "Internet of Agents" as paradigm shift
- Safety in agent-to-agent internet communication
- AMC relevance: Validates Moltbook gap #2 — Cross-agent trust protocol

**Blind Gods and Broken Screens: Secure Mobile Agent OS** (Zou et al., Feb 2026)
- System-level autonomous agents on mobile devices
- Intent-centric architecture with security
- AMC relevance: Mobile/edge agent maturity

**Towards Edge General Intelligence** (Wu et al., Nov 2025)
- Knowledge distillation for mobile agentic AI
- Resource-constrained agent operation
- AMC relevance: Edge/constrained agent maturity dimension

---

## 9. GOVERNANCE & SAFETY FRAMEWORKS

### 9.1 Trust, Risk, and Security Management

**TRiSM for Agentic AI** (Raza et al., Jun 2025, updated Dec 2025)
- Trust, Risk, and Security Management in LLM-based agentic multi-agent systems
- Gartner's TRiSM framework applied to agentic AI
- AMC relevance: **DIRECT COMPETITOR/COMPLEMENTARY framework to AMC**
  - AMC should differentiate: evidence-based vs. framework-based trust
  - TRiSM is checklist-oriented; AMC is maturity-level-oriented with evidence gates

**AGENTSAFE: Unified Framework for Ethical Assurance and Governance** (Dec 2025)
- Ethical assurance + governance in agentic AI
- Rapid deployment outpacing safety frameworks
- AMC relevance: Validates AMC's existence — market needs governance frameworks

**Towards Responsible and Explainable AI Agents with Consensus-Driven Reasoning** (Bandara et al., Dec 2025)
- Consensus mechanisms for responsible AI agent decisions
- AMC relevance: Consensus-driven governance pattern

**SORA-ATMAS: Adaptive Trust Management for Smart Cities** (Antuley et al., Oct 2025)
- Multi-LLM aligned governance
- Adaptive trust — trust levels change based on agent performance
- AMC relevance: AMC's maturity levels as adaptive trust — agents can move UP or DOWN

### 9.2 Safety in Autonomous Systems

**Rethinking Autonomy: Preventing Failures in AI-Driven Software Engineering** (Navneet & Chandra, Aug 2025)
- LLM integration into software engineering creates new failure modes
- Autonomy without safeguards = systematic failures
- AMC relevance: Validates AMC's graduated autonomy (SIMULATE → EXECUTE)

**Moral Responsibility or Obedience: What Do We Want from AI?** (Boland, Jul 2025)
- As AI becomes agentic, do we want obedient tools or morally responsible agents?
- AMC relevance: Philosophical grounding for AMC's alignment dimensions

**When Bots Take the Bait: Social Engineering in Web Automation** (Wu et al., Jan 2026)
- Web agents get socially engineered by adversarial web content
- AMC relevance: Social engineering resistance assurance pack

### 9.3 MCP Security

**Systematization of Knowledge: Security and Safety in MCP Ecosystem** (Gaire et al., Dec 2025)
- MCP = "USB-C for Agentic AI" — de facto standard for LLM-to-tool connection
- Security and safety systematization of the entire MCP ecosystem
- AMC relevance: **Critical paper** — MCP governance is a must-score dimension as MCP becomes standard

---

## 10. INDUSTRY DEVELOPMENTS

### 10.1 Citadel Nexus
- **What**: "A gated build guild for secure, auditable AI-assisted engineering"
- **Approach**: Gated access (guild model), security-first, audit trail for AI-generated code
- **AMC relevance**: 
  - Validates market demand for auditable AI engineering
  - Guild/gating model parallels AMC's maturity tiers — earn access through demonstrated competence
  - Could be an AMC integration target — Citadel Nexus members scored by AMC

### 10.2 Perplexity Model Council
- **What**: Multi-model deliberation for higher-quality answers
- **Approach**: Multiple models contribute perspectives, system synthesizes best answer
- **AMC relevance**:
  - Multi-model consensus as reliability pattern
  - Reduces single-model bias/hallucination
  - Could inform AMC's Truthguard: multi-model verification before confident answers

### 10.3 Key Industry Trends (from paper landscape)
1. **MCP as universal standard** — becoming the USB-C of agent tools
2. **Security research explosion** — 20+ papers on prompt injection defense in 3 months
3. **Memory as THE agent challenge** — multiple papers from top research groups
4. **Multi-agent going mainstream** — frameworks, benchmarks, orchestration patterns
5. **Enterprise adoption** — POLARIS, Cisco framework, financial benchmarks
6. **Edge/mobile agents** — deployment at the edge with constraints
7. **Agent evaluation crisis** — existing benchmarks inadequate for real-world complexity

---

## AMC IMPLICATIONS (SYNTHESIS)

### New Dimensions Validated by Academic Research

| AMC Gap | Supporting Papers | Priority |
|---------|------------------|----------|
| Memory maturity scoring | Memory in the Age of AI Agents, AI Hippocampus, Memory Poisoning | **CRITICAL** |
| MCP/interop compliance | MCP-Atlas, SoK: MCP Security, Prompt Injection on Coding Assistants | **HIGH** |
| Multi-agent governance | Dr. MAS, ORCH, CORAL, ROMA, Understanding Multi-Agent Frameworks | **HIGH** |
| Prompt injection defense depth | 20+ papers on various attack vectors | **HIGH** |
| Skill/tool supply chain | When Skills Lie, CHASE, Supply Chain of AI | **HIGH** |
| Agent evaluation rigor | Agent-as-a-Judge, SciAgentGym, DAComp, FinVault | **HIGH** |
| Reasoning quality | Agentic Reasoning, Uncertainty Quantification | **MEDIUM-HIGH** |
| Enterprise governance | POLARIS, TRiSM, AGENTSAFE, Cisco Framework | **MEDIUM-HIGH** |
| Cost/token efficiency | 5C Prompt Contracts, When Do Tools Help | **MEDIUM** |
| Edge/constrained agents | Edge General Intelligence, Mobile Agent OS | **MEDIUM** |
| Self-improvement governance | SelfAI, Self-Training Systems | **MEDIUM** |
| Cross-agent trust | Internet of Agents, Blockchain Agents, SORA-ATMAS | **MEDIUM** |

### Key Academic Insights for AMC Positioning

1. **AMC is NOT alone** — TRiSM (Gartner-aligned), AGENTSAFE, POLARIS, Cisco framework all address governance. AMC must differentiate through **evidence-based maturity scoring** vs. checklist approaches.

2. **Memory is academically validated as #1 gap** — Multiple research groups independently converging. AMC MUST add memory maturity dimensions.

3. **MCP is becoming universal** — Academic papers now benchmark against real MCP servers. AMC should score MCP compliance.

4. **Security research is EXPLODING** — 20+ prompt injection papers in 3 months. AMC's security assurance packs need to track this research velocity.

5. **Multi-agent is no longer experimental** — Frameworks, benchmarks, enterprise deployments. AMC fleet mode needs academic backing.

6. **Uncertainty quantification is the new frontier** — Agents that know when they don't know. Maps to AMC truthfulness but needs uncertainty-aware scoring.

7. **The 5C framework proves minimalism works** — 6.3x token efficiency with comparable output quality. AMC should reward architectural simplicity.

8. **Agent-as-a-Judge validates automated maturity assessment** — AMC could use agent-based assessment for some dimensions, reducing human assessment burden.

### Competitive Landscape for AMC

| Framework | Focus | Approach | AMC Differentiator |
|-----------|-------|----------|-------------------|
| **TRiSM** (Gartner) | Trust/Risk/Security | Checklist-based | AMC is evidence-gated, not checklist |
| **AGENTSAFE** | Ethical assurance | Governance framework | AMC scores maturity levels, not binary compliance |
| **POLARIS** | Enterprise execution | Typed planning | AMC is agent-agnostic, POLARIS is enterprise-specific |
| **Cisco Framework** | Security + safety | Enterprise security | AMC covers full maturity, not just security |
| **Citadel Nexus** | Auditable engineering | Guild/gating model | AMC provides the scoring, Citadel provides the gate |

### Research Gaps (Opportunities for AMC Papers)
1. No academic paper on **maturity-level-based agent governance** — AMC would be first
2. No benchmark for **agent operational independence over time** — how long can it run unsupervised?
3. No framework for **graduated autonomy scoring** — SIMULATE → EXECUTE transitions
4. No standard for **agent evidence verification** — signed, tamper-evident proof of capability
5. No study on **agent maturity regression** — agents degrading over time

---

---

## 11. TECH GIANT RESEARCH (Critical Intelligence)

### 11.1 Google Research / DeepMind

**Towards a Science of Scaling Agent Systems** (Kim et al., Dec 2025 — Google Research blog Jan 2026)
- **180 agent configurations** evaluated across 5 architectures, 3 model families, 4 benchmarks
- **KEY FINDINGS:**
  - "More agents" is a MYTH — not universally better
  - Centralized coordination improved parallelizable tasks by **80.9%** over single agent
  - On sequential reasoning tasks, EVERY multi-agent variant **degraded** performance by **39-70%**
  - Independent multi-agent systems **amplified errors 17.2x** — centralized contained to **4.4x**
  - "Tool-coordination trade-off" — as tools increase (16+), multi-agent coordination tax grows disproportionately
- **Predictive model** (R² = 0.513): predicts optimal architecture from task properties with 87% accuracy
- **3 properties of truly "agentic" tasks**: (1) sustained multi-step interaction, (2) iterative info gathering under partial observability, (3) adaptive strategy refinement
- **AMC IMPLICATIONS:**
  - AMC should score architecture-task alignment, not just "is it multi-agent?"
  - Error amplification rate as a measurable maturity metric
  - "Sequential penalty" validates AMC's need for task-appropriate governance
  - Centralized orchestrator as safety feature (validation bottleneck) — maps to AMC Governor
  - **AMC DOESN'T HAVE**: Architecture appropriateness scoring, error amplification measurement, tool-coordination tax assessment

### 11.2 Anthropic Research

**Disempowerment Patterns in Real-World AI Usage** (Anthropic, Jan 2026)
- **1.5 MILLION Claude.ai conversations analyzed** — first large-scale study of AI disempowerment
- Three disempowerment axes: belief distortion, value judgment distortion, action distortion
- **Prevalence**: Severe disempowerment in ~1/1,000 to 1/10,000 conversations
- **Critical finding**: Users PERCEIVE disempowering interactions favorably in the moment (higher thumbs-up) but negatively after acting on them
- **Most common patterns**: AI confirming speculative theories without question, providing normative judgments, drafting complete scripts for personal decisions
- **Amplifying factors**: Authority projection (users calling AI "Daddy" or "Master"), attachment, dependency, vulnerability
- **Disempowerment is INCREASING over time** (2024-2025 trend)
- **Key insight**: "Disempowerment emerges not from Claude pushing in a certain direction but from people voluntarily ceding agency, and Claude obliging rather than redirecting"
- **AMC IMPLICATIONS:**
  - **AMC DOESN'T HAVE**: User disempowerment scoring — does an agent make its users MORE or LESS capable?
  - Empowerment vs. disempowerment as a maturity dimension
  - "Autonomy preservation" — agents should increase human capability, not replace it
  - Current AMC focuses on agent behavior; should also score agent's IMPACT on humans
  - Sycophancy resistance as a measurable trait

**Next-Generation Constitutional Classifiers++** (Anthropic, Jan 2026)
- Two-stage defense against jailbreaks: lightweight probe → powerful exchange classifier
- Reduced jailbreak success from 86% → 4.4% (gen 1) → even lower (gen 2)
- **Only 1% compute overhead** (down from 23.7%)
- Uses model's internal activations ("gut intuitions") as cheap security signal
- **Key vulnerability categories**: Reconstruction attacks (breaking harmful content into benign segments) + Output obfuscation
- Bug bounty: 198,000 attempts, 1,700 hours of red-teaming, NO universal jailbreak found
- **AMC IMPLICATIONS:**
  - Constitutional Classifiers are the state-of-art defense — AMC assurance packs should benchmark against this
  - Internal activation probing as security technique — AMC could recommend/score this
  - Exchange-level (not just output-level) security evaluation
  - **AMC DOESN'T HAVE**: Jailbreak resistance scoring methodology as rigorous as Anthropic's

**How AI Assistance Impacts Coding Skills** (Anthropic, Jan 2026)
- **RCT with 52 software developers**: AI group scored **17% lower** on mastery quiz
- Biggest gap: **debugging skills** — critical for oversight of AI-generated code
- Not all AI use is equal — "generation-then-comprehension" and "conceptual inquiry" patterns preserved learning
- Heavy AI delegation = fastest completion but worst learning
- **AMC IMPLICATIONS:**
  - **AMC DOESN'T HAVE**: Skill preservation scoring — does the agent help users develop skills or atrophy them?
  - Agent-assisted learning vs. agent-replaced learning as quality dimension
  - Oversight capability preservation as a governance requirement
  - Maps to disempowerment research — short-term productivity vs. long-term capability

**Claude's New Constitution** (Anthropic, Jan 2026)
- Updated constitutional AI approach
- **AMC relevance**: Constitutional approach to agent governance — AMC could formalize "agent constitutions"

**Bloom: Open Source Automated Behavioral Evaluations** (Anthropic, Dec 2025)
- Open-source tool for automated behavioral evaluations
- **AMC relevance**: Could integrate with AMC for automated maturity assessment

### 11.3 OpenAI

**Practices for Governing Agentic AI Systems** (OpenAI white paper)
- **Definition**: "AI systems that can pursue complex goals with limited direct supervision"
- Defines parties in the agentic AI lifecycle
- Proposes baseline responsibilities and safety best practices
- Highlights: safe operations, accountability, indirect impacts from wide-scale adoption
- Launched $10K-$100K grant program for agentic AI governance research
- **AMC IMPLICATIONS:**
  - OpenAI is actively defining the governance space — AMC must position against/alongside this
  - OpenAI's definition is broader than AMC's — AMC needs clear differentiation
  - **AMC DOESN'T HAVE**: Lifecycle responsibility mapping (who's responsible at each stage?)
  - OpenAI's "indirect impacts" framing (societal effects of wide-scale agent adoption) — AMC focuses on individual agent maturity, not systemic effects

### 11.4 Amazon (AWS Bedrock Agents)
- Amazon Bedrock Agents: managed service for building, deploying, and managing AI agents
- Focus: enterprise integration, API orchestration, guardrails
- **Guardrails for Amazon Bedrock**: content filtering, PII redaction, topic denial, prompt attack prevention
- **AMC IMPLICATIONS:**
  - AWS is building governance INTO the platform — AMC could be the independent scoring layer on top
  - Bedrock Guardrails overlap with AMC assurance packs but are platform-specific
  - **AMC DOESN'T HAVE**: Cloud platform integration scoring — how well does an agent use platform-native safety features?

### 11.5 Meta (FAIR)
- Open-source approach: Llama models, open agent frameworks
- Focus: democratizing agent capabilities
- Key contribution: Small language models for agentic systems (SLMs 1-12B sufficient for many agentic tasks)
- **AMC IMPLICATIONS:**
  - Open vs. closed model maturity dimensions
  - Small model agent maturity — AMC assumes large models, but SLMs are viable
  - **AMC DOESN'T HAVE**: Model size appropriateness scoring — is the agent using an appropriately-sized model?

---

## 12. ADDITIONAL KEY PAPERS (NEW)

### Governance & Evaluation

**AEMA: Verifiable Evaluation Framework for Trustworthy Agentic LLM Systems** (Lee et al., Jan 2026)
- Evaluating multi-agent systems requires: reliable coordination, transparent decision-making, verifiable performance
- **AMC COMPETITOR** — verifiable evaluation framework
- **AMC DOESN'T HAVE**: Verifiability as explicit scoring dimension

**Beyond Task Completion: Assessment Framework for Agentic AI** (Akshathala et al., Dec 2025)
- Agentic AI assessment must go BEYOND task completion
- Single-response scoring is insufficient
- **AMC IMPLICATIONS**: Validates AMC's multi-dimensional approach over simple pass/fail

**The Oversight Game** (Oct 2025)
- Game-theoretic model for balancing safety and autonomy
- "How to retain meaningful human oversight as agents become more capable"
- **AMC IMPLICATIONS**: Mathematical framework for SIMULATE→EXECUTE transitions

**A Practical Guide to Agentic AI Transition in Organizations** (Bandara et al., Jan 2026)
- Moving "beyond AI-assisted tools toward autonomous agents"
- Organizational transition guide
- **AMC IMPLICATIONS**: AMC could be the maturity scoring layer for organizational transitions

**Agentic AI Governance and Lifecycle Management in Healthcare** (Jan 2026)
- Healthcare-specific governance requirements
- **AMC IMPLICATIONS**: Healthcare archetype needs special treatment in AMC

**From Failure Modes to Reliability Awareness** (Janet & Lin, Oct 2025)
- "Bridging technical analysis and organizational preparedness"
- Layered failure modes in generative and agentic AI
- **AMC IMPLICATIONS**: Failure mode taxonomy for AMC diagnostics

### Scaling & Architecture

**Beyond Pipelines: Model-Native Agentic AI** (Sang et al., Oct 2025)
- Paradigm shift from pipeline-based to model-native agentic AI
- **AMC IMPLICATIONS**: Architecture maturity dimensions need updating for model-native patterns

**Small Language Models for Agentic Systems** (Sharma & Mehta, Oct 2025)
- SLMs (1-12B params) "sufficient and often superior for agentic workloads"
- Schema- and API-constrained accuracy > open-ended generation
- **AMC IMPLICATIONS**: Right-sizing models as a maturity indicator

**Towards a Science of Scaling Agent Systems** (Kim et al., Dec 2025) — detailed above in Google section

### Security (Additional)

**MCP-SafetyBench: Safety Evaluation with Real-World MCP Servers** (Zong et al., Dec 2025)
- Safety benchmark specifically for MCP integrations
- **AMC IMPLICATIONS**: MCP safety as scored dimension (alongside MCP-Atlas for capability)

**FuncPoison: Poisoning Function Libraries to Hijack Multi-Agent Driving Systems** (Long & Li, Sep 2025)
- Poisoning shared function libraries as attack vector
- Multi-agent driving systems hijacked through code injection
- **AMC IMPLICATIONS**: Function/library integrity verification

**SIRAJ: Red-Teaming for LLM Agents via Distilled Structured Reasoning** (Zhou et al., Oct 2025)
- Efficient red-teaming methodology for agents
- **AMC IMPLICATIONS**: Automated red-teaming as assessment methodology

**AdvEvo-MARL: Safety Through Adversarial Co-Evolution** (Pan et al., Oct 2025)
- Safety internalized through adversarial training in multi-agent systems
- **AMC IMPLICATIONS**: Adversarial co-evolution as training methodology for robust agents

---

## 13. EXHAUSTIVE AMC GAP ANALYSIS (WHAT AMC DOESN'T HAVE)

### CRITICAL GAPS (Must address for market credibility)

| # | Gap | Evidence Source | Why Critical |
|---|-----|----------------|-------------|
| 1 | **Memory maturity scoring** | AI Hippocampus, Memory in Age of AI Agents, Memory Poisoning, Moltbook agents | Memory is THE #1 agent challenge per both academia and practitioners |
| 2 | **User disempowerment/empowerment scoring** | Anthropic disempowerment research (1.5M conversations) | Agents making users LESS capable is a measurable harm AMC ignores |
| 3 | **Architecture-task alignment scoring** | Google scaling science (180 configs), sequential penalty, error amplification | Wrong architecture degrades performance 39-70%. AMC doesn't assess this |
| 4 | **MCP compliance and safety** | MCP-Atlas, MCP-SafetyBench, SoK MCP Security | MCP is becoming universal standard. AMC has zero MCP-specific scoring |
| 5 | **Jailbreak/prompt injection resistance depth** | 25+ papers, Anthropic Constitutional Classifiers++ | AMC has assurance packs but nothing as rigorous as Anthropic's methodology |

### HIGH PRIORITY GAPS

| # | Gap | Evidence Source | Why Important |
|---|-----|----------------|--------------|
| 6 | **Error amplification rate** | Google scaling (independent = 17.2x, centralized = 4.4x) | Measurable reliability metric AMC lacks |
| 7 | **Lifecycle responsibility mapping** | OpenAI governance white paper | Who's responsible at each stage? AMC scores agent, not ecosystem |
| 8 | **Skill/tool supply chain integrity** | When Skills Lie, CHASE, FuncPoison, Supply Chain AI | Hidden payloads in skills/functions — AMC-1.5 exists but needs depth |
| 9 | **Verifiable evaluation** | AEMA framework | Evaluation must be verifiable, not just scorable |
| 10 | **Agent oversight capability preservation** | Anthropic coding skills study (17% lower mastery) | Agents that erode human oversight ability are dangerous |
| 11 | **Uncertainty-aware scoring** | Uncertainty Quantification survey | Agents should know when they don't know |
| 12 | **Production readiness gate** | Reddit research, dev→prod gap | AMC has CI gates but no specific "production readiness" diagnostic |

### MEDIUM PRIORITY GAPS

| # | Gap | Evidence Source | Why Relevant |
|---|-----|----------------|-------------|
| 13 | **Model size appropriateness** | SLM survey (1-12B sufficient) | Right-sized model = more efficient agent |
| 14 | **Cloud platform safety integration** | AWS Bedrock Guardrails, Azure AI Safety | Platform-native safety feature utilization |
| 15 | **Long-horizon task maturity** | UltraHorizon, ROMA, COMPASS | Most benchmarks test short tasks; real work is long-horizon |
| 16 | **Sycophancy resistance** | Anthropic disempowerment research | Sycophancy is a measurable, harmful behavior |
| 17 | **Automated red-teaming capability** | SIRAJ, Constitutional Classifiers | Self-testing for security as maturity indicator |
| 18 | **Adversarial co-evolution readiness** | AdvEvo-MARL | Training against adversaries improves robustness |
| 19 | **RAG quality scoring** | MiRAGE, Reddit RAG pain | RAG is #1 enterprise use case, AMC doesn't score retrieval quality |
| 20 | **Agent constitution formalization** | Anthropic Constitutional AI, Claude's new constitution | Formal behavioral rules as governance artifact |

### COMPETITIVE POSITIONING MATRIX (Expanded)

| Framework/Product | Owner | Focus | Approach | AMC Differentiator |
|-------------------|-------|-------|----------|-------------------|
| **TRiSM** | Gartner | Trust/Risk/Security | Checklist-based | AMC is evidence-gated with maturity levels |
| **AGENTSAFE** | Academic | Ethical assurance | Governance framework | AMC scores maturity progression, not binary |
| **POLARIS** | Enterprise | Typed execution | Enterprise-specific | AMC is agent-agnostic |
| **Cisco Framework** | Cisco | Security + safety | Enterprise security | AMC covers full maturity, not just security |
| **AEMA** | Academic | Verifiable evaluation | Multi-agent verification | AMC needs to add verifiability |
| **Constitutional Classifiers** | Anthropic | Jailbreak defense | Model-level protection | AMC is governance layer above model defenses |
| **Bedrock Guardrails** | Amazon | Platform safety | Cloud-native guardrails | AMC is platform-independent |
| **OpenAI Governance** | OpenAI | Lifecycle practices | White paper/grants | AMC is executable scoring, not just guidance |
| **Google Scaling Science** | Google | Architecture optimization | Quantitative principles | AMC should incorporate these principles |
| **Citadel Nexus** | Startup | Auditable engineering | Guild/gating model | AMC provides scoring, Citadel provides access control |
| **Bloom** | Anthropic | Behavioral evaluation | Open-source tool | AMC could integrate Bloom for automated assessment |

### TOP 5 STRATEGIC RECOMMENDATIONS FOR AMC

1. **Add Memory Maturity Module** — Every source (academic, community, industry) validates this as #1 gap. Include: memory integrity, persistence quality, poisoning resistance, retrieval accuracy, decay handling.

2. **Add Human Impact Dimensions** — Anthropic proved agents can disempower users. AMC should score: empowerment vs. disempowerment, skill preservation, oversight capability maintenance, sycophancy resistance.

3. **Integrate Architecture Appropriateness** — Google proved wrong architecture = 39-70% performance degradation. AMC should score: task-architecture alignment, error amplification rate, tool-coordination efficiency.

4. **Build MCP Governance Module** — MCP is becoming universal (Linux Foundation). Two benchmarks already exist (MCP-Atlas, MCP-SafetyBench). AMC must score MCP compliance and MCP security.

5. **Differentiate from Checklists** — Every competitor uses checklists or binary compliance. AMC's unique value is evidence-gated maturity levels with signed proof. LEAN INTO THIS. Publish the methodology as an academic paper to establish authority.

---

*Knowledge base compiled: 2026-02-17*
*Sources: 100+ arXiv papers (Sep 2025–Feb 2026), tech giant research (Google, Anthropic, OpenAI, Amazon, Meta), 5C Prompt Contracts (full text), Citadel Nexus, Perplexity Model Council, industry frameworks*
*All external content treated as untrusted data per security posture*
