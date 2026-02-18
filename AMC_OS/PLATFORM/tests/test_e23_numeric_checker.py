"""Tests for E23 Numeric Reasonableness and Unit Consistency Checker."""
from __future__ import annotations

import pytest

from amc.core.models import RiskLevel
from amc.enforce.e23_numeric_checker import NumericChecker


@pytest.fixture
def checker() -> NumericChecker:
    c = NumericChecker(db_path=":memory:")
    c.register_bounds("invoice_amount", 10.0, 5000.0, "USD")
    return c


def test_normal_value(checker: NumericChecker) -> None:
    r = checker.check(150.0, "USD", {"field": "invoice_amount"})
    assert r.valid is True
    assert r.risk_level == RiskLevel.LOW
    assert r.anomaly_score == 0.0


def test_exceeds_max(checker: NumericChecker) -> None:
    r = checker.check(6000.0, "USD", {"field": "invoice_amount"})
    assert r.valid is False
    assert "exceeds max" in r.warnings[0].lower() or "exceeds" in r.warnings[0].lower()


def test_extreme_value_high_risk(checker: NumericChecker) -> None:
    r = checker.check(1_000_000.0, "USD", {"field": "invoice_amount"})
    assert r.valid is False
    assert r.risk_level == RiskLevel.HIGH


def test_below_min(checker: NumericChecker) -> None:
    r = checker.check(1.0, "USD", {"field": "invoice_amount"})
    assert r.valid is False
    assert "below minimum" in r.warnings[0].lower()


def test_cents_suggestion(checker: NumericChecker) -> None:
    # 15000 cents = $150, which is in range
    r = checker.check(15000.0, "USD", {"field": "invoice_amount"})
    assert any("cents" in s.lower() or "÷100" in s for s in r.suggestions)


def test_unit_normalization_grams(checker: NumericChecker) -> None:
    checker.register_bounds("weight", 1.0, 100.0, "kg")
    r = checker.check(5000.0, "g", {"field": "weight"})
    assert r.normalized_unit == "kg"
    assert abs(r.normalized_value - 5.0) < 0.01


def test_historical_anomaly(checker: NumericChecker) -> None:
    # Build history of consistent values
    for _ in range(20):
        checker.check(100.0, "USD", {"field": "test_field"})
    # Now check an outlier
    r = checker.check(100_000.0, "USD", {"field": "test_field"})
    assert r.anomaly_score > 3.0


def test_no_bounds_registered(checker: NumericChecker) -> None:
    r = checker.check(42.0, "USD", {"field": "unknown_field"})
    assert r.valid is True


def test_percent_normalization(checker: NumericChecker) -> None:
    checker.register_bounds("rate", 0.0, 100.0, "percent")
    r = checker.check(50.0, "%", {"field": "rate"})
    assert r.normalized_unit == "percent"
    assert r.valid is True
