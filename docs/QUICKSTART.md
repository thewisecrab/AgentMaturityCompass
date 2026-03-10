# ⚡ Quickstart — 5 Minutes to First Eval

Get your AI agent's trust score in under 5 minutes. No code changes needed.

---

## Prerequisites

- **Node.js ≥ 20** ([download](https://nodejs.org/))

---

## 1. Install AMC (30 seconds)

```bash
npm i -g agent-maturity-compass
```

Verify it worked:

```bash
amc --version
```

---

## 2. Create a workspace (15 seconds)

```bash
mkdir my-agent && cd my-agent
export AMC_VAULT_PASSPHRASE='pick-a-passphrase'
amc init
```

`amc init` creates an `.amc/` directory with your cryptographic evidence vault (Ed25519 keys) and workspace config at `.amc/amc.config.yaml`.

> **Tip:** The vault passphrase protects your signing keys. Pick something memorable — you'll need it each session.

---

## 3. Get your first score (2 minutes)

```bash
amc quickscore
```

Answer 5 quick questions about your agent. AMC returns a maturity level from **L0** (no governance) to **L5** (self-governing), plus a gap analysis showing what to fix first.

**Share it:**

```bash
amc quickscore --share    # Markdown snippet + shields.io badge
amc badge                 # README badge: ![AMC L3](https://img.shields.io/badge/AMC-L3-blue)
```

---

## 4. Import eval results from your framework (optional, 1 minute)

Already running evals? Import them directly — AMC signs and stores them as tamper-evident evidence.

### LangSmith

```bash
amc eval import --format langsmith --file langsmith-export.json
```

### DeepEval

```bash
amc eval import --format deepeval --file deepeval-results.json
```

### Promptfoo

```bash
amc eval import --format promptfoo --file promptfoo-output.json
```

### OpenAI Evals

```bash
amc eval import --format openai --file openai-evals.jsonl
```

### Weights & Biases

```bash
amc eval import --format wandb --file wandb-export.json
```

### Langfuse

```bash
amc eval import --format langfuse --file langfuse-traces.json
```

Check coverage after import:

```bash
amc eval status
```

---

## 5. Auto-generate guardrails (1 minute)

```bash
amc guide --go
```

This auto-detects your framework (LangChain, CrewAI, Claude Code, Cursor, OpenClaw, etc.), generates severity-tagged guardrails (🔴 Critical / 🟡 High / 🔵 Medium), and applies them to your agent's config.

Re-score to see improvement:

```bash
amc quickscore
amc guide --diff    # Shows closed gaps, new gaps, level changes
```

---

## Framework-Specific Examples

### LangChain (Python)

```bash
cd examples/langchain-python
pip install -r requirements.txt

amc up                                          # Start AMC Gateway
amc wrap langchain-python -- python main.py     # Run with evidence capture
```

### CrewAI

```bash
cd examples/crewai
pip install -r requirements.txt

amc up
amc wrap crewai -- python main.py
```

### OpenAI Agents SDK

```bash
cd examples/openai-agents-sdk
pip install -r requirements.txt

amc up
amc wrap openai-agents -- python main.py
```

### LangGraph

```bash
cd examples/langgraph-python
pip install -r requirements.txt

amc up
amc wrap langgraph -- python main.py
```

### OpenClaw

```bash
amc up
amc wrap openclaw-cli -- openclaw run
```

### Generic CLI Agent

```bash
amc up
amc wrap generic -- your-agent-command
```

> All examples live in `examples/` with their own README. The gateway proxy (`amc up`) captures LLM calls transparently — your agent code doesn't change.

---

## What's Next

| Goal | Command |
|------|---------|
| Deep diagnostic (140 questions) | `amc diagnostic run` |
| EU AI Act compliance check | `amc quickscore --eu-ai-act` |
| Red-team your agent | `amc assurance run --all` |
| CI/CD release gate | `amc guide --ci --target 3` |
| Auto-fix gaps | `amc fix` |
| HTML report for stakeholders | `amc report <id> --html report.html` |
| Continuous monitoring | `amc guide --watch --apply` |

---

## Troubleshooting

**`amc: command not found`** — Make sure `npm` global bin is in your PATH. Run `npm config get prefix` and add `<prefix>/bin` to your PATH.

**`better-sqlite3` build errors** — Install build tools: `sudo apt install build-essential python3` (Linux) or `xcode-select --install` (macOS).

**Forgot passphrase** — The vault is encrypted. If lost, re-initialize with `amc init` (previous evidence chain is unrecoverable).

---

📖 [Full documentation](./GETTING_STARTED.md) · 🧪 [Assurance Lab](./ASSURANCE_LAB.md) · 🏗️ [Architecture](./ARCHITECTURE_MAP.md)
