# LangChain RAG + AMC Baseline

Runnable starter blueprint for a LangChain app evaluated with AMC.

## Uses these existing working assets

- `../langchain-node/`
- `../langchain-python/`

## Quick start (Python)

```bash
npm i -g agent-maturity-compass
amc up
amc wrap langchain-python -- python examples/langchain-python/main.py
amc quickscore
amc dataset create rag-baseline
amc dataset add-case rag-baseline --prompt "What does the policy say about refunds?" --expected "Should mention refund policy"
amc dataset run rag-baseline
amc trace inspect $(amc trace list | head -n 1)
```

## Quick start (Node)

```bash
npm i -g agent-maturity-compass
amc up
amc wrap langchain-node -- node examples/langchain-node/index.ts
amc quickscore
```

## Goal

Move from "the demo worked once" to repeatable evals with:
- baseline score
- golden dataset cases
- trace inspection
- assurance runs

## Docs

- `../../docs/STARTER_BLUEPRINTS.md`
- `../../docs/QUICKSTART.md`
