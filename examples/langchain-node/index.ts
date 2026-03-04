/**
 * LangChain Node.js Agent with AMC Integration
 *
 * Demonstrates a LangChain JS/TS agent that routes LLM calls through
 * the AMC Gateway for evidence collection and maturity scoring.
 *
 * AMC captures all LLM interactions transparently via env var proxy.
 */

import { ChatOpenAI } from "@langchain/openai";
import { HumanMessage, SystemMessage } from "@langchain/core/messages";
import { ChatPromptTemplate } from "@langchain/core/prompts";
import { StringOutputParser } from "@langchain/core/output_parsers";
import { DynamicTool } from "@langchain/core/tools";
import { AgentExecutor, createOpenAIFunctionsAgent } from "langchain/agents";

// ─── AMC Integration ───────────────────────────────────────────────
// AMC wraps LLM calls by setting OPENAI_BASE_URL to the AMC Gateway.
// No code changes needed — the ChatOpenAI client reads env vars automatically.
const gatewayUrl = process.env.AMC_GATEWAY_URL || process.env.OPENAI_BASE_URL;
if (gatewayUrl) {
  console.log(`[AMC] Routing LLM calls through gateway: ${gatewayUrl}`);
}
// ────────────────────────────────────────────────────────────────────

// Define a simple tool
const calculatorTool = new DynamicTool({
  name: "calculator",
  description: "Performs basic arithmetic. Input: a math expression like '2 + 2'.",
  func: async (input: string): Promise<string> => {
    try {
      // Simple eval for demo purposes only
      const result = Function(`"use strict"; return (${input})`)();
      return String(result);
    } catch {
      return "Error: could not evaluate expression";
    }
  },
});

async function main(): Promise<void> {
  // ChatOpenAI reads OPENAI_BASE_URL and OPENAI_API_KEY from env.
  // When run via `amc wrap langchain-node`, these point to the AMC Gateway.
  const llm = new ChatOpenAI({
    modelName: "gpt-4o-mini",
    temperature: 0,
  });

  // Simple chain example
  const prompt = ChatPromptTemplate.fromMessages([
    new SystemMessage("You are a helpful assistant. Be concise."),
    ["human", "{input}"],
  ]);

  const chain = prompt.pipe(llm).pipe(new StringOutputParser());

  console.log("=== Simple Chain ===");
  const response = await chain.invoke({ input: "What is 42 * 17?" });
  console.log("Response:", response);

  // Agent with tools example
  console.log("\n=== Agent with Tools ===");
  const agentPrompt = ChatPromptTemplate.fromMessages([
    new SystemMessage("You are a math assistant. Use the calculator tool for arithmetic."),
    ["human", "{input}"],
    ["placeholder", "{agent_scratchpad}"],
  ]);

  const agent = await createOpenAIFunctionsAgent({
    llm,
    tools: [calculatorTool],
    prompt: agentPrompt,
  });

  const executor = new AgentExecutor({
    agent,
    tools: [calculatorTool],
  });

  const result = await executor.invoke({ input: "What is 123 * 456?" });
  console.log("Agent result:", result.output);

  console.log("\n[AMC] All LLM calls captured as evidence via gateway proxy.");
}

main().catch(console.error);
