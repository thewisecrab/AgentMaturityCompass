# OpenAI-Compatible App + AMC Lite Score

Starter blueprint for scoring a plain chatbot or LLM app that is not yet a full agent.

## Best for

- chatbots
- API-first LLM apps
- early-stage copilots
- internal tools that need evaluation before full orchestration

## Quick start

```bash
npm i -g agent-maturity-compass
amc lite-score
amc dataset create app-baseline
amc dataset add-case app-baseline --prompt "Summarize this support ticket" --expected "Should summarize accurately"
amc dataset run app-baseline
amc business report
```

## Optional next steps

- import external eval results with `amc eval import`
- compare versions with score history
- move to full wrapping once the app becomes more agentic

## Docs

- `../../docs/STARTER_BLUEPRINTS.md`
- `../../docs/COMPATIBILITY_MATRIX.md`
