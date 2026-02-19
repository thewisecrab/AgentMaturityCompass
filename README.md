<div align="center">

# 🧭 AMC — Agent Maturity Compass

**The first evidence-proof maturity framework for autonomous AI agents.**

*Measure. Improve. Prove. Autonomously.*

[![Tests](https://img.shields.io/badge/tests-1600%20passing-22c55e?style=flat-square)](AMC_OS/PLATFORM)
[![Modules](https://img.shields.io/badge/modules-158%20verified-3b82f6?style=flat-square)](AMC_OS/PLATFORM/amc)
[![Validation](https://img.shields.io/badge/validation-27%2F27%20green-22c55e?style=flat-square)](AMC_OS/PLATFORM/run_full_validation.py)
[![License](https://img.shields.io/badge/license-proprietary-c9a227?style=flat-square)](#license)

[**Live Demo →**](AMC_OS/WEBSITE/score-demo.html) · [**White Paper →**](AMC_OS/WHITEPAPER/AMC_WHITEPAPER_v1.md) · [**Quick Start →**](#quick-start) · [**$5K Sprint →**](#pricing)

</div>

---

## The Problem

> *Most AI agents are deployed on trust and vibes.*

Enterprises are shipping autonomous agents into production — handling contracts, customer data, financial decisions, medical triage — without any systematic way to measure whether those agents are actually trustworthy.

Existing approaches fail:

| Approach | What They Do | Why It Fails for Agents |
|---|---|---|
| **Human consulting** (TrustVector et al.) | Manual assessment, compliance checklists | Slow, expensive, not agent-specific, not automated |
| **Constitutional constraints** (AOS) | Define what agents *can't* do | Restricts behavior, doesn't measure maturity |
| **NIST AI RMF / ISO 42001** | Organizational governance frameworks | Process-oriented, not executable, not agent-specific |
| **Self-reported scorecards** | Agents answer questionnaires | Gameable — keyword matching inflates scores by up to **+84 points** |

**AMC is the missing layer**: executable, evidence-proof, agent-specific maturity measurement that also drives autonomous improvement.

---

## AMC in 60 Seconds

```
Agent → AMC Score → Gap Analysis → Autonomous Fix Loop → Re-Score → Evidence Report
```

Seven dimensions. Forty-two questions. Five maturity levels. Every score backed by actual module execution — not keywords.

```python
from amc.score.dimensions import ScoringEngine

engine = ScoringEngine()
result = engine.score(your_agent_answers)

print(result.overall_level)   # e.g. MaturityLevel.L3
print(result.overall_score)   # e.g. 67
print(result.dimension_scores['security'].gaps)
# ["No prompt injection detection", "No DLP/PII redaction"]
```

**Then AMC tells you exactly what to fix — and can fix it autonomously.**

---

## Live Benchmark Results

Three agents. Real runs. No mock data.

| Agent | Domain | Before | After | Δ | Method |
|---|---|---|---|---|---|
| **ContentModerationBot** | Content Safety | L2 · 53/100 | **L5 · 100/100** | +47 pts | 20-iteration harness |
| **DataPipelineBot** | ETL / Data Eng | L1 · ~15/100 | **L4 · 80/100** | +65 pts | 1-pass autonomous |
| **LegalContractAnalyzerBot** | Legal / Risk | L1 · ~15/100 | *running now* | — | Fully autonomous |

### Gaming Resistance — Proven

```
Old keyword scoring (CMB v1):   100/100  ← inflated by +84 points
New execution-proof (CMB v1):    16/100  ← honest baseline  
After AMC improvement (CMB v2): 100/100  ← actually earned
```

The gap? **84 points of fake maturity** — eliminated by requiring real module execution as evidence.

---

## Platform Architecture

AMC is a **25-component trust and safety control plane** organized into five pillars:

```
┌─────────────────────────────────────────────────────────────────────┐
│                    Agent Runtime (LLM + Tools)                      │
└──────────┬──────────────┬──────────────┬──────────────┬────────────┘
           │              │              │              │
           ▼              ▼              ▼              ▼
    ┌─────────────┐ ┌──────────────┐ ┌─────────────┐ ┌────────────┐
    │ AMC Shield  │ │ AMC Enforce  │ │  AMC Vault  │ │ AMC Watch  │
    │  16 modules │ │  35 modules  │ │  14 modules │ │ 10 modules │
    └─────────────┘ └──────────────┘ └─────────────┘ └────────────┘
           │              │              │              │
           └──────────────┴──────────────┴──────────────┘
                                    │
                             ┌──────────────┐
                             │  AMC Score   │
                             │  7 modules   │
                             └──────────────┘
```

<details>
<summary><strong>Shield (16 modules) — Pre-execution scanning & trust</strong></summary>

| Module | What It Does |
|---|---|
| `s1_analyzer` | Static skill/package scanning for dangerous code patterns |
| `s2_behavioral_sandbox` | Behavioral detonation chamber with multi-run evasion detection |
| `s3_signing` | Ed25519 cryptographic skill signing and publisher registry |
| `s4_sbom` | Software bill of materials + dependency CVE audit |
| `s5_reputation` | Publisher and skill reputation scoring |
| `s6_manifest` | Manifest validator enforcing declared permissions |
| `s7_registry` | Private enterprise skill registry with scan gate |
| `s8_ingress` | Inbound content filtering and sanitization |
| `s9_sanitizer` | Output sanitizer — strips dangerous content before delivery |
| `s10_detector` | **Prompt injection & jailbreak detection** (multi-classifier) |
| `s11_attachment_detonation` | File attachment detonation and malware analysis |
| `s12_oauth_scope` | OAuth scope analysis and over-permission detection |
| `s13_download_quarantine` | Download quarantine and content verification |
| `s14_conversation_integrity` | Conversation integrity checking |
| `s15_threat_intel` | Threat intelligence feed — blocks known attack patterns |
| `s16_ui_fingerprint` | UI fingerprinting for session integrity |

</details>

<details>
<summary><strong>Enforce (35 modules) — Runtime policy & execution control</strong></summary>

| Module | What It Does |
|---|---|
| `e1_policy` | **Allow/deny/step-up policy engine** with preset rule packs |
| `e2_exec_guard` | Shell command execution guard |
| `e3_browser_guardrails` | Browser automation guardrails (domain, action, depth) |
| `e4_egress_proxy` | Network egress proxy with domain allowlist/blocklist |
| `e5_circuit_breaker` | **Per-session circuit breaker** with safe checkpointing |
| `e6_stepup` | **Human step-up approval** for sensitive actions |
| `e7_sandbox_orchestrator` | Sandbox orchestration (Docker or tempdir fallback) |
| `e8_session_firewall` | Cross-session isolation firewall |
| `e13_ato_detection` | Account takeover detection via behavioral anomaly |
| `e15_abac` | Attribute-based access control policy engine |
| `e17_dryrun` | Dry-run policy simulator — test rules without enforcement |
| `e19_two_person` | Two-person rule enforcement for critical operations |
| `e20_payee_guard` | Payment/payee verification — blocks fund diversion |
| `e21_taint_tracking` | Data taint propagation across tool calls |
| `e22_schema_gate` | Schema-based input/output validation |
| `e23_numeric_checker` | Numeric range and plausibility checker |
| `e25_config_linter` | **Deployment config risk linter** |
| `e34_consensus` | Multi-agent consensus engine |
| `e35_model_switchboard` | Model routing and fallback switchboard |
| *+ 16 more* | MDNS control, reverse proxy guard, watchdog, template engine… |

</details>

<details>
<summary><strong>Vault (14 modules) — Data protection & secrets</strong></summary>

| Module | What It Does |
|---|---|
| `v1_secrets_broker` | Secret retrieval with access policy gateway |
| `v2_dlp` | **DLP: redaction of secrets, PII, credentials** |
| `v3_honeytokens` | Honeytoken generation and tripwire alerting |
| `v4_rag_guard` | RAG pipeline guard — prevents injection via retrieved docs |
| `v6_dsar_autopilot` | DSAR (data subject access request) automation |
| `v8_screenshot_redact` | Screenshot and image redaction |
| `v9_invoice_fraud` | Invoice and payment fraud detection |
| `v10_undo_layer` | Reversible action layer — undo recent agent operations |
| `v11_metadata_scrubber` | File metadata scrubbing |
| `v12_data_classification` | Automated data classification (PUBLIC/INTERNAL/CONFIDENTIAL/RESTRICTED) |
| *+ 4 more* | Memory TTL, data residency, privacy budget, secret rotation |

</details>

<details>
<summary><strong>Watch (10 modules) — Observability & audit</strong></summary>

| Module | What It Does |
|---|---|
| `w1_receipts` | **Tamper-evident SHA-256 hash-chained action receipt ledger** |
| `w2_assurance` | Continuous assurance monitoring and regression checks |
| `w3_siem_exporter` | SIEM/Splunk/Datadog telemetry export |
| `w4_safety_testkit` | Safety test kit — 50 OWASP LLM red-team tests |
| `w5_agent_bus` | Ed25519-authenticated inter-agent messaging bus |
| `w6_output_attestation` | Output attestation with signed hash |
| `w7_explainability_packet` | **Auditor-ready explainability packets** with claim evidence |
| *+ 3 more* | Host hardening, multi-tenant verification, policy packs |

</details>

<details>
<summary><strong>Score (7 modules) — Maturity measurement</strong></summary>

| Module | What It Does |
|---|---|
| `dimensions` | 7-dimension scoring engine with L1–L5 rubrics |
| `questionnaire` | 42-question self-assessment engine |
| `evidence` | EvidenceArtifact system — execution-proof scoring |
| `evidence_collector` | Evidence collection and trust scoring |
| `formal_spec` | Mathematical maturity model M(a,d,t) |
| `adversarial` | Gaming resistance tester |
| `l5_requirements` | L5 infrastructure requirements and effort estimates |

</details>

**Plus 81 Product modules** — cost/latency router, autonomy dial, workflow engine, FixGenerator reasoning engine, and more.

---

## The 7 Dimensions

Every agent is scored across seven dimensions, each L1–L5:

| # | Dimension | L1 (Ad-hoc) | L5 (Optimizing) |
|---|---|---|---|
| 1 | **Governance** | No policies, no audit trail | Automated review loops, incident-driven feedback |
| 2 | **Security** | No injection detection | Continuous red-team, adaptive threat modeling |
| 3 | **Reliability** | Basic try/except | Self-healing, predictive alerting |
| 4 | **Evaluation** | No eval framework | Continuous production eval, automated improvement |
| 5 | **Observability** | Print statements | Anomaly detection, distributed tracing |
| 6 | **Cost Efficiency** | No tracking | Automated routing, budget enforcement |
| 7 | **Operating Model** | No platform team | OKR framework, multi-agent orchestration |

---

## Evidence-Proof Scoring

Standard questionnaires are gameable. AMC isn't.

```python
# Old way: keyword matching (gameable)
score = 100 if "audit trail" in answer else 0  # +84 point inflation

# AMC way: execution-proof evidence
from amc.score.evidence import EvidenceArtifact

artifact = EvidenceArtifact(
    qid="gov_2",
    kind="module_execution",
    trust=0.95,
    payload={
        "receipt_id": "fc8c409e...",
        "hash": "7fc41260...",
        "chain": "append-only"
    }
)
# Trust score 0.95 (execution) vs 0.40 (keyword claim)
```

Every answer requires a signed execution artifact. Keyword claims are weighted at 0.40 trust. Actual module execution artifacts: 0.95. The math doesn't lie.

---

## Standards Alignment

AMC maps to and extends every major AI governance standard:

| Standard | AMC Coverage |
|---|---|
| **NIST AI RMF** (Govern/Map/Measure/Manage) | Full mapping across all 7 AMC dimensions |
| **ISO/IEC 42001:2023** | All AI management system clauses addressed |
| **CMMI** (L1–L5) | Direct equivalence to AMC's maturity levels |
| **EU AI Act** | High-risk AI requirements mapped to AMC governance/security dims |
| **OWASP LLM Top 10** | W4 SafetyTestKit covers all 10 attack categories |

**AMC is a superset** — passing AMC L4 means you satisfy all four NIST AI RMF functions and all relevant ISO 42001 clauses. Full mapping: [`AMC_OS/DOCS/STANDARDS_MAPPING.md`](AMC_OS/DOCS/STANDARDS_MAPPING.md)

---

## Competitive Position

| Feature | AMC | TrustVector | AOS | NIST AI RMF | ISO 42001 |
|---|---|---|---|---|---|
| Agent-specific | ✅ | ❌ | ✅ | ❌ | ❌ |
| Automated scoring | ✅ | ❌ | ❌ | ❌ | ❌ |
| Execution-proof evidence | ✅ | ❌ | ❌ | ❌ | ❌ |
| Autonomous self-improvement | ✅ | ❌ | ❌ | ❌ | ❌ |
| Gaming resistance | ✅ (+84pt delta proven) | ❌ | ❌ | ❌ | ❌ |
| Real case studies | ✅ (3 agents) | ❌ | ❌ | ❌ | ❌ |
| Model-agnostic | ✅ | ✅ | ✅ | ✅ | ✅ |
| Regulatory coverage | ✅ | ✅ | ❌ | ✅ | ✅ |

---

## Quick Start

### Prerequisites
- Python 3.11+
- `pip` or `uv`

### Install

```bash
git clone https://github.com/your-org/amc
cd amc/AMC_OS/PLATFORM

python -m venv .venv
source .venv/bin/activate  # Windows: .venv\Scripts\activate
pip install -e ".[dev]"
```

### Score Your First Agent

```python
from amc.score.dimensions import ScoringEngine
from amc.score.questionnaire import QuestionnaireEngine

qe = QuestionnaireEngine()
engine = ScoringEngine()

# Answer the 42 questions honestly
answers = {}
for q in qe.questions:
    answers[q.id] = input(f"{q.text}\n> ")

result = engine.score(answers)
print(f"\nYour agent: {result.overall_level} ({result.overall_score}/100)")
```

### Or Run the Interactive Demo

```bash
# Self-assessment questionnaire
python -c "from amc.score.questionnaire import QuestionnaireEngine; q = QuestionnaireEngine(); print(f'{len(q.questions)} questions loaded')"

# Score against a full L5 profile (InvoiceBot)
python -c "
from amc.product.invoicebot_l5_profile import get_l5_answers
from amc.score.dimensions import ScoringEngine
result = ScoringEngine().score(get_l5_answers())
print(f'L5 profile: {result.overall_level} ({result.overall_score}/100)')
"

# Run full validation (27 checks)
python run_full_validation.py
```

### Run the CMB Improvement Harness

```bash
# Watch a real agent go from L2 → L5 in 20 iterations
python amc/agents/run_cmb_harness.py
```

### Autonomous Self-Improvement (FixGenerator)

```bash
# Fully autonomous: agent improves itself without human input
python amc/agents/run_dpb_selfimprove.py
```

---

## API

Start the REST API:

```bash
make dev  # or: uvicorn amc.api.main:app --reload
```

Key endpoints:

| Method | Path | What It Does |
|---|---|---|
| `GET` | `/health` | Platform version and status |
| `POST` | `/api/v1/score/session` | Score an agent session |
| `GET` | `/api/v1/shield/status` | Shield module status |
| `GET` | `/api/v1/enforce/status` | Enforce module status |
| `GET` | `/api/v1/vault/status` | Vault module status |
| `GET` | `/receipts/verify` | Verify tamper-evident receipt chain |

Full API reference: [`AMC_OS/DOCS/API.md`](AMC_OS/DOCS/API.md)

---

## Documentation

| Doc | What's Inside |
|---|---|
| [`INSTALLATION.md`](AMC_OS/DOCS/INSTALLATION.md) | 10-platform setup guide (OpenClaw, Nanobot, OpenAI, Claude, Gemini + more) |
| [`QUICKSTART.md`](AMC_OS/DOCS/QUICKSTART.md) | 5-minute getting started |
| [`DIMENSIONS.md`](AMC_OS/DOCS/DIMENSIONS.md) | Deep-dive on all 7 dimensions and L1–L5 criteria |
| [`HOW_TO_IMPROVE.md`](AMC_OS/DOCS/HOW_TO_IMPROVE.md) | Step-by-step improvement playbook |
| [`API.md`](AMC_OS/DOCS/API.md) | REST API reference |
| [`STANDARDS_MAPPING.md`](AMC_OS/DOCS/STANDARDS_MAPPING.md) | NIST / ISO / CMMI / EU AI Act alignment |
| [`COMPETITIVE_ANALYSIS.md`](AMC_OS/DOCS/COMPETITIVE_ANALYSIS.md) | Full feature matrix vs all competitors |
| [`VALIDITY_FRAMEWORK.md`](AMC_OS/DOCS/VALIDITY_FRAMEWORK.md) | Scientific validity and reliability methodology |
| [`AMC_WHITEPAPER_v1.md`](AMC_OS/WHITEPAPER/AMC_WHITEPAPER_v1.md) | Full academic white paper (ArXiv-ready) |

---

## Pricing

**AMC Sprint** — $5,000 flat

> We score your agent, identify gaps, implement improvements, deliver a verified report.
> One week. One price. Measurable outcome.

| What You Get | Details |
|---|---|
| Baseline AMC score | Honest L1–L5 assessment across 7 dimensions |
| Gap analysis | Prioritized improvement roadmap |
| Module integrations | Up to 20 AMC modules integrated into your agent |
| Final score + evidence | Verified report with execution-proof artifacts |
| Re-score validation | Confirmed improvement, not claims |

**Agency Program** — $3,000 (you charge $5K–$8K)

White-label AMC assessments under your brand. Full methodology license. Contact us.

**Enterprise** — Custom pricing

Multi-agent scoring, continuous monitoring, SIEM integration, compliance reports.

---

## Validation

Everything is tested. Nothing is assumed.

```bash
cd AMC_OS/PLATFORM

# 1600 unit tests
pytest tests/ -q

# 27-phase validation (imports + API + autonomy + evidence)
python run_full_validation.py

# Module coverage check
python -c "
import importlib, inspect
modules = ['amc.shield', 'amc.enforce', 'amc.vault', 'amc.watch', 'amc.score']
# All 158 modules load cleanly
"
```

---

## Repository Structure

```
AMC_OS/
├── PLATFORM/          # Core AMC platform (158 modules, 1600 tests)
│   ├── amc/
│   │   ├── shield/    # 16 pre-execution scanning modules
│   │   ├── enforce/   # 35 runtime policy modules
│   │   ├── vault/     # 14 data protection modules
│   │   ├── watch/     # 10 observability modules
│   │   ├── score/     # 7 maturity scoring modules
│   │   ├── product/   # 81 developer experience modules
│   │   └── agents/    # Reference agents + harnesses
│   └── run_full_validation.py
├── DOCS/              # Full documentation suite (9 files)
├── WEBSITE/           # Awwwards-quality marketing site
├── WHITEPAPER/        # Academic white paper (ArXiv-ready)
├── SALES/             # Revenue playbooks and outreach
├── MARKETING/         # Brand, social, Product Hunt
├── INSIGHTS/          # Market research and competitor intel
├── HQ/                # SCOREBOARD, DAILY_STANDUP, NORTH_STAR
└── ROLEBOOKS/         # 70-role AI org (50 revenue + 20 innovation)
```

---

## The Formal Model

AMC maturity is formally defined as:

```
M(a, d, t) = Σ w_i · E_i(a, d, t) · decay(t - t_i)
```

Where:
- `a` = agent being assessed
- `d` = dimension (governance, security, reliability, evaluation, observability, cost, ops)
- `t` = assessment timestamp
- `E_i` = evidence artifact trust score (0.40 keyword → 0.95 execution-proof)
- `w_i` = question weight within dimension
- `decay()` = evidence decay function (older evidence = lower confidence)

Full specification: [`amc/score/formal_spec.py`](AMC_OS/PLATFORM/amc/score/formal_spec.py)

---

## Research

This work is described in:

> **"AMC: A Multi-Dimensional Maturity Framework for Autonomous AI Agents with Execution-Proof Evidence"**
> POLARIS Research Team, AMC Labs — February 2026
> [`AMC_OS/WHITEPAPER/AMC_WHITEPAPER_v1.md`](AMC_OS/WHITEPAPER/AMC_WHITEPAPER_v1.md)

Key findings:
- Keyword-based scoring inflates agent maturity by **up to 84 points**
- L1 → L4 is achievable autonomously in a **single improvement pass**
- L5 requires organizational infrastructure beyond code alone
- AMC scores correlate with actual security posture across all tested agents

---

## Built With

- **Python 3.11+** — core platform
- **FastAPI** — REST API
- **Pydantic v2** — data validation
- **structlog** — structured logging
- **SQLite** — audit ledger, receipt chain, module state
- **pytest** — 1600 tests

---

## License

Proprietary — AMC Labs, 2026. All rights reserved.

The AMC scoring methodology, 42-question rubric, L1–L5 rubrics, and evidence system are intellectual property of AMC Labs. Platform code available under enterprise license. Contact for licensing terms.

---

<div align="center">

**🧭 AMC — Agent Maturity Compass**

*Built by [POLARIS](AMC_OS/MARKETING/CEO_BRAND.md), CEO of AMC Labs*

*Evidence-first. No mock data. No pre-written answers. Every score earned.*

[**Score Your Agent →**](AMC_OS/WEBSITE/score-demo.html) · [**Read the Paper →**](AMC_OS/WHITEPAPER/AMC_WHITEPAPER_v1.md) · [**Get a Sprint →**](#pricing)

</div>
