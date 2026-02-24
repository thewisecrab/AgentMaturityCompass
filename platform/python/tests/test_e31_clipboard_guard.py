"""Tests for E31 — Clipboard/Pasteboard Guard."""
from __future__ import annotations

import pytest

from amc.enforce.e31_clipboard_guard import (
    ClipboardDecision,
    ClipboardEvent,
    ClipboardGuard,
    ClipboardPolicy,
)


@pytest.fixture()
def guard() -> ClipboardGuard:
    """Default guard with default secret patterns and no domain restrictions."""
    policy = ClipboardPolicy(
        blocked_domains=["secrets.internal", "vault.corp"],
        allow_paste_to_domains=["safe-app.example.com", "docs.example.com"],
        redact_on_copy=True,
    )
    return ClipboardGuard(policy=policy, db_path=":memory:")


# ---------------------------------------------------------------------------
# Test: clean content allowed
# ---------------------------------------------------------------------------


def test_clean_content_copy_allowed(guard: ClipboardGuard) -> None:
    """Ordinary text with no secrets should be allowed to copy."""
    decision = guard.check_copy("Hello, world!", source_domain="docs.example.com")
    assert decision.allowed is True
    assert decision.redacted is False
    assert decision.safe_content == "Hello, world!"


def test_clean_content_paste_allowed(guard: ClipboardGuard) -> None:
    """Ordinary text should be allowed to paste to a permitted domain."""
    decision = guard.check_paste("Hello, world!", target_domain="safe-app.example.com")
    assert decision.allowed is True
    assert decision.redacted is False


# ---------------------------------------------------------------------------
# Test: API key in content blocked/redacted
# ---------------------------------------------------------------------------


def test_aws_key_in_content_is_redacted_on_copy(guard: ClipboardGuard) -> None:
    """An AWS access key ID in copied content should trigger redaction."""
    content = "My key is AKIA1234567890ABCDEF — keep it safe!"
    decision = guard.check_copy(content, source_domain="docs.example.com")

    # With redact_on_copy=True the copy is allowed but content is redacted
    assert decision.allowed is True
    assert decision.redacted is True
    assert "[REDACTED]" in (decision.safe_content or "")
    assert "AKIA1234567890ABCDEF" not in (decision.safe_content or "")


def test_api_key_assignment_redacted(guard: ClipboardGuard) -> None:
    """api_key=... assignments should be redacted."""
    content = "api_key=supersecretvalue12345678"
    decision = guard.check_copy(content, source_domain=None)

    assert decision.redacted is True
    assert "[REDACTED]" in (decision.safe_content or "")


def test_password_assignment_redacted(guard: ClipboardGuard) -> None:
    """password=... should be caught and redacted."""
    content = "password=MyP@ssw0rd!"
    decision = guard.check_copy(content)
    assert decision.redacted is True


def test_private_key_header_redacted(guard: ClipboardGuard) -> None:
    """PEM private key header line should trigger redaction."""
    content = "-----BEGIN RSA PRIVATE KEY-----\nMIIE..."
    decision = guard.check_copy(content)
    assert decision.redacted is True


def test_secret_paste_is_blocked(guard: ClipboardGuard) -> None:
    """Pasting content with secrets must be blocked even to allowed domains."""
    content = "token=eyJhbGciOiJIUzI1NiJ9.payload.sig"
    decision = guard.check_paste(content, target_domain="safe-app.example.com")
    assert decision.allowed is False


# ---------------------------------------------------------------------------
# Test: paste to blocked domain denied
# ---------------------------------------------------------------------------


def test_paste_to_non_allowlisted_domain_denied(guard: ClipboardGuard) -> None:
    """Paste to a domain not in the allowlist must be denied."""
    decision = guard.check_paste("Hello!", target_domain="evil.example.com")
    assert decision.allowed is False
    assert "allowlist" in decision.reason.lower()


def test_paste_to_allowed_domain_succeeds(guard: ClipboardGuard) -> None:
    """Paste of clean content to a whitelisted domain must succeed."""
    decision = guard.check_paste("Hello!", target_domain="docs.example.com")
    assert decision.allowed is True


# ---------------------------------------------------------------------------
# Test: blocked source domain
# ---------------------------------------------------------------------------


def test_copy_from_blocked_domain_denied(guard: ClipboardGuard) -> None:
    """Copy from a blocked source domain must be denied regardless of content."""
    decision = guard.check_copy("plain text", source_domain="vault.corp")
    assert decision.allowed is False
    assert "blocked" in decision.reason.lower()


# ---------------------------------------------------------------------------
# Test: contains_secret and redact_secrets helpers
# ---------------------------------------------------------------------------


def test_contains_secret_true(guard: ClipboardGuard) -> None:
    assert guard.contains_secret("AKIA1234567890ABCDEF") is True


def test_contains_secret_false(guard: ClipboardGuard) -> None:
    assert guard.contains_secret("just a regular sentence") is False


def test_redact_secrets_replaces_all(guard: ClipboardGuard) -> None:
    content = "key=abc123456789 and AKIA1234567890ABCDEF"
    redacted = guard.redact_secrets(content)
    assert "AKIA1234567890ABCDEF" not in redacted
    assert "[REDACTED]" in redacted


# ---------------------------------------------------------------------------
# Test: audit log
# ---------------------------------------------------------------------------


def test_audit_log_records_events(guard: ClipboardGuard) -> None:
    """Every copy/paste operation must be logged."""
    guard.check_copy("hello", source_domain="example.com")
    guard.check_paste("hello", target_domain="safe-app.example.com")

    log = guard.get_audit_log(limit=10)
    assert len(log) == 2
    assert all(isinstance(e, ClipboardEvent) for e in log)


def test_audit_log_limit(guard: ClipboardGuard) -> None:
    """Audit log respects the limit parameter."""
    for i in range(5):
        guard.check_copy(f"text {i}", source_domain="example.com")

    log = guard.get_audit_log(limit=3)
    assert len(log) == 3


def test_no_domain_restriction_when_allowlist_empty() -> None:
    """When allow_paste_to_domains is empty any domain can receive paste."""
    guard = ClipboardGuard(
        policy=ClipboardPolicy(
            blocked_domains=[],
            allow_paste_to_domains=[],  # empty → no restriction
            redact_on_copy=True,
        ),
        db_path=":memory:",
    )
    decision = guard.check_paste("clean text", target_domain="anywhere.example.com")
    assert decision.allowed is True
