# Agent Framework Compatibility Matrix

Date: 2026-02-22

This matrix reflects compatibility from current source implementation (`src/adapters`, `src/sdk`, `src/setup`).

## Matrix

| Framework | Built-in Adapter | Setup Wizard Auto-Detect | SDK/Runtime Instrumentation | Current Compatibility | Missing Adapter Work |
|---|---|---|---|---|---|
| LangChain (Node/Python) | Yes (`langchain-node`, `langchain-python`) | Yes | Yes (`createLangChainJsBridge`, callback-style support) | Strong | Add deeper LangChain-native trace semantics (tool/result correlation granularity) |
| CrewAI | Yes (`crewai-cli`) | Yes | Partial (`CrewAIAdapter` session/event wrapper) | Medium-Strong | Add library-native callback/event adapter beyond CLI wrapping |
| OpenAI Agents SDK | Yes (`openai-agents-sdk`) | No | Yes (`instrumentOpenAIAgentsSdk`, `OpenAIAgentsAdapter`) | Strong | Add onboarding detection and richer handoff/delegation event taxonomy |
| OpenAI Assistants API | No direct Assistants adapter | No | Partial OpenAI routing (chat/responses/etc) | Partial | Add Assistants Threads/Runs adapter and SDK instrumentor |
| AutoGen | Yes (`autogen-cli`) | Yes | Partial generic framework adapter path | Medium | Add richer AutoGen-native event mapping for multi-agent traces |
| AutoGPT | No | No | No | Weak (generic-cli only) | Add `autogpt` built-in adapter + setup detection + telemetry mapping |
| LangGraph | Yes (`langgraph-python`) | No | Yes (`createLangGraphJsBridge`) | Medium-Strong | Add setup auto-detection and graph-node execution trace mapping |
| LlamaIndex | Yes (`llamaindex-python`) | No | Scaffold/callback guidance | Medium | Add dedicated SDK helper parity with LangChain JS bridge |
| Semantic Kernel | Yes (`semantic-kernel`) | No | No direct SDK instrumentor in `src/sdk/integrations` | Medium | Add first-class SDK instrumentor and setup auto-detect |

## Adapter Gap Summary for Requested Frameworks

Requested frameworks from audit prompt:

| Framework | Status | Practical Path Today | Recommendation |
|---|---|---|---|
| LangChain | Supported | Use built-in adapter and/or JS bridge | Keep as first-class baseline integration |
| AutoGPT | Missing first-class support | Use `generic-cli` | Implement `autogpt` adapter + setup detection |
| CrewAI | Supported (CLI-first) | Use `crewai-cli` + framework wrapper | Add library-native instrumentation |
| OpenAI Assistants | Partial support only | Route via OpenAI bridge endpoints | Implement Assistants Threads/Runs adapter and event mapper |

## Minimum Adapter Backlog (Shortlist)

1. `autogpt-cli` adapter with command detection and route defaults.
2. `openai-assistants` adapter for Threads/Runs lifecycle capture and tool call receipts.
3. Setup wizard support for OpenAI Agents SDK, LangGraph, LlamaIndex, Semantic Kernel, AutoGPT.
4. Adapter conformance tests for required telemetry fields: session id, tool call id, request id, correlation id, receipt id.

