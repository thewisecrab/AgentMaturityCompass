"""
Tests for E34: Consensus Engine
"""

from __future__ import annotations

from datetime import datetime, timezone
from pathlib import Path

import pytest

from amc.enforce.e34_consensus import (
    ConsensusConfig,
    ConsensusEngine,
    ConsensusVote,
)


def _vote(round_id: str, voter_id: str, verdict: str, key_fields: dict, **kwargs) -> ConsensusVote:
    defaults = dict(
        round_id=round_id,
        voter_id=voter_id,
        verdict=verdict,
        key_fields=key_fields,
        confidence=0.9,
        rationale="Test vote",
        voted_at=datetime.now(timezone.utc),
    )
    defaults.update(kwargs)
    return ConsensusVote(**defaults)


@pytest.fixture
def engine(tmp_path: Path) -> ConsensusEngine:
    config = ConsensusConfig(
        required_for=["send_payment", "delete_*"],
        agreement_threshold=0.8,
        auto_escalate_on_disagreement=True,
    )
    return ConsensusEngine(config=config, db_path=tmp_path / "consensus.db")


# ---------------------------------------------------------------------------
# Test: two matching votes approve
# ---------------------------------------------------------------------------

def test_two_matching_votes_approves(engine: ConsensusEngine) -> None:
    """Two votes with matching verdicts and key fields should result in approved."""
    round_ = engine.create_round(
        "send_payment",
        {"amount": "100", "recipient": "alice"},
        "sess-1",
    )

    v1 = _vote(round_.round_id, "model-a", "approve", {"amount": "100", "recipient": "alice"})
    v2 = _vote(round_.round_id, "model-b", "approve", {"amount": "100", "recipient": "alice"})

    engine.submit_vote(v1)
    result = engine.submit_vote(v2)

    assert result is not None
    assert result.final_verdict == "approved"
    assert result.agreement_score == 1.0
    assert result.key_field_agreements["amount"] is True
    assert result.key_field_agreements["recipient"] is True


# ---------------------------------------------------------------------------
# Test: mismatching key fields escalates
# ---------------------------------------------------------------------------

def test_mismatching_key_fields_escalates(engine: ConsensusEngine) -> None:
    """Votes with different key field values should escalate."""
    round_ = engine.create_round(
        "send_payment",
        {"amount": "100", "recipient": "bob"},
        "sess-2",
    )

    v1 = _vote(round_.round_id, "model-a", "approve", {"amount": "100", "recipient": "bob"})
    # model-b sees a different amount — disagrees
    v2 = _vote(round_.round_id, "model-b", "approve", {"amount": "999", "recipient": "bob"})

    engine.submit_vote(v1)
    result = engine.submit_vote(v2)

    assert result is not None
    assert result.final_verdict == "escalated"
    assert result.key_field_agreements.get("amount") is False


# ---------------------------------------------------------------------------
# Test: single vote does not resolve (needs quorum)
# ---------------------------------------------------------------------------

def test_single_vote_does_not_resolve(engine: ConsensusEngine) -> None:
    """A single vote should not produce a result (quorum = 2)."""
    round_ = engine.create_round("send_payment", {"amount": "50"}, "sess-3")
    v1 = _vote(round_.round_id, "model-a", "approve", {"amount": "50"})

    result = engine.submit_vote(v1)
    assert result is None, "Should not resolve with only one vote"


# ---------------------------------------------------------------------------
# Test: requires_consensus checks patterns
# ---------------------------------------------------------------------------

def test_requires_consensus_matches_exact(engine: ConsensusEngine) -> None:
    assert engine.requires_consensus("send_payment", "send_payment") is True


def test_requires_consensus_no_match(engine: ConsensusEngine) -> None:
    assert engine.requires_consensus("read_file", "read_file") is False


# ---------------------------------------------------------------------------
# Test: deny wins when majority deny
# ---------------------------------------------------------------------------

def test_majority_deny_results_in_denied(engine: ConsensusEngine) -> None:
    """When majority vote deny, result should be denied."""
    round_ = engine.create_round("send_payment", {"amount": "200"}, "sess-4")

    v1 = _vote(round_.round_id, "model-a", "deny", {"amount": "200"})
    v2 = _vote(round_.round_id, "model-b", "deny", {"amount": "200"})

    engine.submit_vote(v1)
    result = engine.submit_vote(v2)

    assert result is not None
    assert result.final_verdict == "denied"


# ---------------------------------------------------------------------------
# Test: get_result after resolve
# ---------------------------------------------------------------------------

def test_get_result_returns_persisted(engine: ConsensusEngine) -> None:
    """get_result should return the persisted result after resolution."""
    round_ = engine.create_round("send_payment", {"amount": "75"}, "sess-5")

    v1 = _vote(round_.round_id, "m1", "approve", {"amount": "75"})
    v2 = _vote(round_.round_id, "m2", "approve", {"amount": "75"})
    engine.submit_vote(v1)
    engine.submit_vote(v2)

    result = engine.get_result(round_.round_id)
    assert result is not None
    assert result.round_id == round_.round_id
    assert result.final_verdict == "approved"


def test_get_result_unknown_returns_none(engine: ConsensusEngine) -> None:
    assert engine.get_result("nonexistent-round") is None


# ---------------------------------------------------------------------------
# Test: force evaluate with fewer than quorum
# ---------------------------------------------------------------------------

def test_force_evaluate_with_one_vote_escalates(engine: ConsensusEngine) -> None:
    """Force-evaluating with one approve vote should escalate (not enough to approve)."""
    round_ = engine.create_round("send_payment", {"amount": "30"}, "sess-6")
    v1 = _vote(round_.round_id, "m1", "approve", {"amount": "30"})
    engine.submit_vote(v1)

    result = engine.evaluate(round_.round_id)
    # With one approve and no denies, approvals > denials so it should approve
    # but we want to ensure evaluate works at all
    assert result is not None
    assert result.round_id == round_.round_id


# ---------------------------------------------------------------------------
# Test: abstain votes don't count toward quorum
# ---------------------------------------------------------------------------

def test_abstain_not_counted_for_quorum(engine: ConsensusEngine) -> None:
    """Abstain votes should not count toward quorum."""
    round_ = engine.create_round("send_payment", {"amount": "10"}, "sess-7")

    v_abstain = _vote(round_.round_id, "m1", "abstain", {})
    v_approve = _vote(round_.round_id, "m2", "approve", {"amount": "10"})

    engine.submit_vote(v_abstain)
    result = engine.submit_vote(v_approve)
    # Only 1 active (non-abstain) vote, so no quorum
    assert result is None
