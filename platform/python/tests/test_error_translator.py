"""Tests for amc.product.error_translator — Error-to-Fix Translator."""
from __future__ import annotations

import pytest

from amc.product.error_translator import (
    ErrorTranslator,
    get_error_translator,
)


@pytest.fixture()
def translator(tmp_path):
    return ErrorTranslator(db_path=tmp_path / "errors.db")


# ---------------------------------------------------------------------------
# Translation — built-in patterns (high confidence)
# ---------------------------------------------------------------------------


@pytest.mark.parametrize("error_msg,expected_category", [
    ("Connection refused to 10.0.0.1:8080", "network"),
    ("connect timed out after 30s", "network"),
    ("HTTP 401 Unauthorized", "auth"),
    ("Invalid API key provided", "auth"),
    ("403 Forbidden: access denied", "authz"),
    ("404 Not Found: resource does not exist", "not_found"),
    ("429 Too Many Requests: rate limit exceeded", "rate_limit"),
    ("quota exceeded for this project", "rate_limit"),
    ("500 Internal Server Error", "server_error"),
    ("upstream error from gateway", "server_error"),
    ("Operation timed out after 60 seconds", "timeout"),
    ("deadline exceeded", "timeout"),
    ("Invalid parameter: 'limit' must be an integer", "validation"),
    ("schema violation: unexpected field", "validation"),
    ("JSON decode error at position 42", "parse_error"),
    ("SSL certificate verify failed", "ssl"),
    ("certificate expired", "ssl"),
    ("no space left on device", "storage"),
    ("disk full", "storage"),
    ("KeyError: 'user_id'", "code_error"),
    ("AttributeError: 'NoneType' object", "code_error"),
])
def test_builtin_pattern_matching(translator, error_msg, expected_category):
    result = translator.translate(error_msg)
    assert result.error_category == expected_category, (
        f"Expected {expected_category!r} for {error_msg!r}, got {result.error_category!r}"
    )
    assert result.confidence in ("high", "medium")
    assert len(result.remediation_steps) >= 1


def test_high_confidence_for_exact_match(translator):
    result = translator.translate("Connection refused to host")
    assert result.confidence == "high"


# ---------------------------------------------------------------------------
# Translation — unrecognized errors
# ---------------------------------------------------------------------------


def test_unknown_error_returns_fallback(translator):
    result = translator.translate("xyzzy purple monkey dishwasher error")
    assert result.error_category == "unknown"
    assert result.confidence == "low"
    assert len(result.remediation_steps) >= 1  # generic fallback advice


# ---------------------------------------------------------------------------
# Corrected params
# ---------------------------------------------------------------------------


def test_network_error_suggests_corrected_params(translator):
    result = translator.translate("Connection refused")
    assert "timeout_ms" in result.corrected_params or "max_retries" in result.corrected_params


def test_rate_limit_error_suggests_delay(translator):
    result = translator.translate("429 too many requests")
    assert "delay_ms" in result.corrected_params or "max_retries" in result.corrected_params


def test_corrected_params_merged_with_incoming(translator):
    result = translator.translate(
        "Connection refused",
        params={"timeout_ms": 5000, "other_key": "existing"},
    )
    # corrected_params should contain overrides from pattern
    assert result.corrected_params  # not empty


# ---------------------------------------------------------------------------
# Tool name and metadata
# ---------------------------------------------------------------------------


def test_tool_name_propagated(translator):
    result = translator.translate("401 Unauthorized", tool_name="payment_api")
    assert result.tool_name == "payment_api"


def test_alternate_routes_populated_for_auth(translator):
    result = translator.translate("Invalid token")
    assert len(result.alternate_routes) >= 1


# ---------------------------------------------------------------------------
# Error history log
# ---------------------------------------------------------------------------


def test_error_history_stores_entries(translator):
    translator.translate("Connection refused", tool_name="tool_a")
    translator.translate("404 not found", tool_name="tool_b")
    history = translator.get_error_history()
    assert len(history) >= 2


def test_error_history_filtered_by_tool(translator):
    translator.translate("timeout", tool_name="my_tool")
    translator.translate("404", tool_name="other_tool")
    history = translator.get_error_history(tool_name="my_tool")
    assert all(h["tool_name"] == "my_tool" for h in history)


def test_error_history_filtered_by_category(translator):
    translator.translate("connection refused", tool_name="t1")
    translator.translate("json decode error", tool_name="t2")
    net_history = translator.get_error_history(category="network")
    assert all(h["error_category"] == "network" for h in net_history)


# ---------------------------------------------------------------------------
# Categories
# ---------------------------------------------------------------------------


def test_get_categories_returns_all_known(translator):
    cats = translator.get_categories()
    assert isinstance(cats, list)
    assert "network" in cats
    assert "auth" in cats
    assert "rate_limit" in cats
    assert "timeout" in cats
    assert len(cats) >= 8


# ---------------------------------------------------------------------------
# Edge cases
# ---------------------------------------------------------------------------


def test_empty_error_string(translator):
    result = translator.translate("")
    assert result.error_category == "unknown"
    assert len(result.remediation_steps) >= 1


def test_very_long_error_string(translator):
    long_err = "connection refused " + "x" * 2000
    result = translator.translate(long_err)
    assert result.error_category == "network"


# ---------------------------------------------------------------------------
# Singleton factory
# ---------------------------------------------------------------------------


def test_singleton_factory(tmp_path, monkeypatch):
    import amc.product.error_translator as mod
    mod._translator = None
    t1 = get_error_translator(db_path=tmp_path / "s.db")
    t2 = get_error_translator()
    assert t1 is t2
    mod._translator = None  # reset
