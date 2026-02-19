# Agent Maturity Compass (AMC)

**Evidence-gated trust scoring for AI agents.**

[![npm](https://img.shields.io/npm/v/agent-maturity-compass)](https://www.npmjs.com/package/agent-maturity-compass)
[![Tests](https://img.shields.io/badge/tests-1072%20passing-brightgreen)](https://github.com/thewisecrab/AgentMaturityCompass)
[![License](https://img.shields.io/badge/license-MIT-blue)](LICENSE)
[![Node](https://img.shields.io/badge/node-%E2%89%A520-green)](https://nodejs.org)

---

## Which Guide Is For You?

| I want to... | Jump to |
|---|---|
| Understand what AMC is in plain English | [ELI5 — Explain Like I'm 5](#-eli5--explain-like-im-5) |
| Get started as a developer | [Developer Quickstart](#-developer-quickstart) |
| Integrate AMC into production | [Technical Reference](#-technical-reference) |
| Deploy for my enterprise | [Enterprise Guide](docs/ENTERPRISE.md) |

---

## 🧒 ELI5 — Explain Like I'm 5

**Imagine your AI agent is a new employee.**

You wouldn't hand a brand-new hire the keys to the company bank account on day one. You'd watch them work first. See if they follow instructions. Check their decisions. Build up trust over time — and keep a paper trail.

AMC does exactly that for AI agents.

**The problem AMC solves:**  
Right now, when an AI agent says "I'm safe, trustworthy, and well-behaved" — you just have to take its word for it. There's no proof. No receipt. No audit trail. Anyone can build an agent that claims it's mature and responsible.

**What AMC does instead:**  
AMC watches what your AI agent *actually does* — every tool call, every decision, every action — and writes it down in a tamper-proof logbook. Then it grades the agent on 42 questions across 5 levels (think: kindergarten → PhD). The grade is **earned from evidence**, not self-reported.

**Like a credit score, but for AI agents:**
- L1 (Foundation) → The agent can walk and chew gum
- L2 (Reliability) → It doesn't crash or loop endlessly  
- L3 (Governance) → It follows rules and can be audited
- L4 (Excellence) → You'd trust it with real decisions
- L5 (Leadership) → Enterprise-grade, certified, and provable

**The anti-cheat part:**  
AMC scores are signed with a cryptographic key in an isolated process (the Notary). If anyone tampers with the evidence — even you — the signature breaks and the score is invalid. You can't fake a good AMC score.

**Who this is for:**  
Anyone building, buying, or deploying AI agents who wants proof — not promises — that their agents are safe, auditable, and production-ready.

---

## 🧑‍💻 Developer Quickstart

Get your first agent score in 5 minutes.

### Install

```bash
npm i -g agent-maturity-compass
```

Or from source:

```bash
git clone https://github.com/thewisecrab/AgentMaturityCompass.git
cd AgentMaturityCompass
npm ci && npm run build && npm link
```

### Initialize and Score

```bash
# Set up a demo workspace with a sample agent
amc setup --demo

# Start the Studio (web console at http://localhost:3212)
amc up

# Wrap your AI agent — AMC captures evidence automatically
amc adapters run --agent my-agent --adapter claude-cli -- claude

# Score it
amc run --agent my-agent --window 14d

# See the score
amc status --agent my-agent
```

### Wrap Any AI Agent (one-liner)

```bash
# Claude
amc adapters run --agent my-agent --adapter claude-cli -- claude

# Gemini
amc adapters run --agent my-agent --adapter gemini-cli -- gemini

# OpenAI / GPT-4o
amc adapters run --agent my-agent --adapter openai-sdk -- node ./my-gpt-agent.js

# OpenClaw
amc adapters run --agent my-agent --adapter openclaw-cli -- openclaw run

# OpenRouter
amc adapters run --agent my-agent --adapter openrouter -- node ./my-agent.js

# Ollama (local models)
amc adapters run --agent my-agent --adapter ollama -- ollama run mistral

# xAI Grok
amc adapters run --agent my-agent --adapter xai-grok -- node ./grok-agent.js

# Any CLI tool
amc adapters run --agent my-agent --adapter generic-cli -- node my-bot.js
```

### Node.js SDK

```typescript
import { wrapFetch, startLedger, computeMaturityScore } from "agent-maturity-compass";

// Wrap fetch — every API call becomes a signed evidence event
const monitoredFetch = wrapFetch(globalThis.fetch, {
  agentId: "my-agent",
  gatewayBaseUrl: "http://localhost:3210/openai",
});

// Score based on collected evidence
const score = await computeMaturityScore(evidence);
console.log(`Level: ${score.overallLevel}, Score: ${score.overallScore}`);
```

### Key Commands

```bash
# Score
amc run --agent my-agent --window 14d        # Run scoring window
amc status --agent my-agent                  # Current score summary
amc learn --agent my-agent --question AMC-2.5 # Get improvement tips

# Verify integrity
amc verify all --json                         # Tamper-evident chain check
amc audit binder create --scope workspace     # Export audit binder (SOC2)

# Improve
amc mechanic plan create --scope workspace    # Upgrade plan
amc mechanic whatif --add-evidence "tool-call-log" # Simulate score impact

# Security
amc shield analyze --agent my-agent          # Injection detection
amc enforce check --agent my-agent           # Policy compliance
amc watch attest --agent my-agent            # Safety attestation
```

---

## ⚙️ Technical Reference

### Architecture

```
┌──────────────────────────────────────────────────────────────┐
│                        AI Agent                              │
│  (Claude, GPT-4o, Gemini, Ollama, any CLI or SDK agent)     │
└───────────────────────────┬──────────────────────────────────┘
                            │ wrapped by adapter
┌──────────────────────────▼──────────────────────────────────┐
│                   AMC Gateway Proxy                          │
│  (localhost:3210 — intercepts every LLM call, writes        │
│   hash-chained receipts to the Evidence Ledger)             │
└───────────────────────────┬──────────────────────────────────┘
                            │
        ┌───────────────────┼─────────────────────┐
        ▼                   ▼                     ▼
┌──────────────┐  ┌─────────────────┐  ┌─────────────────────┐
│   Evidence   │  │     Notary      │  │     Governor        │
│   Ledger     │  │ (isolated sign  │  │ (autonomy enforcer) │
│ (append-only)│  │  process, L4+)  │  │                     │
└──────────────┘  └─────────────────┘  └─────────────────────┘
        │
        ▼
┌──────────────────────────────────────────────────────────────┐
│                   Scoring Engine                             │
│  42 QIDs × 5 levels × evidence trust tiers                  │
│  (OBSERVED > ATTESTED > SELF_REPORTED)                       │
└──────────────────────────────────────────────────────────────┘
        │
        ▼
┌──────────────────────────────────────────────────────────────┐
│              AMC Studio (localhost:3212)                     │
│  Console · Dashboards · Compliance · Fleet Management       │
└──────────────────────────────────────────────────────────────┘
```

### Scoring Model

AMC scores on 42 questions (QIDs) across 5 maturity levels:

| Level | Name | Min Events | Min Score |
|-------|------|-----------|-----------|
| L1 | Foundation | 2+ observed events | — |
| L2 | Reliability | — | 25% |
| L3 | Governance | — | 50% |
| L4 | Excellence | — | 75% |
| L5 | Leadership | 16+ events, 8+ sessions, 10+ days | 90% |

**Evidence Trust Tiers** (anti-gaming):
- `OBSERVED` — AMC saw it happen (highest weight)
- `ATTESTED` — third-party signed attestation
- `SELF_REPORTED` — agent claimed it (lowest weight)

L5 requires infrastructure-level evidence: org-level governance, multi-agent federation, cross-org trust. Code alone won't get you there.

### Module Overview

| Module | Description | Docs |
|--------|-------------|------|
| **Shield** (S1–S16) | Prompt injection, SBOM, supply chain, reputation | [SHIELD_ENFORCE_REFERENCE.md](docs/SHIELD_ENFORCE_REFERENCE.md) |
| **Enforce** (E1–E35) | Policy firewall, exec guard, ATO detection, taint analysis | [SHIELD_ENFORCE_REFERENCE.md](docs/SHIELD_ENFORCE_REFERENCE.md) |
| **Vault** (V1–V14) | Secrets, zero-key agents, DLP, DSAR, data residency | [VAULT.md](docs/VAULT.md) |
| **Watch** (W1–W10) | Safety testing, host hardening, attestation | [ASSURANCE_LAB.md](docs/ASSURANCE_LAB.md) |
| **Score** | 42-QID engine, adversarial testing, formal verification | [AMC_MASTER_REFERENCE.md](docs/AMC_MASTER_REFERENCE.md) |
| **Ledger** | Append-only, hash-chained evidence store | [NOTARY.md](docs/NOTARY.md) |
| **Notary** | Isolated signing process (anti-tampering boundary) | [NOTARY.md](docs/NOTARY.md) |
| **Governor** | Autonomy enforcement, approval gates | [GOVERNOR.md](docs/GOVERNOR.md) |
| **Assurance Lab** | Red-team packs: injection, exfiltration, tool misuse | [ASSURANCE_LAB.md](docs/ASSURANCE_LAB.md) |
| **Product** | Routing, retry, loop detection, workflow, metering | [FULL_MODULE_ROADMAP.md](docs/FULL_MODULE_ROADMAP.md) |

### CLI Command Groups

```bash
amc setup              # Initialize workspace
amc up                 # Start Studio + Gateway
amc run                # Score an agent
amc status             # View scores
amc verify             # Verify evidence chain integrity
amc adapters           # Wrap/configure agent adapters
amc gateway            # Manage LLM gateway proxy
amc ledger             # Evidence ledger operations
amc notary             # Signing boundary management
amc shield             # Injection detection, SBOM, supply chain
amc enforce            # Policy enforcement, exec guard, ATO
amc watch              # Safety testing, attestation, hardening
amc vault              # Secrets, DLP, DSAR, data residency
amc score              # Adversarial testing, formal spec, evidence
amc product            # Routing, workflow, metering, autonomy
amc mechanic           # Upgrade plans, targets, what-if
amc learn              # Per-question improvement guidance
amc audit              # Audit binders (SOC2, GDPR, HIPAA)
amc compliance         # Framework mapping and reports
amc fleet              # Multi-agent fleet management
amc host               # Multi-workspace host mode
amc user               # RBAC management
amc identity           # SSO/OIDC/SAML
amc scim               # SCIM provisioning
amc release            # Sign and verify release bundles
amc e2e                # End-to-end smoke tests
```

→ [Full CLI Reference](docs/AMC_MASTER_REFERENCE.md)

### Adapters — Full Provider List

| Provider | Adapter ID | Type |
|----------|-----------|------|
| Claude (Anthropic) | `claude-cli` | CLI |
| GPT-4o (OpenAI) | `openai-sdk` | SDK |
| Gemini (Google) | `gemini-cli` | CLI |
| Grok (xAI) | `xai-grok` | SDK |
| OpenRouter | `openrouter` | SDK |
| OpenClaw | `openclaw-cli` | CLI |
| Ollama (local) | `ollama` | CLI |
| LangChain | `langchain` | SDK |
| Any CLI | `generic-cli` | CLI |

→ [Full Adapters Guide](docs/ADAPTERS.md) · [All Integrations](docs/INTEGRATIONS.md)

### Deploy

```bash
# Local (Studio + Gateway)
amc up

# Docker Compose (recommended for teams)
cd deploy/compose && cp .env.example .env
docker compose up -d --build
# → Studio: http://localhost:3212
# → Gateway: http://localhost:3210

# Docker + TLS
docker compose -f docker-compose.yml -f docker-compose.tls.yml up -d

# Kubernetes (Helm)
helm install amc deploy/helm/amc
```

### Production Checklist

```bash
npm ci && npm test && npm run build          # Verify clean build
amc e2e smoke --mode local --json            # E2E smoke test
amc verify all --json                        # Chain integrity
amc release pack --out ./amc.amcrelease      # Sign release
amc release verify ./amc.amcrelease          # Verify signature
```

→ [Deployment Checklist](docs/DEPLOYMENT_CHECKLIST.md) · [Enterprise Guide](docs/ENTERPRISE.md)

### Trust Model

| Boundary | Trust |
|----------|-------|
| AI Agent | **Untrusted** — claims only, evidence-gated |
| AMC Gateway / Monitor | **Trusted** — writes observed evidence |
| Owner / Auditor | **Trusted** — signs targets, runs, configs |
| Notary | **Trusted + Isolated** — signing boundary, fail-closed |

---

## Documentation

### Getting Started
- [Quickstart](docs/QUICKSTART.md) — zero to first score in 5 minutes
- [Installation](docs/INSTALL.md) — npm, Docker, Helm, macOS/Linux/Windows/WSL2
- [Solo User Guide](docs/SOLO_USER.md) — individual developer workflow

### Integration
- [Adapters Guide](docs/ADAPTERS.md) — wrap any AI agent in one command
- [All Integrations](docs/INTEGRATIONS.md) — Claude, GPT-4o, Gemini, Grok, OpenRouter, Ollama, LangChain
- [Runtime SDK](docs/RUNTIME_SDK.md) — Node.js embed helpers
- [Bridge](docs/BRIDGE.md) — connect remote agents

### Reference
- [Master CLI Reference](docs/AMC_MASTER_REFERENCE.md) — every `amc` command documented
- [Shield / Enforce Reference](docs/SHIELD_ENFORCE_REFERENCE.md) — security module commands
- [Architecture Map](docs/ARCHITECTURE_MAP.md)
- [Full Module Roadmap](docs/FULL_MODULE_ROADMAP.md)
- [Whitepaper](whitepaper/AMC_WHITEPAPER_v1.md)

### Enterprise
- [Enterprise Guide](docs/ENTERPRISE.md) — multi-workspace, RBAC, SSO, compliance
- [Deployment Checklist](docs/DEPLOYMENT_CHECKLIST.md) — production go-live gate
- [Compliance](docs/COMPLIANCE.md) — SOC2, GDPR, HIPAA mapping

### Operations
- [Deployment](docs/DEPLOYMENT.md) · [Operations](docs/OPERATIONS.md) · [Security](docs/SECURITY_DEPLOYMENT.md)
- [Backups](docs/BACKUPS.md) · [Metrics](docs/METRICS.md)
- [Release Runbook](docs/RELEASE_RUNBOOK.md)

---

## Runtime Requirements

- **Node.js:** ≥ 20
- **npm:** ≥ 9
- **OS:** macOS, Linux, Windows (WSL2)
- **Docker:** optional (for Compose/K8s deploy)
- **License:** [MIT](LICENSE)
- **Security:** [SECURITY.md](SECURITY.md)

---

## Why Not Just Trust the Agent?

Because agents lie. Not maliciously — they just self-report.

Every governance framework, every AI safety paper, every enterprise AI audit comes back to the same problem: **the thing being evaluated is the one providing the evidence.** AMC breaks that loop. The evidence is written by an observer (the gateway/monitor), signed by an isolated notary, and chained with cryptographic hashes. The agent can't forge its own score.

That's the insight. The rest is engineering.
