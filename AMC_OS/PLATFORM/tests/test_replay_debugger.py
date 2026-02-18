"""Tests for the Deterministic Replay Debugger (Feature 11)."""
from __future__ import annotations

from pathlib import Path

import pytest

from amc.product.replay_debugger import (
    EventType,
    ReplayDebugger,
    TraceStatus,
    redact_pii,
)


@pytest.fixture()
def debugger(tmp_path: Path) -> ReplayDebugger:
    return ReplayDebugger(db_path=tmp_path / "replay.db", redact_pii=True)


def test_start_and_end_trace(debugger: ReplayDebugger) -> None:
    trace = debugger.start_trace(
        run_id="run-001",
        session_id="sess-1",
        tenant_id="acme",
        workflow_id="wf-x",
    )
    assert trace.trace_id
    assert trace.status == TraceStatus.RECORDING

    ended = debugger.end_trace(trace.trace_id, outcome="success")
    assert ended.status == TraceStatus.COMPLETE
    assert ended.outcome == "success"


def test_record_events_sequential(debugger: ReplayDebugger) -> None:
    trace = debugger.start_trace(run_id="run-002")

    e1 = debugger.record_event(
        trace_id=trace.trace_id,
        event_type=EventType.TOOL_CALL,
        tool_name="search",
        inputs={"query": "market trends"},
        outputs={"results": ["r1", "r2"]},
        duration_ms=120,
    )
    e2 = debugger.record_event(
        trace_id=trace.trace_id,
        event_type=EventType.DECISION,
        inputs={"context": "market trends"},
        outputs={"action": "proceed"},
        duration_ms=50,
    )

    assert e1.seq == 0
    assert e2.seq == 1
    assert e1.event_hash
    assert e2.event_hash
    assert e1.event_hash != e2.event_hash


def test_get_trace_with_events(debugger: ReplayDebugger) -> None:
    trace = debugger.start_trace(run_id="run-003")
    for i in range(3):
        debugger.record_event(trace.trace_id, EventType.TOOL_CALL, tool_name=f"tool-{i}")
    debugger.end_trace(trace.trace_id)

    fetched = debugger.get_trace(trace.trace_id)
    assert fetched is not None
    assert len(fetched.events) == 3
    assert all(e.trace_id == trace.trace_id for e in fetched.events)


def test_deterministic_replay_matches(debugger: ReplayDebugger) -> None:
    trace = debugger.start_trace(run_id="run-004")
    debugger.record_event(
        trace.trace_id, EventType.TOOL_CALL,
        tool_name="email", inputs={"to": "bob@example.com"}, outputs={"sent": True}
    )
    debugger.record_event(
        trace.trace_id, EventType.RESPONSE,
        inputs={"prompt": "summarize"}, outputs={"text": "done"}
    )
    debugger.end_trace(trace.trace_id)

    result = debugger.replay(trace.trace_id)
    assert result.total_events == 2
    assert result.matching_events == 2
    assert result.diverged_events == 0
    assert result.is_deterministic


def test_replay_with_mock_overrides(debugger: ReplayDebugger) -> None:
    trace = debugger.start_trace(run_id="run-005")
    debugger.record_event(
        trace.trace_id, EventType.TOOL_CALL,
        tool_name="database", inputs={"query": "SELECT 1"},
        outputs={"rows": [{"id": 1}]}
    )
    debugger.end_trace(trace.trace_id)

    # Override the database tool output
    result = debugger.replay(
        trace.trace_id,
        mock_tool_results={"database": {"rows": [{"id": 99}]}},
    )
    assert result.total_events == 1
    # Divergence logged but still considered deterministic with mock
    assert result.is_deterministic
    assert "Mock override" in result.diffs[0].detail


def test_pii_redaction_in_events(debugger: ReplayDebugger) -> None:
    trace = debugger.start_trace(run_id="run-pii")
    event = debugger.record_event(
        trace.trace_id, EventType.TOOL_CALL,
        tool_name="email",
        inputs={"to": "user@corp.com", "api_key": "sk_live_ABCDEFGHIJKLMNOPQRSTUVWX"},
    )
    # Email should be redacted, API key should be redacted
    inputs_str = str(event.inputs)
    assert "[EMAIL]" in inputs_str or "user@corp.com" not in inputs_str
    assert "[API_KEY]" in inputs_str or "sk_live_" not in inputs_str


def test_list_traces_filter_by_tenant(debugger: ReplayDebugger) -> None:
    for i in range(3):
        t = debugger.start_trace(run_id=f"run-t{i}", tenant_id="tenant-A")
        debugger.end_trace(t.trace_id)
    t_other = debugger.start_trace(run_id="run-other", tenant_id="tenant-B")
    debugger.end_trace(t_other.trace_id)

    results = debugger.list_traces(tenant_id="tenant-A")
    assert len(results) == 3
    assert all(t.tenant_id == "tenant-A" for t in results)


def test_replay_trace_recorded_in_db(debugger: ReplayDebugger) -> None:
    trace = debugger.start_trace(run_id="run-replay-check")
    debugger.record_event(trace.trace_id, EventType.CHECKPOINT, inputs={"step": 1})
    debugger.end_trace(trace.trace_id)

    result = debugger.replay(trace.trace_id)
    replay_trace = debugger.get_trace(result.replay_trace_id)
    assert replay_trace is not None
    assert replay_trace.status == TraceStatus.COMPLETE
    assert len(replay_trace.events) == 1


def test_redact_pii_standalone() -> None:
    text = "Contact user@test.com or call 123-45-6789. Key: sk_live_ABCDEFGHIJKLMNOPQRSTUVWXYZ"
    redacted = redact_pii(text)
    assert "[EMAIL]" in redacted
    assert "user@test.com" not in redacted
    assert "[API_KEY]" in redacted


def test_trace_as_dict_includes_events(debugger: ReplayDebugger) -> None:
    trace = debugger.start_trace(run_id="dict-run")
    debugger.record_event(trace.trace_id, EventType.TOOL_CALL, tool_name="t1")
    debugger.end_trace(trace.trace_id)
    fetched = debugger.get_trace(trace.trace_id)
    assert fetched is not None
    d = fetched.as_dict
    assert d["event_count"] == 1
    assert len(d["events"]) == 1
    assert d["events"][0]["tool_name"] == "t1"
