"""
Tests for V12: Data Classification + Label Propagation
"""
from __future__ import annotations

import pytest

from amc.vault.v12_data_classification import (
    ClassificationConfig,
    ClassificationRule,
    DataClassifier,
    DataLabel,
    LabeledData,
    PropagationPolicy,
)


# ---------------------------------------------------------------------------
# Fixtures
# ---------------------------------------------------------------------------


@pytest.fixture
def clf(tmp_path):
    """Fresh classifier with temp DB."""
    return DataClassifier(db_path=tmp_path / "clf.db")


# ---------------------------------------------------------------------------
# REGULATED detection
# ---------------------------------------------------------------------------


def test_credit_card_number_classified_as_regulated(clf):
    """A credit card number triggers the REGULATED label."""
    content = "Please charge card 4111 1111 1111 1111 for the subscription."
    result = clf.classify(content)

    assert result.label == DataLabel.REGULATED
    assert "reg_credit_card" in result.matching_rules
    assert result.confidence > 0.5


def test_ssn_classified_as_regulated(clf):
    """A US SSN triggers the REGULATED label."""
    content = "SSN on file: 123-45-6789"
    result = clf.classify(content)

    assert result.label == DataLabel.REGULATED
    assert "reg_ssn" in result.matching_rules


def test_aadhaar_classified_as_regulated(clf):
    """The word 'aadhaar' (case-insensitive) triggers REGULATED."""
    result = clf.classify("Please provide your Aadhaar number for verification.")
    assert result.label == DataLabel.REGULATED


def test_ifsc_classified_as_regulated(clf):
    """An IFSC bank code triggers REGULATED."""
    result = clf.classify("Bank details: IFSCHDFC00001")
    assert result.label == DataLabel.REGULATED


# ---------------------------------------------------------------------------
# CONFIDENTIAL detection
# ---------------------------------------------------------------------------


def test_api_key_classified_as_confidential(clf):
    """Content mentioning 'api_key' or 'api key' triggers CONFIDENTIAL."""
    content = "Set the api_key to sk-prod-abc123 in your config."
    result = clf.classify(content)

    assert result.label == DataLabel.CONFIDENTIAL
    assert "conf_secrets" in result.matching_rules


def test_password_classified_as_confidential(clf):
    """Content mentioning 'password' triggers CONFIDENTIAL."""
    result = clf.classify("Reset your password at /auth/reset")
    assert result.label == DataLabel.CONFIDENTIAL


def test_confidential_marking_detected(clf):
    """Explicit 'CONFIDENTIAL' text triggers CONFIDENTIAL label."""
    result = clf.classify("CONFIDENTIAL: Do not share this document.")
    assert result.label == DataLabel.CONFIDENTIAL


# ---------------------------------------------------------------------------
# INTERNAL detection
# ---------------------------------------------------------------------------


def test_internal_marking_detected(clf):
    """'internal' keyword triggers INTERNAL label (if no higher-severity match)."""
    result = clf.classify("This is an internal memo for staff only.")
    assert result.label == DataLabel.INTERNAL


# ---------------------------------------------------------------------------
# PUBLIC (no matches → default)
# ---------------------------------------------------------------------------


def test_clean_content_uses_default_label(tmp_path):
    """Content with no matches falls back to the default label (INTERNAL)."""
    clf = DataClassifier(db_path=tmp_path / "clf.db")
    result = clf.classify("Hello world! This is a public announcement.")
    # Default is INTERNAL unless 'internal' keyword matches
    # The word 'public' in isolation doesn't trigger our rules
    assert result.label == DataLabel.INTERNAL  # default
    assert result.matching_rules == []


def test_custom_default_public(tmp_path):
    """Custom config with default_label=PUBLIC returns PUBLIC for clean content."""
    clf = DataClassifier(
        config=ClassificationConfig(default_label=DataLabel.PUBLIC),
        db_path=tmp_path / "clf.db",
    )
    result = clf.classify("No sensitive data here.")
    assert result.label == DataLabel.PUBLIC


# ---------------------------------------------------------------------------
# Severity ordering
# ---------------------------------------------------------------------------


def test_regulated_beats_confidential(clf):
    """When content matches both REGULATED and CONFIDENTIAL, REGULATED wins."""
    content = "Password: secret123. Card: 4111 1111 1111 1111"
    result = clf.classify(content)
    assert result.label == DataLabel.REGULATED


# ---------------------------------------------------------------------------
# Tool allowed checks
# ---------------------------------------------------------------------------


def test_regulated_blocks_email_send_tool(clf):
    """REGULATED data blocks the 'email_send' tool."""
    allowed, reason = clf.check_tool_allowed(DataLabel.REGULATED, "email_send")
    assert allowed is False
    assert "email_send" in reason.lower() or "blocked" in reason.lower()


def test_regulated_blocks_slack_send_tool(clf):
    """REGULATED data blocks the 'slack_send' tool."""
    allowed, reason = clf.check_tool_allowed(DataLabel.REGULATED, "slack_send")
    assert allowed is False


def test_regulated_blocks_export_csv_tool(clf):
    """REGULATED data blocks the 'export_csv' tool."""
    allowed, reason = clf.check_tool_allowed(DataLabel.REGULATED, "export_csv")
    assert allowed is False


def test_confidential_blocks_email_send_external(clf):
    """CONFIDENTIAL data blocks the 'email_send_external' tool."""
    allowed, reason = clf.check_tool_allowed(
        DataLabel.CONFIDENTIAL, "email_send_external"
    )
    assert allowed is False


def test_public_allows_any_tool(clf):
    """PUBLIC data allows any tool."""
    allowed, reason = clf.check_tool_allowed(DataLabel.PUBLIC, "email_send")
    assert allowed is True


def test_internal_allows_internal_tools(clf):
    """INTERNAL data allows tools not in any blocked list."""
    allowed, reason = clf.check_tool_allowed(DataLabel.INTERNAL, "internal_report")
    assert allowed is True


# ---------------------------------------------------------------------------
# Destination checks
# ---------------------------------------------------------------------------


def test_regulated_blocks_external_destination(clf):
    """REGULATED data is only allowed to 'internal-only' destination."""
    allowed, reason = clf.check_destination_allowed(
        DataLabel.REGULATED, "external-email"
    )
    assert allowed is False


def test_regulated_allows_internal_only_destination(clf):
    """REGULATED data is allowed to 'internal-only' destination."""
    allowed, reason = clf.check_destination_allowed(
        DataLabel.REGULATED, "internal-only"
    )
    assert allowed is True


def test_public_allows_any_destination(clf):
    """PUBLIC data allows any destination."""
    allowed, reason = clf.check_destination_allowed(DataLabel.PUBLIC, "anywhere")
    assert allowed is True


# ---------------------------------------------------------------------------
# Persistence
# ---------------------------------------------------------------------------


def test_get_classification_returns_stored(clf):
    """classify() persists and get_classification() retrieves it."""
    result = clf.classify("My SSN is 123-45-6789", data_id="test-ssn-001")
    retrieved = clf.get_classification("test-ssn-001")

    assert retrieved is not None
    assert retrieved.data_id == "test-ssn-001"
    assert retrieved.label == DataLabel.REGULATED


def test_get_classification_missing_returns_none(clf):
    """get_classification returns None for unknown data_id."""
    result = clf.get_classification("nonexistent-id")
    assert result is None
