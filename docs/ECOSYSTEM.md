# Supported Models & Agent Frameworks

AMC supports universal model/provider capture via gateway routes and universal process supervision/sandbox wrappers.

## Models / Providers

Configured via gateway templates + route overrides:

- OpenAI (OpenAI-compatible)
- Azure OpenAI (OpenAI-compatible)
- xAI Grok
- Anthropic Claude
- Google Gemini
- Meta Llama (hosted/local via OpenAI-compatible endpoints)
- Mistral
- Cohere
- Groq
- OpenRouter
- Together AI
- Fireworks
- Perplexity
- DeepSeek (OpenAI-compatible endpoints)
- Qwen (OpenAI-compatible endpoints)
- Any local OpenAI-compatible server (vLLM, LM Studio, llama.cpp server, Ollama OpenAI mode)
- Any custom upstream HTTP API

## Agent Frameworks / Runtimes

Supported through `amc supervise` / `amc sandbox run` + policy export artifacts:

- LangChain (JS/TS + Python)
- LangGraph
- LlamaIndex
- AutoGen
- CrewAI
- Semantic Kernel
- OpenAI Agents SDK-style apps
- OpenHands
- Any custom FastAPI/Express/Go/Java service
- Any CLI agent (`amc wrap any`)
- Claude/Gemini/OpenClaw CLI wrappers

## Typical Flow

```bash
amc gateway start --config .amc/gateway.yaml
amc supervise --agent <agentId> --route http://127.0.0.1:3210/openai -- <cmd...>
amc run --agent <agentId> --window 14d --target default
amc verify
```

Hardened flow:

```bash
amc sandbox run --agent <agentId> --route http://127.0.0.1:3210/openai -- <cmd...>
```

## Environment Examples (No Secrets)

```bash
export OPENAI_BASE_URL=http://127.0.0.1:3210/openai
export ANTHROPIC_BASE_URL=http://127.0.0.1:3210/anthropic
export GEMINI_BASE_URL=http://127.0.0.1:3210/gemini
export AMC_AGENT_ID=<agentId>
```

Gateway injects provider auth from configured env vars; keep keys out of committed files.
