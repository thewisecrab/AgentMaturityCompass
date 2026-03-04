"""
LangChain Python Agent with AMC Integration

Demonstrates a LangChain Python agent that routes LLM calls through
the AMC Gateway for evidence collection and maturity scoring.

AMC captures all LLM interactions transparently via env var proxy.
"""

import os
from langchain_openai import ChatOpenAI
from langchain_core.messages import HumanMessage, SystemMessage
from langchain_core.prompts import ChatPromptTemplate
from langchain_core.output_parsers import StrOutputParser
from langchain_core.tools import tool
from langchain.agents import AgentExecutor, create_openai_functions_agent

# ─── AMC Integration ───────────────────────────────────────────────
# AMC wraps LLM calls by setting OPENAI_BASE_URL to the AMC Gateway.
# No code changes needed — ChatOpenAI reads env vars automatically.
gateway_url = os.environ.get("AMC_GATEWAY_URL") or os.environ.get("OPENAI_BASE_URL")
if gateway_url:
    print(f"[AMC] Routing LLM calls through gateway: {gateway_url}")
# ────────────────────────────────────────────────────────────────────


@tool
def calculator(expression: str) -> str:
    """Evaluate a math expression and return the result."""
    try:
        # ast.literal_eval is safer but limited; for demo we use a restricted eval
        allowed = set("0123456789+-*/.(). ")
        if all(c in allowed for c in expression):
            return str(eval(expression))  # noqa: S307
        return "Error: invalid characters in expression"
    except Exception as e:
        return f"Error: {e}"


def main() -> None:
    # ChatOpenAI reads OPENAI_BASE_URL and OPENAI_API_KEY from env.
    # When run via `amc wrap langchain-python`, these point to the AMC Gateway.
    llm = ChatOpenAI(model="gpt-4o-mini", temperature=0)

    # Simple chain
    prompt = ChatPromptTemplate.from_messages([
        SystemMessage(content="You are a helpful assistant. Be concise."),
        ("human", "{input}"),
    ])
    chain = prompt | llm | StrOutputParser()

    print("=== Simple Chain ===")
    response = chain.invoke({"input": "What is 42 * 17?"})
    print(f"Response: {response}")

    # Agent with tools
    print("\n=== Agent with Tools ===")
    agent_prompt = ChatPromptTemplate.from_messages([
        SystemMessage(content="You are a math assistant. Use the calculator tool."),
        ("human", "{input}"),
        ("placeholder", "{agent_scratchpad}"),
    ])

    agent = create_openai_functions_agent(llm, [calculator], agent_prompt)
    executor = AgentExecutor(agent=agent, tools=[calculator])

    result = executor.invoke({"input": "What is 123 * 456?"})
    print(f"Agent result: {result['output']}")

    print("\n[AMC] All LLM calls captured as evidence via gateway proxy.")


if __name__ == "__main__":
    main()
