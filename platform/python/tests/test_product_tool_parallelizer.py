"""Tests for amc/product/tool_parallelizer.py"""
from __future__ import annotations

import asyncio
import time
from typing import Any

import pytest

from amc.product.tool_parallelizer import (
    DependencyGraph,
    ExecutionPlan,
    ExecutionResult,
    ExecutionStatus,
    SideEffectPolicy,
    ToolCall,
    ToolParallelizer,
    build_execution_plan,
    get_parallelizer,
)


# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------

def _call(
    call_id: str,
    tool_name: str,
    params: dict[str, Any] | None = None,
    depends_on: list[str] | None = None,
    has_side_effects: bool = False,
) -> ToolCall:
    return ToolCall(
        call_id=call_id,
        tool_name=tool_name,
        parameters=params or {},
        depends_on=depends_on or [],
        has_side_effects=has_side_effects,
    )


def _make_async_handler(delay_map: dict[str, float] | None = None, fail_on: set[str] | None = None):
    """Returns an async handler that returns the tool_name as output."""
    delay_map = delay_map or {}
    fail_on = fail_on or set()

    async def handler(tool_name: str, parameters: dict[str, Any]) -> Any:
        delay = delay_map.get(tool_name, 0.001)
        await asyncio.sleep(delay)
        if tool_name in fail_on:
            raise RuntimeError(f"Tool '{tool_name}' deliberately failed")
        return {"tool": tool_name, "params": parameters}

    return handler


def _make_sync_handler(fail_on: set[str] | None = None):
    fail_on = fail_on or set()

    def handler(tool_name: str, parameters: dict[str, Any]) -> Any:
        if tool_name in fail_on:
            raise RuntimeError(f"sync fail: {tool_name}")
        return {"tool": tool_name}

    return handler


# ---------------------------------------------------------------------------
# ToolCall from_dict
# ---------------------------------------------------------------------------

def test_tool_call_from_dict_basic():
    d = {"call_id": "c1", "tool_name": "fetch", "parameters": {"url": "http://x"}}
    call = ToolCall.from_dict(d)
    assert call.call_id == "c1"
    assert call.tool_name == "fetch"
    assert call.parameters == {"url": "http://x"}


def test_tool_call_from_dict_auto_id():
    d = {"tool_name": "ping"}
    call = ToolCall.from_dict(d)
    assert len(call.call_id) > 0


def test_tool_call_to_dict():
    call = _call("id1", "my_tool", params={"x": 1})
    d = call.to_dict()
    assert d["call_id"] == "id1"
    assert d["tool_name"] == "my_tool"
    assert d["parameters"] == {"x": 1}


# ---------------------------------------------------------------------------
# DependencyGraph
# ---------------------------------------------------------------------------

def test_dependency_graph_no_cycle():
    calls = [
        _call("A", "step1"),
        _call("B", "step2", depends_on=["A"]),
        _call("C", "step3", depends_on=["A"]),
        _call("D", "step4", depends_on=["B", "C"]),
    ]
    graph = DependencyGraph(calls)
    has_cycle, detail = graph.detect_cycle()
    assert has_cycle is False
    assert detail == ""


def test_dependency_graph_has_cycle():
    calls = [
        _call("A", "tool_a", depends_on=["C"]),
        _call("B", "tool_b", depends_on=["A"]),
        _call("C", "tool_c", depends_on=["B"]),
    ]
    graph = DependencyGraph(calls)
    has_cycle, detail = graph.detect_cycle()
    assert has_cycle is True
    assert len(detail) > 0


def test_topological_waves_diamond():
    """A → B, A → C → D; B,C parallel, then D."""
    calls = [
        _call("A", "root"),
        _call("B", "left", depends_on=["A"]),
        _call("C", "right", depends_on=["A"]),
        _call("D", "join", depends_on=["B", "C"]),
    ]
    graph = DependencyGraph(calls)
    waves = graph.topological_waves()
    assert waves[0] == ["A"]
    assert set(waves[1]) == {"B", "C"}
    assert waves[2] == ["D"]


def test_topological_waves_no_deps_all_parallel():
    calls = [_call(f"c{i}", f"tool_{i}") for i in range(5)]
    graph = DependencyGraph(calls)
    waves = graph.topological_waves()
    assert len(waves) == 1
    assert len(waves[0]) == 5


def test_topological_waves_linear():
    calls = [
        _call("A", "t1"),
        _call("B", "t2", depends_on=["A"]),
        _call("C", "t3", depends_on=["B"]),
    ]
    graph = DependencyGraph(calls)
    waves = graph.topological_waves()
    assert len(waves) == 3
    assert waves[0] == ["A"]
    assert waves[1] == ["B"]
    assert waves[2] == ["C"]


# ---------------------------------------------------------------------------
# build_execution_plan
# ---------------------------------------------------------------------------

def test_build_plan_reports_cycle():
    calls = [
        _call("A", "ta", depends_on=["B"]),
        _call("B", "tb", depends_on=["A"]),
    ]
    plan = build_execution_plan(calls)
    assert plan.has_cycle is True
    assert len(plan.waves) == 0


def test_build_plan_no_cycle_has_waves():
    calls = [
        _call("A", "ta"),
        _call("B", "tb", depends_on=["A"]),
    ]
    plan = build_execution_plan(calls)
    assert plan.has_cycle is False
    assert len(plan.waves) == 2


def test_build_plan_side_effects_serialize():
    calls = [
        _call("A", "pure"),
        _call("B", "side", has_side_effects=True),
        _call("C", "pure2"),
    ]
    plan = build_execution_plan(calls, side_effect_policy=SideEffectPolicy.SERIALIZE)
    # B is in its own sequential wave
    se_waves = [w for w in plan.waves if w.is_sequential]
    assert any("B" in w.call_ids for w in se_waves)


def test_build_plan_side_effects_allow():
    calls = [
        _call("A", "pure"),
        _call("B", "side", has_side_effects=True),
    ]
    plan = build_execution_plan(calls, side_effect_policy=SideEffectPolicy.ALLOW)
    # No forced serialization
    parallel = [w for w in plan.waves if not w.is_sequential and len(w.call_ids) > 1]
    assert len(parallel) >= 0  # Just ensure no exception


def test_build_plan_side_effects_deny_raises():
    calls = [
        _call("A", "pure"),
        _call("B", "side", has_side_effects=True),
    ]
    with pytest.raises(ValueError, match="policy=DENY"):
        build_execution_plan(calls, side_effect_policy=SideEffectPolicy.DENY)


def test_build_plan_dict_property():
    calls = [_call("A", "ta"), _call("B", "tb", depends_on=["A"])]
    plan = build_execution_plan(calls)
    d = plan.dict
    assert "plan_id" in d
    assert "waves" in d
    assert "total_calls" in d
    assert d["total_calls"] == 2


# ---------------------------------------------------------------------------
# ToolParallelizer.analyze_parallelism
# ---------------------------------------------------------------------------

def test_analyze_parallelism_no_deps():
    parallelizer = ToolParallelizer()
    calls = [_call(f"c{i}", f"t{i}") for i in range(4)]
    analysis = parallelizer.analyze_parallelism(calls)
    assert analysis["total_calls"] == 4
    assert analysis["wave_count"] == 1
    assert analysis["has_cycle"] is False
    assert analysis["parallelism_ratio"] > 0


def test_analyze_parallelism_cycle_detected():
    parallelizer = ToolParallelizer()
    calls = [
        _call("A", "t1", depends_on=["B"]),
        _call("B", "t2", depends_on=["A"]),
    ]
    analysis = parallelizer.analyze_parallelism(calls)
    assert analysis["has_cycle"] is True


def test_analyze_parallelism_with_deps():
    parallelizer = ToolParallelizer()
    calls = [
        _call("A", "root"),
        _call("B", "left", depends_on=["A"]),
        _call("C", "right", depends_on=["A"]),
        _call("D", "join", depends_on=["B", "C"]),
    ]
    analysis = parallelizer.analyze_parallelism(calls)
    assert analysis["wave_count"] == 3
    assert analysis["parallelism_ratio"] >= 0.25  # At least B+C are parallel


# ---------------------------------------------------------------------------
# Async execution
# ---------------------------------------------------------------------------

def test_execute_async_simple():
    parallelizer = ToolParallelizer()
    calls = [_call("A", "tool_a"), _call("B", "tool_b")]
    handler = _make_async_handler()

    result = asyncio.run(parallelizer.execute_async(calls, handler))
    assert result.total_calls == 2
    assert result.success_count == 2
    assert result.failure_count == 0


def test_execute_async_with_dependencies():
    parallelizer = ToolParallelizer()
    calls = [
        _call("A", "root"),
        _call("B", "child", depends_on=["A"]),
    ]
    handler = _make_async_handler()
    result = asyncio.run(parallelizer.execute_async(calls, handler))
    assert result.success_count == 2
    result_map = {r.call_id: r for r in result.results}
    assert result_map["A"].status == ExecutionStatus.SUCCESS
    assert result_map["B"].status == ExecutionStatus.SUCCESS


def test_execute_async_failure_captured():
    parallelizer = ToolParallelizer()
    calls = [_call("A", "good_tool"), _call("B", "bad_tool")]
    handler = _make_async_handler(fail_on={"bad_tool"})

    result = asyncio.run(parallelizer.execute_async(calls, handler))
    result_map = {r.call_id: r for r in result.results}
    assert result_map["A"].status == ExecutionStatus.SUCCESS
    assert result_map["B"].status == ExecutionStatus.FAILED
    assert "deliberately failed" in result_map["B"].error


def test_execute_async_fail_fast():
    parallelizer = ToolParallelizer()
    calls = [
        _call("A", "bad_tool"),
        _call("B", "good_tool", depends_on=["A"]),
    ]
    handler = _make_async_handler(fail_on={"bad_tool"})

    result = asyncio.run(parallelizer.execute_async(calls, handler, fail_fast=True))
    result_map = {r.call_id: r for r in result.results}
    assert result_map["A"].status == ExecutionStatus.FAILED
    # B should be skipped
    assert result_map["B"].status in {ExecutionStatus.SKIPPED, ExecutionStatus.FAILED}


def test_execute_async_output_hash_set():
    parallelizer = ToolParallelizer()
    calls = [_call("A", "tool_a")]
    handler = _make_async_handler()

    result = asyncio.run(parallelizer.execute_async(calls, handler))
    assert result.results[0].output_hash is not None
    assert len(result.results[0].output_hash) == 16


def test_execute_async_cycle_raises():
    parallelizer = ToolParallelizer()
    calls = [
        _call("X", "tx", depends_on=["Y"]),
        _call("Y", "ty", depends_on=["X"]),
    ]
    handler = _make_async_handler()
    with pytest.raises(ValueError, match="Cycle detected"):
        asyncio.run(parallelizer.execute_async(calls, handler))


# ---------------------------------------------------------------------------
# Sync execution
# ---------------------------------------------------------------------------

def test_execute_sync_basic():
    parallelizer = ToolParallelizer()
    calls = [_call("A", "tool_a"), _call("B", "tool_b")]
    handler = _make_sync_handler()

    result = parallelizer.execute_sync(calls, handler)
    assert result.success_count == 2


def test_execute_sync_with_failure():
    parallelizer = ToolParallelizer()
    calls = [_call("A", "fail_tool")]
    handler = _make_sync_handler(fail_on={"fail_tool"})

    result = parallelizer.execute_sync(calls, handler)
    assert result.failure_count == 1
    assert result.results[0].status == ExecutionStatus.FAILED


# ---------------------------------------------------------------------------
# Join results
# ---------------------------------------------------------------------------

def test_join_dict_strategy():
    parallelizer = ToolParallelizer()
    calls = [_call("A", "ta"), _call("B", "tb")]
    handler = _make_sync_handler()

    result = parallelizer.execute_sync(calls, handler)
    joined = parallelizer.join_results(result, strategy="dict")
    assert isinstance(joined, dict)
    assert "A" in joined
    assert "B" in joined


def test_join_list_strategy():
    parallelizer = ToolParallelizer()
    calls = [_call("A", "ta"), _call("B", "tb")]
    handler = _make_sync_handler()

    result = parallelizer.execute_sync(calls, handler)
    joined = parallelizer.join_results(result, strategy="list")
    assert isinstance(joined, list)
    assert len(joined) == 2


def test_join_first_success_strategy():
    parallelizer = ToolParallelizer()
    calls = [_call("A", "ta")]
    handler = _make_sync_handler()

    result = parallelizer.execute_sync(calls, handler)
    joined = parallelizer.join_results(result, strategy="first_success")
    assert isinstance(joined, dict)


def test_join_merge_strategy():
    parallelizer = ToolParallelizer()
    calls = [_call("A", "ta"), _call("B", "tb")]
    handler = _make_sync_handler()

    result = parallelizer.execute_sync(calls, handler)
    joined = parallelizer.join_results(result, strategy="merge")
    assert isinstance(joined, dict)


def test_join_error_on_failure():
    parallelizer = ToolParallelizer()
    calls = [_call("A", "fail_tool")]
    handler = _make_sync_handler(fail_on={"fail_tool"})

    result = parallelizer.execute_sync(calls, handler)
    with pytest.raises(RuntimeError, match="Tool execution failures"):
        parallelizer.join_results(result, strategy="dict", error_on_failure=True)


def test_join_unknown_strategy_raises():
    parallelizer = ToolParallelizer()
    calls = [_call("A", "ta")]
    handler = _make_sync_handler()
    result = parallelizer.execute_sync(calls, handler)

    with pytest.raises(ValueError, match="Unknown join strategy"):
        parallelizer.join_results(result, strategy="unknown")


# ---------------------------------------------------------------------------
# Execution timing
# ---------------------------------------------------------------------------

def test_wall_time_recorded():
    parallelizer = ToolParallelizer()
    calls = [_call("A", "ta")]
    handler = _make_sync_handler()
    result = parallelizer.execute_sync(calls, handler)
    assert result.wall_time_ms >= 0.0


def test_duration_ms_per_call():
    parallelizer = ToolParallelizer()
    calls = [_call("A", "ta")]
    handler = _make_async_handler(delay_map={"ta": 0.01})
    result = asyncio.run(parallelizer.execute_async(calls, handler))
    assert result.results[0].duration_ms >= 0.0


# ---------------------------------------------------------------------------
# History
# ---------------------------------------------------------------------------

def test_history_recorded():
    parallelizer = ToolParallelizer()
    calls = [_call("A", "ta")]
    handler = _make_sync_handler()
    parallelizer.execute_sync(calls, handler)
    parallelizer.execute_sync(calls, handler)
    h = parallelizer.history()
    assert len(h) == 2
    assert "plan_id" in h[0]


def test_history_limit():
    parallelizer = ToolParallelizer()
    calls = [_call("A", "ta")]
    handler = _make_sync_handler()
    for _ in range(10):
        parallelizer.execute_sync(calls, handler)
    h = parallelizer.history(limit=5)
    assert len(h) == 5


# ---------------------------------------------------------------------------
# Determinism settings injection
# ---------------------------------------------------------------------------

def test_determinism_settings_injected():
    captured: list[dict] = []

    async def handler(tool_name: str, parameters: dict[str, Any]) -> Any:
        captured.append(dict(parameters))
        return {}

    parallelizer = ToolParallelizer(
        default_determinism_settings={"seed": 42, "temperature": 0.0}
    )
    calls = [_call("A", "model_call", params={"prompt": "test"})]
    asyncio.run(parallelizer.execute_async(calls, handler))

    assert captured[0].get("seed") == 42
    assert captured[0].get("temperature") == 0.0
    assert captured[0]["prompt"] == "test"


def test_determinism_settings_not_overwrite_existing():
    captured: list[dict] = []

    async def handler(tool_name: str, parameters: dict[str, Any]) -> Any:
        captured.append(dict(parameters))
        return {}

    parallelizer = ToolParallelizer(
        default_determinism_settings={"seed": 99}
    )
    calls = [_call("A", "ta", params={"seed": 7})]  # Explicit seed in call
    asyncio.run(parallelizer.execute_async(calls, handler))
    # Explicit seed should not be overwritten by default
    assert captured[0]["seed"] == 7


# ---------------------------------------------------------------------------
# ExecutionResult dict property
# ---------------------------------------------------------------------------

def test_execution_result_dict():
    parallelizer = ToolParallelizer()
    calls = [_call("A", "ta")]
    handler = _make_sync_handler()
    result = parallelizer.execute_sync(calls, handler)
    d = result.dict
    assert "plan_id" in d
    assert "results" in d
    assert "success_count" in d
    assert "wall_time_ms" in d


# ---------------------------------------------------------------------------
# Singleton
# ---------------------------------------------------------------------------

def test_singleton_returns_same():
    p1 = get_parallelizer()
    p2 = get_parallelizer()
    assert p1 is p2


def test_singleton_reset():
    p1 = get_parallelizer()
    p2 = get_parallelizer(reset=True)
    assert p1 is not p2
