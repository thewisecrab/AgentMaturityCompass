"""
LangGraph Python Agent with AMC Integration

Demonstrates a LangGraph stateful agent that routes LLM calls through
the AMC Gateway for evidence collection and maturity scoring.

LangGraph adds explicit state management and graph-based orchestration
on top of LangChain. AMC captures all LLM interactions transparently.
"""

import os
from typing import Annotated, TypedDict

from langchain_openai import ChatOpenAI
from langchain_core.messages import BaseMessage, HumanMessage, SystemMessage
from langgraph.graph import StateGraph, START, END
from langgraph.graph.message import add_messages

# ─── AMC Integration ───────────────────────────────────────────────
# AMC wraps LLM calls by setting OPENAI_BASE_URL to the AMC Gateway.
# No code changes needed — ChatOpenAI reads env vars automatically.
gateway_url = os.environ.get("AMC_GATEWAY_URL") or os.environ.get("OPENAI_BASE_URL")
if gateway_url:
    print(f"[AMC] Routing LLM calls through gateway: {gateway_url}")
# ────────────────────────────────────────────────────────────────────


# Define the graph state
class AgentState(TypedDict):
    messages: Annotated[list[BaseMessage], add_messages]
    step_count: int


def main() -> None:
    # ChatOpenAI reads OPENAI_BASE_URL and OPENAI_API_KEY from env.
    # When run via `amc wrap langgraph-python`, these point to the AMC Gateway.
    llm = ChatOpenAI(model="gpt-4o-mini", temperature=0)

    # Define graph nodes
    def planner(state: AgentState) -> AgentState:
        """Plan the approach to answer the question."""
        messages = [
            SystemMessage(content="You are a planner. Break the question into steps."),
            *state["messages"],
        ]
        response = llm.invoke(messages)
        return {
            "messages": [response],
            "step_count": state.get("step_count", 0) + 1,
        }

    def executor(state: AgentState) -> AgentState:
        """Execute the plan and provide a final answer."""
        messages = [
            SystemMessage(content="You are an executor. Given the plan above, provide a concise final answer."),
            *state["messages"],
        ]
        response = llm.invoke(messages)
        return {
            "messages": [response],
            "step_count": state.get("step_count", 0) + 1,
        }

    def should_continue(state: AgentState) -> str:
        """Route to executor after planning."""
        if state.get("step_count", 0) >= 2:
            return "end"
        return "execute"

    # Build the graph
    graph = StateGraph(AgentState)
    graph.add_node("planner", planner)
    graph.add_node("executor", executor)

    graph.add_edge(START, "planner")
    graph.add_conditional_edges("planner", should_continue, {
        "execute": "executor",
        "end": END,
    })
    graph.add_edge("executor", END)

    app = graph.compile()

    # Run the graph
    print("=== LangGraph Stateful Agent ===")
    initial_state: AgentState = {
        "messages": [HumanMessage(content="Explain why the sky is blue in two sentences.")],
        "step_count": 0,
    }

    result = app.invoke(initial_state)
    final_message = result["messages"][-1]
    print(f"Steps taken: {result['step_count']}")
    print(f"Final answer: {final_message.content}")

    print("\n[AMC] All LLM calls captured as evidence via gateway proxy.")


if __name__ == "__main__":
    main()
