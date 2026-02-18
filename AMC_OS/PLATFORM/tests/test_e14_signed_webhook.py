"""
Tests for E14 Signed Webhook Gateway.

Covers:
- HMAC-SHA256 signature validation (Stripe, GitHub, generic formats)
- Replay protection (duplicate event ID rejected)
- Timestamp window enforcement
- Event type allowlisting
- Schema validation
"""
from __future__ import annotations

import hashlib
import hmac
import json
import time

import pytest

from amc.enforce.e14_webhook_gateway import WebhookGateway, WebhookSource


# ---------------------------------------------------------------------------
# Fixtures
# ---------------------------------------------------------------------------

SECRET = "whsec_test_secret_123"


@pytest.fixture()
def gw() -> WebhookGateway:
    """Fresh in-memory gateway with a registered source."""
    g = WebhookGateway(":memory:")
    g.register_source(
        name="stripe",
        secret=SECRET,
        algorithm="hmac-sha256",
        event_types=["checkout.session.completed", "invoice.paid"],
        schema={"type": "object", "required": ["id", "type"]},
        timestamp_tolerance_seconds=300,
    )
    return g


def _stripe_sig(body: bytes, secret: str = SECRET, ts: int | None = None) -> str:
    """Build a Stripe-format signature header."""
    ts = ts or int(time.time())
    signed_payload = f"{ts}.{body.decode()}"
    sig = hmac.new(secret.encode(), signed_payload.encode(), hashlib.sha256).hexdigest()
    return f"t={ts},v1={sig}"


def _github_sig(body: bytes, secret: str = SECRET) -> str:
    """Build a GitHub-format signature header."""
    sig = hmac.new(secret.encode(), body, hashlib.sha256).hexdigest()
    return f"sha256={sig}"


# ---------------------------------------------------------------------------
# HMAC Signature Tests
# ---------------------------------------------------------------------------

class TestHMACSignature:
    """Webhook HMAC-SHA256 signature validation."""

    def test_valid_stripe_signature(self, gw: WebhookGateway) -> None:
        body = json.dumps({"id": "evt_1", "type": "checkout.session.completed"}).encode()
        ts = int(time.time())
        sig = _stripe_sig(body, ts=ts)
        result = gw.validate_request(
            source_name="stripe",
            headers={"stripe-signature": sig},
            body_bytes=body,
            timestamp_header="stripe-signature",
        )
        assert result.valid, result.reason
        assert result.event_type == "checkout.session.completed"

    def test_invalid_signature_rejected(self, gw: WebhookGateway) -> None:
        body = json.dumps({"id": "evt_2", "type": "invoice.paid"}).encode()
        result = gw.validate_request(
            source_name="stripe",
            headers={"stripe-signature": "t=123,v1=deadbeef"},
            body_bytes=body,
            timestamp_header="stripe-signature",
        )
        assert not result.valid
        assert "mismatch" in result.reason.lower() or "signature" in result.reason.lower()

    def test_wrong_secret_rejected(self, gw: WebhookGateway) -> None:
        body = json.dumps({"id": "evt_3", "type": "invoice.paid"}).encode()
        sig = _stripe_sig(body, secret="wrong_secret")
        result = gw.validate_request(
            source_name="stripe",
            headers={"stripe-signature": sig},
            body_bytes=body,
            timestamp_header="stripe-signature",
        )
        assert not result.valid

    def test_github_format_accepted(self) -> None:
        gw = WebhookGateway(":memory:")
        gw.register_source(name="github", secret=SECRET, algorithm="hmac-sha256")
        body = json.dumps({"id": "del_1", "action": "push"}).encode()
        sig = _github_sig(body)
        result = gw.validate_request(
            source_name="github",
            headers={"x-hub-signature-256": sig, "x-github-delivery": "del_1"},
            body_bytes=body,
        )
        assert result.valid, result.reason

    def test_missing_signature_rejected(self, gw: WebhookGateway) -> None:
        body = json.dumps({"id": "evt_4", "type": "invoice.paid"}).encode()
        result = gw.validate_request(
            source_name="stripe",
            headers={},
            body_bytes=body,
        )
        assert not result.valid
        assert "signature" in result.reason.lower() or "header" in result.reason.lower()

    def test_tampered_body_rejected(self, gw: WebhookGateway) -> None:
        body = json.dumps({"id": "evt_5", "type": "invoice.paid"}).encode()
        sig = _stripe_sig(body)
        tampered = json.dumps({"id": "evt_5", "type": "invoice.paid", "extra": True}).encode()
        result = gw.validate_request(
            source_name="stripe",
            headers={"stripe-signature": sig},
            body_bytes=tampered,
            timestamp_header="stripe-signature",
        )
        assert not result.valid


# ---------------------------------------------------------------------------
# Replay Protection Tests
# ---------------------------------------------------------------------------

class TestReplayProtection:
    """Duplicate event IDs must be rejected."""

    def test_duplicate_event_id_rejected(self, gw: WebhookGateway) -> None:
        body = json.dumps({"id": "evt_dup", "type": "invoice.paid"}).encode()
        sig = _stripe_sig(body)
        headers = {"stripe-signature": sig}

        r1 = gw.validate_request("stripe", headers, body, "stripe-signature")
        assert r1.valid, r1.reason

        # Same event ID again — must be rejected
        sig2 = _stripe_sig(body)
        r2 = gw.validate_request("stripe", {"stripe-signature": sig2}, body, "stripe-signature")
        assert not r2.valid
        assert "replay" in r2.reason.lower()

    def test_different_event_ids_both_accepted(self, gw: WebhookGateway) -> None:
        for eid in ("evt_a", "evt_b"):
            body = json.dumps({"id": eid, "type": "invoice.paid"}).encode()
            sig = _stripe_sig(body)
            r = gw.validate_request("stripe", {"stripe-signature": sig}, body, "stripe-signature")
            assert r.valid, f"Event {eid} should be accepted: {r.reason}"

    def test_nonce_cleanup(self, gw: WebhookGateway) -> None:
        removed = gw.cleanup_nonces(max_age_seconds=0)
        assert isinstance(removed, int)


# ---------------------------------------------------------------------------
# Timestamp Window Tests
# ---------------------------------------------------------------------------

class TestTimestampWindow:
    """Timestamps outside tolerance must be rejected."""

    def test_old_timestamp_rejected(self, gw: WebhookGateway) -> None:
        body = json.dumps({"id": "evt_old", "type": "invoice.paid"}).encode()
        old_ts = int(time.time()) - 600  # 10 minutes ago, tolerance is 5 min
        sig = _stripe_sig(body, ts=old_ts)
        result = gw.validate_request(
            source_name="stripe",
            headers={"stripe-signature": sig},
            body_bytes=body,
            timestamp_header="stripe-signature",
        )
        assert not result.valid
        assert "timestamp" in result.reason.lower() or "old" in result.reason.lower()

    def test_recent_timestamp_accepted(self, gw: WebhookGateway) -> None:
        body = json.dumps({"id": "evt_recent", "type": "invoice.paid"}).encode()
        recent_ts = int(time.time()) - 10  # 10 seconds ago
        sig = _stripe_sig(body, ts=recent_ts)
        result = gw.validate_request(
            source_name="stripe",
            headers={"stripe-signature": sig},
            body_bytes=body,
            timestamp_header="stripe-signature",
        )
        assert result.valid, result.reason


# ---------------------------------------------------------------------------
# Event Type & Schema Tests
# ---------------------------------------------------------------------------

class TestEventTypeAndSchema:
    """Event type allowlisting and schema validation."""

    def test_disallowed_event_type_rejected(self, gw: WebhookGateway) -> None:
        body = json.dumps({"id": "evt_bad_type", "type": "customer.deleted"}).encode()
        sig = _stripe_sig(body)
        result = gw.validate_request(
            source_name="stripe",
            headers={"stripe-signature": sig},
            body_bytes=body,
            timestamp_header="stripe-signature",
        )
        assert not result.valid
        assert "allowlist" in result.reason.lower() or "event type" in result.reason.lower()

    def test_missing_required_field_rejected(self, gw: WebhookGateway) -> None:
        body = json.dumps({"type": "invoice.paid"}).encode()  # missing "id"
        sig = _stripe_sig(body)
        result = gw.validate_request(
            source_name="stripe",
            headers={"stripe-signature": sig},
            body_bytes=body,
            timestamp_header="stripe-signature",
        )
        assert not result.valid
        assert "schema" in result.reason.lower() or "required" in result.reason.lower()

    def test_unknown_source_rejected(self, gw: WebhookGateway) -> None:
        result = gw.validate_request(
            source_name="unknown",
            headers={},
            body_bytes=b"{}",
        )
        assert not result.valid
        assert "unknown" in result.reason.lower()

    def test_invalid_json_rejected(self, gw: WebhookGateway) -> None:
        body = b"not json at all"
        sig = _stripe_sig(body)
        result = gw.validate_request(
            source_name="stripe",
            headers={"stripe-signature": sig},
            body_bytes=body,
            timestamp_header="stripe-signature",
        )
        assert not result.valid
        assert "json" in result.reason.lower()
