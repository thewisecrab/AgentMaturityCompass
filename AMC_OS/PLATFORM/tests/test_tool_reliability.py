"""Tests for amc.product.tool_reliability — Pre-call Reliability Predictor."""
from __future__ import annotations

import pytest

from amc.product.tool_reliability import (
    CallRecord,
    ToolReliabilityPredictor,
    get_tool_reliability_predictor,
)


@pytest.fixture()
def predictor(tmp_path):
    return ToolReliabilityPredictor(db_path=tmp_path / "reliability.db")


def _call(tool: str, succeeded: bool = True, error_type: str = "", latency_ms: int = 100) -> CallRecord:
    return CallRecord(
        tool_name=tool,
        params={"key": "value"},
        succeeded=succeeded,
        error_type=error_type,
        latency_ms=latency_ms,
    )


# ---------------------------------------------------------------------------
# Record call
# ---------------------------------------------------------------------------


def test_record_call_returns_id(predictor):
    call_id = predictor.record_call(_call("my_tool"))
    assert call_id


def test_record_call_deduplication(predictor):
    """Two identical calls at the same instant should not cause DB errors."""
    predictor.record_call(_call("dup_tool", succeeded=True))
    predictor.record_call(_call("dup_tool", succeeded=False))
    stats = predictor.get_stats("dup_tool")
    assert stats is not None
    assert stats.total_calls >= 1


# ---------------------------------------------------------------------------
# Stats
# ---------------------------------------------------------------------------


def test_get_stats_no_history_returns_none(predictor):
    assert predictor.get_stats("ghost_tool") is None


def test_get_stats_after_calls(predictor):
    for _ in range(8):
        predictor.record_call(_call("tracked", succeeded=True, latency_ms=200))
    for _ in range(2):
        predictor.record_call(_call("tracked", succeeded=False, error_type="timeout", latency_ms=5000))

    stats = predictor.get_stats("tracked")
    assert stats is not None
    assert stats.total_calls == 10
    assert stats.failures == 2
    assert abs(stats.failure_rate - 0.2) < 0.01
    assert stats.avg_latency_ms > 0


def test_list_stats(predictor):
    for i in range(3):
        for _ in range(5):
            predictor.record_call(_call(f"tool_{i}", succeeded=(i != 2)))
    all_stats = predictor.list_stats()
    assert len(all_stats) >= 3
    # Worst (highest failure_rate) should come first
    assert all_stats[0].failure_rate >= all_stats[-1].failure_rate


def test_common_errors_populated(predictor):
    for _ in range(5):
        predictor.record_call(
            CallRecord(
                tool_name="err_tool",
                params={},
                succeeded=False,
                error_type="TimeoutError",
                latency_ms=10000,
            )
        )
    stats = predictor.get_stats("err_tool")
    assert stats is not None
    assert "TimeoutError" in stats.common_errors


# ---------------------------------------------------------------------------
# Prediction
# ---------------------------------------------------------------------------


def test_predict_no_history_returns_default_low_confidence(predictor):
    pred = predictor.predict("unknown_tool", params={"x": 1})
    assert pred.failure_probability >= 0.0
    assert pred.confidence == "low"
    assert pred.total_historical_calls == 0


def test_predict_confidence_increases_with_sample_size(predictor):
    # Build medium confidence (5–29 calls)
    for _ in range(10):
        predictor.record_call(_call("med_tool", succeeded=True))
    med = predictor.predict("med_tool", {})
    assert med.confidence == "medium"

    # Build high confidence (30+ calls required by HIGH_THRESHOLD)
    for _ in range(30):
        predictor.record_call(_call("hi_tool", succeeded=True))
    hi = predictor.predict("hi_tool", {})
    assert hi.confidence == "high"


def test_predict_failure_prob_reflects_history(predictor):
    # 50% failure rate
    for _ in range(5):
        predictor.record_call(_call("half_fail", succeeded=True))
    for _ in range(5):
        predictor.record_call(_call("half_fail", succeeded=False))

    pred = predictor.predict("half_fail", params={})
    assert pred.failure_probability >= 0.40  # base ≈ 0.5 - tolerance


def test_predict_risky_params_increase_failure_prob(predictor):
    # No history, but risky params
    pred = predictor.predict(
        "risky_call",
        params={
            "url": "not-a-url",
            "timeout": -1,
            "api_key": "short",
        },
    )
    assert pred.failure_probability > 0.1
    assert len(pred.param_risk_factors) >= 2
    assert len(pred.suggested_fixes) >= 2


def test_predict_empty_url_flagged(predictor):
    pred = predictor.predict("url_tool", params={"url": ""})
    assert any("url" in r.lower() for r in pred.param_risk_factors)


def test_predict_non_positive_timeout_flagged(predictor):
    pred = predictor.predict("t_tool", params={"timeout": 0})
    assert any("timeout" in r.lower() for r in pred.param_risk_factors)


def test_predict_alternate_tools_passthrough(predictor):
    pred = predictor.predict("t", params={}, alternate_tools=["fallback_tool"])
    assert "fallback_tool" in pred.alternate_tools


def test_predict_failure_prob_capped_at_95(predictor):
    # Many failures + risky params
    for _ in range(30):
        predictor.record_call(
            CallRecord("cap_tool", params={}, succeeded=False, error_type="e")
        )
    pred = predictor.predict(
        "cap_tool",
        params={"url": "", "timeout": -1, "api_key": "x", "token": "y"},
    )
    assert pred.failure_probability <= 0.95


# ---------------------------------------------------------------------------
# Singleton factory
# ---------------------------------------------------------------------------


def test_singleton_factory(tmp_path, monkeypatch):
    import amc.product.tool_reliability as mod
    mod._predictor = None
    p1 = get_tool_reliability_predictor(db_path=tmp_path / "s.db")
    p2 = get_tool_reliability_predictor()
    assert p1 is p2
    mod._predictor = None  # reset
