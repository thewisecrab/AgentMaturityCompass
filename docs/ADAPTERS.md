# ADAPTERS

AMC Adapters provide SimpleClaw-style one-liners for running real AI bots, AI agents, AI employees, clawbots, OpenClaw jobs, and other CLI-driven runtimes through AMC.

## Why adapters

- Most third-party CLIs can set API key env vars, but cannot set custom headers.
- AMC solves this with lease carriers (`Authorization`, `x-api-key`, `x-goog-api-key`, `api-key`, and `x-amc-lease`).
- Gateway verifies lease format/signature/expiry and strips auth headers before upstream forwarding.
- Provider secrets remain vault-only (zero-key agents).

## Commands

```bash
amc adapters init
amc adapters verify
amc adapters list
amc adapters detect
amc adapters configure --agent <id> --adapter <adapterId> --route /openai --model gpt-4o-mini --mode supervise
amc adapters env --agent <id> [--adapter <adapterId>]
amc adapters init-project --adapter <adapterId> [--agent <id>] [--route /openai]
amc adapters run --agent <id> [--adapter <adapterId>] [--workorder <woId>] -- <command...>
```

## Built-in adapters

- `generic-cli`
- `claude-cli`
- `gemini-cli`
- `openclaw-cli`
- `openhands-cli`
- `autogen-cli`
- `crewai-cli`
- `langchain-node` (sample project)
- `langchain-python` (sample project)
- `langgraph-python` (sample project)
- `llamaindex-python` (sample project)
- `semantic-kernel` (sample project)
- `openai-agents-sdk` (sample project)

## Provider families and routes

- OpenAI-compatible: `/openai`
- Anthropic: `/anthropic`
- Gemini: `/gemini`
- xAI Grok: `/grok`
- OpenRouter-style aggregators: `/openrouter`
- Local OpenAI-compatible mock/offline: `/local`

## One-liners

```bash
amc adapters run --agent <id> --adapter claude-cli -- <cmd...>
amc adapters run --agent <id> --adapter gemini-cli -- <cmd...>
amc adapters run --agent <id> --adapter openclaw-cli -- <cmd...>
amc adapters run --agent <id> --adapter generic-cli -- node my-agent.js
```

## Lease-as-API-key compatibility

Adapters set:
- provider base URL env vars to gateway routes (`/openai`, `/anthropic`, `/gemini`, `/grok`, `/openrouter`, `/local`)
- provider API key env vars to the minted lease token

Gateway behavior:
- accepts lease from supported carriers
- verifies lease signature/expiry/scope/route/model
- strips auth fields before upstream forwarding
- records carrier metadata (`lease_carrier`) in evidence

## Sample `adapters.yaml`

```yaml
adapters:
  version: 1
  defaults:
    gatewayBase: "http://127.0.0.1:3210"
    proxyBase: "http://127.0.0.1:3211"
    leaseTtlMinutes: 60
    modelDefault: "gpt-4o-mini"
  perAgent:
    agent-bot:
      preferredAdapter: "generic-cli"
      preferredProviderRoute: "/openai"
      preferredModel: "gpt-4o-mini"
      runMode: "SUPERVISE"
      leaseScopes: ["gateway:llm","toolhub:intent","toolhub:execute"]
      routeAllowlist: ["/openai","/anthropic","/gemini","/grok","/openrouter","/local"]
      modelAllowlist: ["gpt-*","o1-*","claude-*","gemini-*","grok-*","*"]
```

## Provider selection policy

1. Lease claims carry route and model allowlists.
2. Gateway enforces allowlists deterministically per request.
3. Denied route yields `LEASE_ROUTE_DENIED`.
4. Denied model yields `LEASE_MODEL_DENIED`.
5. Auth headers/keys are never forwarded upstream.

## Library adapters (`init-project`)

Framework adapters generate runnable local samples under:

`/Users/thewisecrab/AMC/.amc/adapters-samples/<adapterId>/`

## Security posture

- Lease token is redacted in captured stdout/stderr (`<AMC_LEASE_REDACTED>`).
- Non-lease credentials from agent input are ignored and audited (`AGENT_PROVIDED_KEY_IGNORED`).
- Invalid lease carriers return `401` with `LEASE_INVALID_OR_MISSING`.
