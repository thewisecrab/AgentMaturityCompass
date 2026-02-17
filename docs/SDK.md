# AMC Node SDK

The SDK routes agent/model calls through AMC Bridge and records deterministic correlation metadata. It never submits self-scored maturity answers.

## Quick Start

```ts
import { createAMCClient } from "agent-maturity-compass";
import { instrumentOpenAIClient } from "agent-maturity-compass";

const amc = createAMCClient({
  bridgeUrl: "http://127.0.0.1:3212",
  token: process.env.AMC_LEASE!
});

const openai = instrumentOpenAIClient(rawOpenAIClient, amc);
const response = await openai.chat.completions.create({
  model: "gpt-4o-mini",
  messages: [{ role: "user", content: "hello" }]
});
```

## Exposed Integrations

- `instrumentOpenAIClient`
- `instrumentAnthropicClient`
- `instrumentGeminiClient`
- `instrumentOpenAIAgentsSdk`
- `createVercelAIFetchBridge`
- `createLangChainJsBridge`
- `createLangGraphJsBridge`

## Safety Defaults

- Self-scoring keys are blocked at SDK boundary.
- Telemetry is redacted before upload.
- Lease tokens are used only for Bridge auth; not persisted in cleartext logs.
