from __future__ import annotations

from amc.enforce.e18_secret_blind import SecretBlindBroker


def test_request_created_and_logged(tmp_path):
    req_log = tmp_path / "SECRET_ENTRY_REQUESTS.md"
    audit_log = tmp_path / "SECRET_ENTRY_AUDIT.md"

    broker = SecretBlindBroker(
        requests_log_path=str(req_log),
        audit_log_path=str(audit_log),
    )

    req = broker.request_secret_entry(
        domain="example.com",
        field_name="password",
        field_type="password",
        session_id="session-1",
    )

    assert req.status == "pending"
    assert req.domain == "example.com"
    assert req_log.exists()
    assert "[PENDING]" in req_log.read_text()


def test_block_enforced_without_active_request(tmp_path):
    req_log = tmp_path / "SECRET_ENTRY_REQUESTS.md"
    audit_log = tmp_path / "SECRET_ENTRY_AUDIT.md"
    broker = SecretBlindBroker(
        requests_log_path=str(req_log),
        audit_log_path=str(audit_log),
    )

    allowed, reason = broker.can_perform_type_action(
        domain="example.com",
        field_name="password",
        field_type="password",
        session_id="session-2",
    )

    assert allowed is False
    assert "Blocked" in reason


def test_completion_returns_token_and_not_password(tmp_path):
    req_log = tmp_path / "SECRET_ENTRY_REQUESTS.md"
    audit_log = tmp_path / "SECRET_ENTRY_AUDIT.md"
    broker = SecretBlindBroker(
        requests_log_path=str(req_log),
        audit_log_path=str(audit_log),
    )

    req = broker.request_secret_entry(
        domain="payments.example.com",
        field_name="otp",
        field_type="2fa",
        session_id="session-3",
    )
    success, token = broker.complete_request(req.request_id)

    assert success is True
    assert token is not None
    assert token.scope == "payments.example.com"
    assert token.expires_in_seconds == 300
    # Ensure secret value never exposed on return.
    assert "123456" not in str(token)
