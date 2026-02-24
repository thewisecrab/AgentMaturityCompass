"""Tests for E29 — Idempotency Shield."""
from __future__ import annotations

from datetime import datetime, timedelta, timezone

import pytest

from amc.enforce.e29_idempotency import (
    ExecutionRecord,
    IdempotencyConfig,
    IdempotencyShield,
)


@pytest.fixture()
def shield() -> IdempotencyShield:
    """In-memory shield for isolated test runs."""
    return IdempotencyShield(db_path=":memory:")


# ---------------------------------------------------------------------------
# Test: first call allows execution
# ---------------------------------------------------------------------------


def test_first_call_allows_execution(shield: IdempotencyShield) -> None:
    """A brand-new key must be lockable; caller is allowed to proceed."""
    key = shield.generate_key("wf-001", "charge_card", {"amount": 99, "card": "tok_x"})
    can_proceed, existing = shield.check_and_lock(key, "wf-001", "charge_card")

    assert can_proceed is True, "First call should be allowed to proceed"
    assert existing is None, "No existing record should be returned for a new key"


# ---------------------------------------------------------------------------
# Test: second call with same key returns existing result (blocked)
# ---------------------------------------------------------------------------


def test_second_call_blocked_after_completion(shield: IdempotencyShield) -> None:
    """After mark_completed, a second check_and_lock must be blocked."""
    params = {"amount": 150, "card": "tok_y"}
    key = shield.generate_key("wf-002", "send_email", params)

    # First call — acquire lock
    can_proceed, _ = shield.check_and_lock(key, "wf-002", "send_email")
    assert can_proceed is True

    # Simulate successful completion
    record = shield.mark_completed(key, {"email_id": "msg-abc123"})
    assert record.success is True
    assert record.result_hash is not None

    # Second call — must be blocked
    can_proceed2, existing = shield.check_and_lock(key, "wf-002", "send_email")
    assert can_proceed2 is False, "Second call must be blocked after completion"
    assert existing is not None, "Existing record must be returned"
    assert isinstance(existing, ExecutionRecord)
    assert existing.success is True


def test_same_key_deterministic(shield: IdempotencyShield) -> None:
    """generate_key must produce the same output for identical inputs."""
    params = {"item": "x", "qty": 3}
    k1 = shield.generate_key("wf-003", "cancel", params)
    k2 = shield.generate_key("wf-003", "cancel", params)
    assert k1 == k2


def test_different_params_different_key(shield: IdempotencyShield) -> None:
    """Different params must produce different keys."""
    k1 = shield.generate_key("wf-004", "charge", {"amount": 10})
    k2 = shield.generate_key("wf-004", "charge", {"amount": 20})
    assert k1 != k2


# ---------------------------------------------------------------------------
# Test: expired key allows new execution
# ---------------------------------------------------------------------------


def test_expired_key_allows_new_execution() -> None:
    """A key that has expired (TTL elapsed) should allow re-execution."""
    # Use TTL of 1 second so we can manufacture an expired key by manipulating
    # the DB directly.
    config = IdempotencyConfig(default_ttl_seconds=1)
    shield = IdempotencyShield(config=config, db_path=":memory:")

    params = {"subscription_id": "sub-999"}
    key = shield.generate_key("wf-005", "cancel_subscription", params)

    # Lock + complete
    can_proceed, _ = shield.check_and_lock(key, "wf-005", "cancel_subscription")
    assert can_proceed is True
    shield.mark_completed(key, {"cancelled": True})

    # Force-expire by directly updating the DB timestamp to the past
    past = (datetime.now(timezone.utc) - timedelta(hours=1)).isoformat()
    shield._conn.execute(
        "UPDATE idempotency_keys SET expires_at = ? WHERE key = ?",
        (past, key),
    )
    shield._conn.commit()

    # Now check_and_lock should allow re-execution
    can_proceed2, existing2 = shield.check_and_lock(key, "wf-005", "cancel_subscription")
    assert can_proceed2 is True, "Expired key must allow re-execution"
    assert existing2 is None


def test_mark_failed(shield: IdempotencyShield) -> None:
    """mark_failed records a failed attempt and marks key as failed."""
    key = shield.generate_key("wf-006", "refund", {"order_id": "ord-1"})
    shield.check_and_lock(key, "wf-006", "refund")
    record = shield.mark_failed(key, "payment gateway timeout")
    assert record.success is False


def test_cleanup_expired(shield: IdempotencyShield) -> None:
    """cleanup_expired removes keys past their TTL and returns count."""
    key = shield.generate_key("wf-007", "notify", {"user": "alice"})
    shield.check_and_lock(key, "wf-007", "notify")
    shield.mark_completed(key, {"sent": True})

    # Expire it
    past = (datetime.now(timezone.utc) - timedelta(hours=2)).isoformat()
    shield._conn.execute(
        "UPDATE idempotency_keys SET expires_at = ? WHERE key = ?",
        (past, key),
    )
    shield._conn.commit()

    deleted = shield.cleanup_expired()
    assert deleted == 1

    # Table should be empty
    cur = shield._conn.execute("SELECT COUNT(*) FROM idempotency_keys")
    assert cur.fetchone()[0] == 0
