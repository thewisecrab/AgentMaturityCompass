"""Tests for E30 — Cross-Source Verification Gate."""
from __future__ import annotations

import pytest

from amc.enforce.e30_cross_source_verify import (
    CrossSourceVerifier,
    VerificationConfig,
    VerificationRequest,
    VerificationResult,
)


@pytest.fixture()
def verifier() -> CrossSourceVerifier:
    """In-memory verifier configured for wire_transfer requiring two sources."""
    config = VerificationConfig(
        require_two_sources_for=["wire_transfer", "cancel_account"],
        confidence_threshold=0.8,
        block_on_mismatch=True,
    )
    return CrossSourceVerifier(config=config, db_path=":memory:")


def _make_request(action_type: str = "wire_transfer") -> VerificationRequest:
    return VerificationRequest(
        action_type=action_type,
        fields_to_verify=["amount", "recipient_iban"],
        primary_values={"amount": "5000", "recipient_iban": "DE89370400440532013000"},
        session_id="sess-test-001",
    )


# ---------------------------------------------------------------------------
# Test: two matching sources passes verification
# ---------------------------------------------------------------------------


def test_two_matching_sources_passes(verifier: CrossSourceVerifier) -> None:
    """All fields with two agreeing high-confidence sources should verify."""
    request_id = verifier.submit_verification(_make_request())

    # Two sources agree on 'amount'
    verifier.add_source_evidence(request_id, "amount", "5000", "bank_api", 0.99)
    verifier.add_source_evidence(request_id, "amount", "5000", "erp_db", 0.95)

    # Two sources agree on 'recipient_iban'
    verifier.add_source_evidence(
        request_id, "recipient_iban", "DE89370400440532013000", "bank_api", 0.99
    )
    verifier.add_source_evidence(
        request_id, "recipient_iban", "DE89370400440532013000", "erp_db", 0.92
    )

    result = verifier.evaluate(request_id)

    assert isinstance(result, VerificationResult)
    assert result.verified is True, f"Expected verified=True, mismatches={result.mismatches}"
    assert result.mismatches == []


# ---------------------------------------------------------------------------
# Test: single source fails (needs 2)
# ---------------------------------------------------------------------------


def test_single_source_fails(verifier: CrossSourceVerifier) -> None:
    """A wire_transfer action with only one source per field must fail."""
    request_id = verifier.submit_verification(_make_request())

    # Only ONE source for each field
    verifier.add_source_evidence(request_id, "amount", "5000", "bank_api", 0.99)
    verifier.add_source_evidence(
        request_id, "recipient_iban", "DE89370400440532013000", "bank_api", 0.99
    )

    result = verifier.evaluate(request_id)

    assert result.verified is False, "Single source should fail verification"
    assert len(result.mismatches) > 0
    # At least one field flagged as insufficient sources
    reasons = [m["reason"] for m in result.mismatches]
    assert any(r == "insufficient_sources" for r in reasons)


# ---------------------------------------------------------------------------
# Test: mismatching sources blocks action
# ---------------------------------------------------------------------------


def test_mismatching_sources_blocks_action(verifier: CrossSourceVerifier) -> None:
    """Two sources with different values for the same field must fail."""
    request_id = verifier.submit_verification(_make_request())

    # Two sources DISAGREE on 'amount'
    verifier.add_source_evidence(request_id, "amount", "5000", "bank_api", 0.99)
    verifier.add_source_evidence(request_id, "amount", "9999", "erp_db", 0.95)  # different!

    # Two sources agree on 'recipient_iban'
    verifier.add_source_evidence(
        request_id, "recipient_iban", "DE89370400440532013000", "bank_api", 0.99
    )
    verifier.add_source_evidence(
        request_id, "recipient_iban", "DE89370400440532013000", "erp_db", 0.92
    )

    result = verifier.evaluate(request_id)

    assert result.verified is False, "Mismatching sources must block the action"
    mismatch_fields = [m["field"] for m in result.mismatches]
    assert "amount" in mismatch_fields


# ---------------------------------------------------------------------------
# Additional coverage tests
# ---------------------------------------------------------------------------


def test_get_evidence_pack_returns_dict(verifier: CrossSourceVerifier) -> None:
    """get_evidence_pack should return a dict with expected keys."""
    request_id = verifier.submit_verification(_make_request())
    verifier.add_source_evidence(request_id, "amount", "5000", "bank_api", 0.99)

    pack = verifier.get_evidence_pack(request_id)

    assert "request_id" in pack
    assert pack["request_id"] == request_id
    assert "evidence" in pack
    assert len(pack["evidence"]) == 1


def test_unknown_request_id_raises(verifier: CrossSourceVerifier) -> None:
    """evaluate on unknown request_id must raise ValueError."""
    with pytest.raises(ValueError, match="Unknown request_id"):
        verifier.evaluate("non-existent-id")


def test_add_evidence_unknown_request_raises(verifier: CrossSourceVerifier) -> None:
    """add_source_evidence on unknown request_id must raise ValueError."""
    with pytest.raises(ValueError, match="Unknown request_id"):
        verifier.add_source_evidence("bad-id", "amount", "100", "src", 0.9)


def test_low_confidence_evidence_ignored(verifier: CrossSourceVerifier) -> None:
    """Evidence below the confidence threshold does not count toward the two-source rule."""
    request_id = verifier.submit_verification(_make_request())

    # Two sources but one has low confidence
    verifier.add_source_evidence(request_id, "amount", "5000", "bank_api", 0.99)
    verifier.add_source_evidence(request_id, "amount", "5000", "erp_db", 0.3)  # below 0.8

    # recipient_iban — one good source only
    verifier.add_source_evidence(
        request_id, "recipient_iban", "DE89370400440532013000", "bank_api", 0.99
    )
    verifier.add_source_evidence(
        request_id, "recipient_iban", "DE89370400440532013000", "erp_db", 0.1
    )

    result = verifier.evaluate(request_id)
    # Only 1 high-confidence source per field → fail
    assert result.verified is False
