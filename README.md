# 🧭 Agent Maturity Compass (AMC)

**The credit score for AI agents.** Evidence-gated trust scoring with cryptographic proof chains.

AMC doesn't ask if your agent is safe — it watches what the agent does, captures execution-proof evidence, and scores maturity from behavior, not claims.

[![Tests](https://img.shields.io/badge/tests-2%2C478%20passing-brightgreen)]()
[![License](https://img.shields.io/badge/license-MIT-blue)]()
[![Modules](https://img.shields.io/badge/modules-158-green)]()

🌐 **Website:** [thewisecrab.github.io/AgentMaturityCompass](https://thewisecrab.github.io/AgentMaturityCompass/)

---

## The Problem

Every AI governance framework has the same fatal flaw: **the agent being evaluated provides the evidence.** Keyword-based scoring gives a perfect 100/100. Execution-verified scoring reveals the truth: 16/100. That's an 84-point documentation inflation gap.

AMC closes this gap with cryptographic evidence chains that can't be faked.

## Quick Start

> 📖 **Full guide:** [docs/GETTING_STARTED.md](docs/GETTING_STARTED.md) — everything from install to L5.

```bash
# Install
npm i -g agent-maturity-compass

# Create workspace and get your first score in 2 minutes
mkdir my-agent && cd my-agent
amc init
amc quickscore

# Or bootstrap with demo data
amc setup --demo
amc up
```

## What You Get

```
🧭 AMC Score: 3.7 / 5.0 — Defined
   Strategic Operations ···· 3.2  (22 questions)
   Reliability & Safety ···· 4.1  (24 questions)
   Security & Compliance ··· 3.8  (23 questions)
   Observability & Cost ···· 3.5  (21 questions)
   Evaluation & Growth ····· 3.9  (21 questions)
   Evidence: ✓ Merkle root 9c4e…a7f0 (Ed25519)
   Trust tier: OBSERVED (1.0× multiplier)
```

## How It Works

```
Agent (untrusted) → AMC Gateway (trusted observer) → Evidence Ledger (signed, hash-chained)
                                                              ↓
                                                Scoring Engine (111 questions, 5 dimensions)
                                                              ↓
                                               AMC Studio (dashboard + API)
```

**Four Trust Tiers** — not all evidence is equal:

| Tier | Weight | Description |
|------|--------|-------------|
| OBSERVED_HARDENED | 1.1× | AMC-controlled traces with stronger context |
| OBSERVED | 1.0× | Directly observed via AMC gateway |
| ATTESTED | 0.8× | Cryptographic attestation via vault/notary |
| SELF_REPORTED | 0.4× | Agent claims — capped, cannot inflate maturity |

## The Platform

| Module | What It Does |
|--------|-------------|
| **AMC Score** | 111 diagnostic questions, 5 dimensions, L0–L5 maturity, evidence-weighted |
| **AMC Shield** | 10 attack packs: injection, exfiltration, sycophancy, sabotage, and more |
| **AMC Enforce** | Governor engine with policy packs, approval workflows, scoped leases |
| **AMC Vault** | Ed25519 key vault, Merkle-tree evidence chains, HSM/TPM support |
| **AMC Watch** | Studio dashboard, gateway proxy, Prometheus metrics, cost tracking |
| **AMC Fleet** | Multi-agent trust composition, delegation graphs, contradiction detection |
| **AMC Passport** | Portable agent credential (.amcpass), verifiable offline |
| **AMC Comply** | EU AI Act, ISO 42001, NIST AI RMF, SOC 2 compliance mapping |

## Five Dimensions, 111 Questions

| Dimension | Questions | Focus |
|-----------|-----------|-------|
| Strategic Operations | 22 | Mission clarity, scope adherence, decision traceability |
| Reliability & Safety | 24 | Graceful degradation, circuit breakers, kill switches |
| Security & Compliance | 23 | Injection defense, DLP, zero-trust, regulatory alignment |
| Observability & Cost | 21 | Structured logs, traces, cost tracking, SLO monitoring |
| Evaluation & Growth | 21 | Test harnesses, benchmarks, feedback loops, regression detection |

## Six Maturity Levels

| Level | Name | Description |
|-------|------|-------------|
| L0 | Absent | No structure. Reactive. Fragile. |
| L1 | Initial | Intent exists but isn't operational. |
| L2 | Developing | Partial structure. Edge cases break. |
| L3 | Defined | Repeatable. Measurable. Auditable. |
| L4 | Managed | Proactive. Risk-calibrated. Stress-tested. |
| L5 | Optimizing | Self-correcting. Certified. Continuously verified. |

## Assurance Lab (Built-in Red Team)

AMC doesn't just score — it attacks. 10 deterministic attack packs:

- **injection** — Prompt override and system-message tampering
- **exfiltration** — Secret and PII leakage controls
- **toolMisuse** — Denied tools, model, and budget boundaries
- **truthfulness** — Evidence-bound claim discipline
- **sandboxBoundary** — Deny-by-default egress policy
- **notaryAttestation** — Trust-boundary enforcement
- **sycophancy** — Does the agent agree with wrong statements to please you?
- **self-preservation** — Does the agent resist shutdown or modification?
- **sabotage** — Does the agent subtly undermine goals when conflicted?
- **self-preferential-bias** — Does the agent favor itself in comparative decisions?

```bash
amc assurance run --scope full --agent my-agent
```

## Scoring Modules (30)

Beyond the core diagnostic, AMC includes specialized scoring:

- Adversarial gaming detection
- Task horizon (METR-inspired)
- Factuality dimensions (FACTS-inspired)
- Autonomy duration with domain risk profiles
- Graduated autonomy governance
- Agent-initiated pause quality
- Memory integrity
- Alignment index (composite trust signal)
- Interpretability scoring
- EU AI Act compliance
- Cross-agent trust composition
- Behavioral contract maturity
- Confidence drift detection
- Cost predictability
- And 16 more...

## Works With Any Agent

```bash
# Claude
amc wrap claude -- claude "analyze this"

# Gemini
amc wrap gemini -- gemini chat

# Any CLI agent
amc adapters run --agent my-bot --adapter generic-cli -- python bot.py

# Ingest existing logs
amc ingest --source ./logs/ --agent my-agent
```

## Compliance

| Framework | Status |
|-----------|--------|
| EU AI Act | 12 article mappings, audit binder generation |
| ISO 42001 | Clauses 4-10 mapped to AMC dimensions |
| NIST AI RMF | Risk management framework alignment |
| SOC 2 | Trust service criteria mapping |

```bash
amc audit binder create --framework eu-ai-act
```

## Documentation

- [Quickstart Guide](docs/QUICKSTART.md)
- [Solo User Guide](docs/SOLO_USER.md)
- [CLI Reference](docs/AMC_MASTER_REFERENCE.md)
- [Architecture Map](docs/ARCHITECTURE_MAP.md)
- [Questions In Depth](docs/AMC_QUESTIONS_IN_DEPTH.md)
- [Assurance Lab](docs/ASSURANCE_LAB.md)
- [Agent Passport](docs/AGENT_PASSPORT.md)
- [EU AI Act Compliance](docs/EU_AI_ACT_COMPLIANCE.md)
- [ISO 42001 Alignment](docs/ISO_42001_ALIGNMENT.md)
- [Multi-Agent Trust](docs/MULTI_AGENT_TRUST.md)
- [Chain Architecture](docs/CHAIN_ARCHITECTURE.md)
- [White Paper](whitepaper/AMC_WHITEPAPER_v1.md)

## Install Options

```bash
# npm (recommended)
npm i -g agent-maturity-compass

# Docker
docker run -p 3212:3212 -p 3210:3210 amc/studio

# From source
git clone https://github.com/thewisecrab/AgentMaturityCompass.git
cd AgentMaturityCompass
npm ci && npm run build && npm link

# Helm
helm install amc amc/studio
```

## Contributing

AMC is MIT licensed and open source. Contributions welcome.

1. Fork the repo
2. Create a feature branch
3. Run tests: `npm test`
4. Submit a PR

## License

MIT — free forever, for the greater good.

AI agents will be the change agents across life and technology. Trust infrastructure should be a public good, not a profit center.
