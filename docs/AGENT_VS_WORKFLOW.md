# Agent vs Workflow — The AMC Classification Standard

## The Problem
The term "AI agent" has lost all meaning. Most "agents" are scripts with GPT calls. This sets false expectations and erodes market trust.

## AMC's Answer: Evidence-Based Classification

AMC maturity levels naturally classify systems along the autonomy spectrum:

| Classification | AMC Level | Description | Governance Required? |
|---------------|-----------|-------------|---------------------|
| **Workflow** | L0–L1 | Deterministic automation, no LLM decision-making, fixed routing | No |
| **Smart Workflow** | L2 | LLM calls for content/routing, but deterministic orchestration | Recommended |
| **Proto-Agent** | L3 | Goal-directed behavior, limited autonomy, human-in-loop for key decisions | Yes |
| **Agent** | L4 | Genuine autonomous decision-making with governance, evidence-backed trust | Required |
| **Advanced Agent** | L5 | Full autonomy with comprehensive governance, self-correcting, evidence-verified | Critical |

## Key Principles

### 1. Autonomy Is Earned, Not Declared
An agent doesn't become autonomous by calling itself one. AMC measures actual autonomous behavior:
- Does it make decisions without explicit human instruction?
- Does it plan multi-step workflows?
- Does it adapt to unexpected situations?
- Does it learn from outcomes?

### 2. Governance Scales With Autonomy
L0–L2 systems (workflows) need monitoring. L3+ systems (agents) need governance:
- **L3**: Human-in-loop for consequential decisions
- **L4**: Evidence-backed governance with graduated autonomy
- **L5**: Full governance stack — continuous recurrence, drift detection, self-correction

### 3. The Graduated Autonomy Model
Real production agents don't operate in binary SIMULATE/EXECUTE mode. They need confidence-gated autonomy:
- **High confidence (>0.9)**: Act autonomously, log evidence
- **Medium confidence (0.6–0.9)**: Act with notification, escalate if outcome uncertain
- **Low confidence (<0.6)**: Escalate to human with full context

## CLI Usage

```bash
# Classify a system based on its AMC scores
amc classify --agent <id>

# Classify from raw scores
amc classify --scores '{"autonomy": 3, "governance": 4}'
```

## Why This Matters
- **For builders**: Know when your workflow becomes an agent (and needs governance)
- **For enterprises**: Standard taxonomy for procurement and risk assessment
- **For regulators**: Evidence-based classification, not marketing labels
- **For the market**: Restore trust by distinguishing real agents from "AI-powered" scripts

---

*AMC is the industry standard for "is this actually an agent?" — backed by evidence, not hype.*
