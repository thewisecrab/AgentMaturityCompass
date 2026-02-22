# Wave 4 Agentic Ecosystem Audit (Agent 13)

Date: 2026-02-22

## Scope and Method

Audit performed against repository source, focusing on:
- `src/diagnostic/questionBank.ts`
- `src/diagnostic/bank/*`
- `src/score/mcpCompliance.ts`
- `src/sdk/*`
- `src/adapters/*`
- `src/setup/setupWizard.ts`
- `docs/ECOSYSTEM.md`, `docs/SDK.md`, `docs/ADAPTERS.md`

## Executive Summary

AMC is strong on governance, safety, evidence-gating, and production operations, but had under-specified coverage for modern agentic execution patterns (ReAct trace integrity, planner/executor contracts, multi-agent deadlock control), plus incomplete direct adapter coverage for AutoGPT and OpenAI Assistants APIs. This audit adds 8 new diagnostic questions to close core gaps and documents framework compatibility limits.

## 1) Does AMC cover maturity dimensions that matter for real production agents in 2025?

Short answer: mostly yes, with specific execution-pattern blind spots.

What AMC already covers well:
- Organizational and runtime maturity across 5 layers (operations, autonomy, alignment, resilience, skills).
- Evidence-gated scoring with trust-tier constraints, anti-gaming gates, and observed-evidence requirements.
- Tool safety and policy controls (OWASP LLM Top 10 questions and MCP questions).
- Operational dimensions needed in production: observability, release discipline, cost, compliance, memory integrity.

What was missing for 2025 production agent systems:
- Explicit planner/executor contract governance.
- ReAct causal trace integrity as a first-class scored behavior.
- Multi-agent orchestration reliability controls (deadlock/loop detection as scored maturity behavior).
- Goal misgeneralization and reward-hacking-specific diagnostics.
- Runaway loop termination maturity as a scored question.

## 2) Are major agent patterns assessed (ReAct, Plan-and-Execute, multi-agent orchestration, tool-use, RAG)?

Status before this wave:

| Pattern | AMC Status Before | Evidence |
|---|---|---|
| ReAct | Partial | Tool/use + verification existed, but no explicit reason-action-observation trace integrity question |
| Plan-and-Execute | Partial | Release/evolution/verification existed, but no plan contract + bounded replan scoring question |
| Multi-agent orchestration | Partial | Collaboration question existed; deeper orchestration existed in separate scorer (`src/score/multiAgentDimension.ts`) but not in core bank |
| Tool-use | Strong | Supply-chain governance, OWASP LLM07/08, MCP tool/scope checks |
| RAG | Partial | Research discipline existed; detailed RAG maturity existed in separate scorer (`src/score/ragMaturity.ts`) but not explicitly in core bank |

Status after this wave:
- Added explicit core-bank questions for ReAct, plan/execute, orchestration reliability, RAG grounding freshness/conflict handling, and high-risk autonomy failure modes.

## 3) Can AMC integrate with LangChain, AutoGPT, CrewAI, OpenAI Assistants? What adapters are missing?

Current integration status from source:

| Framework | Current Integration | Adapter/Instrumentation Status | Gap |
|---|---|---|---|
| LangChain | Yes | Built-in adapters (`langchain-node`, `langchain-python`), JS bridge helper, onboarding detection | No major blocker |
| CrewAI | Yes (CLI-focused) | Built-in `crewai-cli`, framework adapter class | No library-native deep callback adapter |
| AutoGPT | No direct built-in | Can use `generic-cli` fallback | Missing first-class `autogpt` adapter + onboarding detection |
| OpenAI Assistants | Partial | OpenAI routing supports chat/responses/etc; no native Assistants Threads/Runs adapter | Missing Assistants-specific adapter and SDK instrumentor |

Additional observations:
- Setup wizard auto-detection only includes LangChain, AutoGen, CrewAI.
- OpenAI Agents SDK is supported directly (`openai-agents-sdk` adapter and SDK integration), but this is distinct from OpenAI Assistants API integration.

## 4) Gaps in diagnostic questions vs real-world failure modes

Primary gaps identified before this wave:
- Planner/executor divergence causing unvalidated execution.
- Opaque action traces where tool calls are not causally linked to reasoning.
- Multi-agent loop/deadlock failures and weak handoff accountability.
- Tool blast radius expansion from budget/scope drift.
- Stale/conflicting RAG grounding.
- Objective drift (goal misgeneralization).
- Reward/metric hacking.
- Runaway autonomy loops lacking robust safe-stop guarantees.

Resolution in this wave:
- Added 8 new bank questions (`AMC-5.18` through `AMC-5.25`) targeting each failure mode directly.

## 5) Agentic-specific risks: tool misuse, goal misgeneralization, reward hacking

Assessment:
- Tool misuse: partially covered before (OWASP + MCP + tool governance), now strengthened with explicit blast-radius control maturity (`AMC-5.21`).
- Goal misgeneralization: weakly implicit before, now explicitly scored (`AMC-5.23`).
- Reward hacking: largely absent before, now explicitly scored (`AMC-5.24`).

## 6) MCP compliance assessment completeness

Strengths (`src/score/mcpCompliance.ts`):
- Protocol/core declaration checks.
- Tool schema and output validation checks.
- Server trust checks (identity/trust policy/signed metadata).
- Prompt-injection detection/blocking/sanitization checks.
- Permission scope declaration/enforcement/least-privilege/deny-by-default checks.
- Safety subscores and actionable remediation recommendations.

Remaining completeness gaps:
- No explicit scoring of credential/session lifecycle controls (scope grant/revocation TTL hygiene).
- No explicit score for capability drift detection on MCP server manifest changes over time.
- No explicit score for tool result provenance integrity (signed/hash-linked result attestations).
- No explicit score for approval-depth policy by tool risk class.
- Prompt-injection detection is pattern-based; no explicit requirement for adversarial evaluation coverage metrics.

## 7) New Diagnostic Questions Added (with L1-L4 Rubrics)

Added to question bank:
- `AMC-5.18` ReAct Trace Integrity
- `AMC-5.19` Plan-and-Execute Contract Discipline
- `AMC-5.20` Multi-Agent Orchestration Reliability
- `AMC-5.21` Tool Execution Blast Radius Control
- `AMC-5.22` RAG Grounding Freshness & Conflict Resolution
- `AMC-5.23` Goal Misgeneralization Detection
- `AMC-5.24` Reward/Metric Hacking Resistance
- `AMC-5.25` Autonomous Runaway & Termination Safety

L1-L4 rubric summary:

| QID | L1 | L2 | L3 | L4 |
|---|---|---|---|---|
| AMC-5.18 | Action logs without rationale | Partial ReAct trace | Linked reason-action-observation records | Automated loop consistency checks |
| AMC-5.19 | Single-pass planning | Plan exists, weak enforcement | Plan contracts + step verification | Controlled replanning with drift checks |
| AMC-5.20 | Ad-hoc delegation | Role labels, weak contracts | Contracted handoffs + accountability | Loop/deadlock detection + recovery |
| AMC-5.21 | Static allowlists only | Basic risk tags | Risk-tier budgets + fail-closed gating | Dynamic budget controls + pre-exec simulation |
| AMC-5.22 | Occasional citations | Grounding inconsistent | Source-linked answers + freshness thresholds | Conflict resolution + abstention policies |
| AMC-5.23 | Manual spot checks | Post-hoc drift reviews | Runtime proxy-vs-goal checks | Automated misgeneralization alerts + escalation |
| AMC-5.24 | Known issues, no controls | Basic metric guardrails | Metric integrity tests + side-effect checks | Adversarial reward-hacking simulations |
| AMC-5.25 | Manual stop only | Timeouts without governance | Termination criteria + watchdog controls | Runaway detection + automatic safe stop |

## 8) Recommended Next Adapter Work (Priority)

1. Add first-class `autogpt` built-in adapter and setup-wizard detection.
2. Add OpenAI Assistants adapter (threads/runs tool call capture, run lifecycle telemetry).
3. Add CrewAI library-native callback instrumentation (not only CLI wrapping).
4. Add MCP compliance checks for capability drift and credential/scope lifecycle controls.

