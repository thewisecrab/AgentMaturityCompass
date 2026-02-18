"""
Tests for E33: Watchdog Agent
"""

from __future__ import annotations

import tempfile
from datetime import datetime, timezone
from pathlib import Path

import pytest

from amc.enforce.e33_watchdog import (
    EvidenceSubmission,
    ProposedAction,
    WatchdogAgent,
    WatchdogConfig,
    WatchdogDecision,
)


def _action(**kwargs) -> ProposedAction:
    defaults = dict(
        action_id="act-001",
        tool_name="read_file",
        parameters={"path": "/tmp/test.txt"},
        session_id="sess-test",
        sender_id="agent-test",
        risk_score=0.1,
        provenance=[],
        proposed_at=datetime.now(timezone.utc),
    )
    defaults.update(kwargs)
    return ProposedAction(**defaults)


@pytest.fixture
def agent(tmp_path: Path) -> WatchdogAgent:
    config = WatchdogConfig(
        review_all=False,
        always_review=["send_payment"],
        risk_threshold=0.7,
        require_evidence_for=["send_payment"],
    )
    return WatchdogAgent(config=config, db_path=tmp_path / "watchdog.db")


# ---------------------------------------------------------------------------
# Test: low-risk action is approved
# ---------------------------------------------------------------------------

def test_low_risk_action_approved(agent: WatchdogAgent) -> None:
    """A low-risk action with clean provenance should be approved."""
    action = _action(tool_name="read_file", risk_score=0.1, provenance=[])
    decision = agent.review_action(action)

    assert decision.verdict == "approve"
    assert decision.action_id == action.action_id


# ---------------------------------------------------------------------------
# Test: delete action requires evidence
# ---------------------------------------------------------------------------

def test_delete_action_requires_evidence(agent: WatchdogAgent) -> None:
    """Tool names containing 'delete' must require evidence."""
    action = _action(
        action_id="act-del",
        tool_name="delete_record",
        risk_score=0.2,
        provenance=[],
    )
    decision = agent.review_action(action)

    assert decision.verdict == "require_evidence"
    assert decision.required_evidence is not None and len(decision.required_evidence) > 0


def test_drop_action_requires_evidence(agent: WatchdogAgent) -> None:
    """Tool names containing 'drop' must require evidence."""
    action = _action(
        action_id="act-drop",
        tool_name="drop_table",
        risk_score=0.1,
        provenance=[],
    )
    decision = agent.review_action(action)
    assert decision.verdict == "require_evidence"


def test_wipe_action_requires_evidence(agent: WatchdogAgent) -> None:
    """Tool names containing 'wipe' must require evidence."""
    action = _action(
        action_id="act-wipe",
        tool_name="wipe_disk",
        risk_score=0.0,
        provenance=[],
    )
    decision = agent.review_action(action)
    assert decision.verdict == "require_evidence"


def test_rm_action_requires_evidence(agent: WatchdogAgent) -> None:
    """Tool names containing 'rm' must require evidence."""
    action = _action(
        action_id="act-rm",
        tool_name="rm_files",
        risk_score=0.0,
        provenance=[],
    )
    decision = agent.review_action(action)
    assert decision.verdict == "require_evidence"


# ---------------------------------------------------------------------------
# Test: risk_score >= 1.0 denied immediately
# ---------------------------------------------------------------------------

def test_risk_score_1_denied(agent: WatchdogAgent) -> None:
    """risk_score >= 1.0 must be denied regardless of other conditions."""
    action = _action(action_id="act-max", tool_name="read_file", risk_score=1.0)
    decision = agent.review_action(action)

    assert decision.verdict == "deny"


def test_risk_score_above_1_denied(agent: WatchdogAgent) -> None:
    """risk_score > 1.0 must also be denied."""
    action = _action(action_id="act-over", tool_name="write_file", risk_score=1.5)
    decision = agent.review_action(action)
    assert decision.verdict == "deny"


# ---------------------------------------------------------------------------
# Test: always_review list
# ---------------------------------------------------------------------------

def test_always_review_below_threshold_requires_evidence(agent: WatchdogAgent) -> None:
    """Tools in always_review with risk < threshold should require evidence."""
    action = _action(
        action_id="act-pay",
        tool_name="send_payment",
        risk_score=0.3,
        provenance=[],
    )
    decision = agent.review_action(action)
    assert decision.verdict == "require_evidence"


def test_always_review_at_threshold_denies(agent: WatchdogAgent) -> None:
    """Tools in always_review with risk >= threshold should be denied."""
    action = _action(
        action_id="act-pay2",
        tool_name="send_payment",
        risk_score=0.7,
        provenance=[],
    )
    decision = agent.review_action(action)
    assert decision.verdict == "deny"


# ---------------------------------------------------------------------------
# Test: tainted provenance + high risk → require_evidence
# ---------------------------------------------------------------------------

def test_tainted_provenance_high_risk_requires_evidence(agent: WatchdogAgent) -> None:
    """risk >= threshold with non-empty provenance should require evidence."""
    action = _action(
        action_id="act-taint",
        tool_name="run_query",
        risk_score=0.75,
        provenance=["https://external-site.example/data"],
    )
    decision = agent.review_action(action)
    assert decision.verdict == "require_evidence"


# ---------------------------------------------------------------------------
# Test: evidence submission upgrades decision
# ---------------------------------------------------------------------------

def test_evidence_submission_upgrades_to_approve(agent: WatchdogAgent, tmp_path: Path) -> None:
    """Submitting required evidence should upgrade the decision to approve."""
    action = _action(
        action_id="act-ev",
        tool_name="delete_old_logs",
        risk_score=0.1,
        provenance=[],
    )
    decision = agent.review_action(action)
    assert decision.verdict == "require_evidence"

    submission = EvidenceSubmission(
        action_id="act-ev",
        evidence_type="human_approval",
        evidence_value="Approved by admin@example.com",
        submitted_by="admin",
        submitted_at=datetime.now(timezone.utc),
    )
    updated = agent.submit_evidence(submission)
    assert updated is not None
    assert updated.verdict == "approve"


# ---------------------------------------------------------------------------
# Test: get_pending_reviews
# ---------------------------------------------------------------------------

def test_get_pending_reviews(agent: WatchdogAgent) -> None:
    """Pending reviews should include require_evidence actions."""
    action = _action(action_id="act-pending", tool_name="drop_index", risk_score=0.1)
    agent.review_action(action)

    pending = agent.get_pending_reviews()
    assert any(a.action_id == "act-pending" for a in pending)


# ---------------------------------------------------------------------------
# Test: get_decision
# ---------------------------------------------------------------------------

def test_get_decision_returns_latest(agent: WatchdogAgent) -> None:
    """get_decision should return the most recent decision for an action."""
    action = _action(action_id="act-gd")
    agent.review_action(action)
    decision = agent.get_decision("act-gd")
    assert decision is not None
    assert decision.action_id == "act-gd"


def test_get_decision_unknown_returns_none(agent: WatchdogAgent) -> None:
    assert agent.get_decision("nonexistent-id") is None
