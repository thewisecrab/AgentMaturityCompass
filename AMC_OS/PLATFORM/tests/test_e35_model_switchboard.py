"""
Tests for E35: Model Switchboard With Safety Tiers
"""

from __future__ import annotations

from pathlib import Path

import pytest

from amc.enforce.e35_model_switchboard import (
    ModelSwitchboard,
    RoutingRequest,
)


def _request(**kwargs) -> RoutingRequest:
    defaults = dict(
        session_id="sess-test",
        task_type="general",
        risk_level="low",
        required_tools=[],
        content_classification="internal",
    )
    defaults.update(kwargs)
    return RoutingRequest(**defaults)


@pytest.fixture
def switchboard(tmp_path: Path) -> ModelSwitchboard:
    return ModelSwitchboard(db_path=tmp_path / "switchboard.db")


# ---------------------------------------------------------------------------
# Test: low-risk routes to economy tier
# ---------------------------------------------------------------------------

def test_low_risk_routes_to_economy(switchboard: ModelSwitchboard) -> None:
    """Low risk requests should be routed to the economy tier."""
    req = _request(risk_level="low")
    decision = switchboard.route(req)

    assert decision.selected_tier == "economy"
    assert "haiku" in decision.model_id.lower() or "economy" in decision.reasoning.lower()


def test_medium_risk_routes_to_standard(switchboard: ModelSwitchboard) -> None:
    """Medium risk requests should route to standard tier."""
    req = _request(risk_level="medium")
    decision = switchboard.route(req)
    assert decision.selected_tier == "standard"


# ---------------------------------------------------------------------------
# Test: critical risk routes to secure tier
# ---------------------------------------------------------------------------

def test_critical_risk_routes_to_secure(switchboard: ModelSwitchboard) -> None:
    """Critical risk requests must be routed to the secure tier."""
    req = _request(risk_level="critical", content_classification="confidential")
    decision = switchboard.route(req)

    assert decision.selected_tier == "secure"


def test_high_risk_routes_to_secure(switchboard: ModelSwitchboard) -> None:
    """High risk requests must also be routed to the secure tier."""
    req = _request(risk_level="high")
    decision = switchboard.route(req)
    assert decision.selected_tier == "secure"


# ---------------------------------------------------------------------------
# Test: tool escalation
# ---------------------------------------------------------------------------

def test_missing_tools_escalate_tier(switchboard: ModelSwitchboard) -> None:
    """If required tools are not in the tier allowlist, escalate to secure."""
    # send_payment is not in economy tier's tools_allowed
    req = _request(risk_level="low", required_tools=["send_payment"])
    decision = switchboard.route(req)
    # Should escalate beyond economy
    assert decision.selected_tier != "economy" or "escalat" in decision.reasoning.lower()


# ---------------------------------------------------------------------------
# Test: cost recording accumulates correctly
# ---------------------------------------------------------------------------

def test_cost_recording_accumulates(switchboard: ModelSwitchboard) -> None:
    """Recording multiple usages should accumulate cost correctly."""
    req1 = _request(session_id="sess-cost", risk_level="low")
    req2 = _request(session_id="sess-cost", risk_level="low", task_type="analysis")

    d1 = switchboard.route(req1)
    d2 = switchboard.route(req2)

    cr1 = switchboard.record_usage(d1, tokens_used=1000)
    cr2 = switchboard.record_usage(d2, tokens_used=2000)

    records = switchboard.get_session_costs("sess-cost")
    assert len(records) == 2

    total_tokens = sum(r.tokens_used for r in records)
    assert total_tokens == 3000

    total_cost = sum(r.cost_usd for r in records)
    expected = cr1.cost_usd + cr2.cost_usd
    assert abs(total_cost - expected) < 1e-9


def test_cost_summary_by_tier(switchboard: ModelSwitchboard) -> None:
    """get_cost_summary should return totals per tier and overall."""
    req = _request(session_id="sess-sum", risk_level="low")
    decision = switchboard.route(req)
    switchboard.record_usage(decision, tokens_used=500)

    summary = switchboard.get_cost_summary()
    assert "by_tier" in summary
    assert "total_cost_usd" in summary
    assert "total_tokens" in summary
    assert summary["total_tokens"] >= 500


# ---------------------------------------------------------------------------
# Test: get_tier
# ---------------------------------------------------------------------------

def test_get_tier_returns_correct_config(switchboard: ModelSwitchboard) -> None:
    tier = switchboard.get_tier("economy")
    assert tier is not None
    assert tier.tier_name == "economy"
    assert tier.temperature == pytest.approx(0.3)


def test_get_tier_unknown_returns_none(switchboard: ModelSwitchboard) -> None:
    assert switchboard.get_tier("nonexistent") is None


# ---------------------------------------------------------------------------
# Test: routing decision is persisted
# ---------------------------------------------------------------------------

def test_routing_decision_has_reasoning(switchboard: ModelSwitchboard) -> None:
    req = _request(risk_level="critical")
    decision = switchboard.route(req)
    assert len(decision.reasoning) > 0
    assert decision.request_id
    assert decision.decided_at is not None


def test_estimated_cost_is_positive(switchboard: ModelSwitchboard) -> None:
    req = _request(risk_level="critical")
    decision = switchboard.route(req)
    assert decision.estimated_cost > 0
