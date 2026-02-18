"""Tests for E32 — Restricted Template Engine."""
from __future__ import annotations

from datetime import datetime, timezone

import pytest

from amc.enforce.e32_template_engine import (
    MessageTemplate,
    RenderRequest,
    RenderResult,
    TemplateEngine,
    TemplateVar,
)


def _now() -> datetime:
    return datetime.now(timezone.utc)


@pytest.fixture()
def engine() -> TemplateEngine:
    return TemplateEngine(db_path=":memory:")


def _welcome_template(approved: bool = False) -> MessageTemplate:
    return MessageTemplate(
        template_id="welcome-email-v1",
        name="Welcome Email",
        channel="email",
        body_template="Hi {name}, welcome to {product}!",
        variables=[
            TemplateVar(name="name", type="text", max_length=100),
            TemplateVar(
                name="product",
                type="text",
                allowed_values=["AMC Platform", "AMC Lite"],
            ),
        ],
        approved=approved,
        approved_by=None,
        created_at=_now(),
    )


# ---------------------------------------------------------------------------
# Test: rendering approved template with valid vars succeeds
# ---------------------------------------------------------------------------


def test_render_approved_template_valid_vars(engine: TemplateEngine) -> None:
    """An approved template with all valid variables renders correctly."""
    tmpl = _welcome_template(approved=False)
    engine.register_template(tmpl)
    engine.approve_template("welcome-email-v1", approver="alice@example.com")

    request = RenderRequest(
        template_id="welcome-email-v1",
        variables={"name": "Bob", "product": "AMC Platform"},
        recipient="bob@example.com",
        session_id="sess-001",
    )
    result = engine.render(request)

    assert isinstance(result, RenderResult)
    assert result.rendered_body == "Hi Bob, welcome to AMC Platform!"
    assert result.approved is True
    assert result.blocked_reason is None


# ---------------------------------------------------------------------------
# Test: unapproved template blocked
# ---------------------------------------------------------------------------


def test_unapproved_template_blocked(engine: TemplateEngine) -> None:
    """Attempting to render an unapproved template must be blocked."""
    tmpl = _welcome_template(approved=False)
    engine.register_template(tmpl)

    request = RenderRequest(
        template_id="welcome-email-v1",
        variables={"name": "Eve", "product": "AMC Lite"},
        recipient="eve@example.com",
        session_id="sess-002",
    )
    result = engine.render(request)

    assert result.approved is False
    assert result.rendered_body == ""
    assert result.blocked_reason is not None
    assert "not approved" in result.blocked_reason.lower()


# ---------------------------------------------------------------------------
# Test: missing required variable fails validation
# ---------------------------------------------------------------------------


def test_missing_required_variable_fails_validation(engine: TemplateEngine) -> None:
    """Rendering with a missing required variable must return an error."""
    tmpl = _welcome_template()
    engine.register_template(tmpl)
    engine.approve_template("welcome-email-v1", approver="alice@example.com")

    request = RenderRequest(
        template_id="welcome-email-v1",
        variables={"name": "Bob"},  # 'product' is missing
        recipient="bob@example.com",
        session_id="sess-003",
    )
    result = engine.render(request)

    assert result.rendered_body == ""
    assert result.blocked_reason is not None
    assert "product" in result.blocked_reason.lower() or "missing" in result.blocked_reason.lower()


# ---------------------------------------------------------------------------
# Additional validation tests
# ---------------------------------------------------------------------------


def test_disallowed_variable_value_fails(engine: TemplateEngine) -> None:
    """A value not in allowed_values must trigger a validation error."""
    tmpl = _welcome_template()
    engine.register_template(tmpl)
    engine.approve_template("welcome-email-v1", approver="alice@example.com")

    request = RenderRequest(
        template_id="welcome-email-v1",
        variables={"name": "Bob", "product": "FakeProduct"},
        recipient="bob@example.com",
        session_id="sess-004",
    )
    result = engine.render(request)

    assert result.rendered_body == ""
    assert result.blocked_reason is not None
    assert "product" in result.blocked_reason.lower() or "allowed" in result.blocked_reason.lower()


def test_max_length_exceeded_fails(engine: TemplateEngine) -> None:
    """A value exceeding max_length triggers a validation error."""
    tmpl = MessageTemplate(
        template_id="short-template",
        name="Short",
        channel="sms",
        body_template="Hi {code}",
        variables=[TemplateVar(name="code", type="text", max_length=5)],
        approved=False,
        approved_by=None,
        created_at=_now(),
    )
    engine.register_template(tmpl)
    engine.approve_template("short-template", approver="bob@example.com")

    result = engine.render(
        RenderRequest(
            template_id="short-template",
            variables={"code": "TOOLONGVALUE"},
            recipient="+1234567890",
            session_id="sess-005",
        )
    )
    assert result.rendered_body == ""
    assert result.blocked_reason is not None
    assert "max length" in result.blocked_reason.lower()


def test_email_type_validation(engine: TemplateEngine) -> None:
    """An 'email' type variable must pass RFC-style format check."""
    tmpl = MessageTemplate(
        template_id="email-template",
        name="Email Var Test",
        channel="email",
        body_template="Send to {address}",
        variables=[TemplateVar(name="address", type="email")],
        approved=False,
        approved_by=None,
        created_at=_now(),
    )
    engine.register_template(tmpl)
    engine.approve_template("email-template", approver="ops@example.com")

    # Valid email
    good = engine.render(
        RenderRequest(
            template_id="email-template",
            variables={"address": "user@example.com"},
            recipient="user@example.com",
            session_id="sess-006",
        )
    )
    assert good.blocked_reason is None

    # Invalid email
    bad = engine.render(
        RenderRequest(
            template_id="email-template",
            variables={"address": "not-an-email"},
            recipient="user@example.com",
            session_id="sess-007",
        )
    )
    assert bad.rendered_body == ""
    assert bad.blocked_reason is not None


def test_unknown_template_blocked(engine: TemplateEngine) -> None:
    """Rendering a non-existent template returns blocked result."""
    result = engine.render(
        RenderRequest(
            template_id="does-not-exist",
            variables={},
            recipient="x@x.com",
            session_id="sess-008",
        )
    )
    assert result.rendered_body == ""
    assert result.blocked_reason is not None
    assert "not found" in result.blocked_reason.lower()


def test_list_templates_approved_only(engine: TemplateEngine) -> None:
    """list_templates(approved_only=True) returns only approved templates."""
    t1 = _welcome_template()
    t1 = t1.model_copy(update={"template_id": "t1"})
    t2 = _welcome_template()
    t2 = t2.model_copy(update={"template_id": "t2"})

    engine.register_template(t1)
    engine.register_template(t2)
    engine.approve_template("t1", approver="admin")

    approved = engine.list_templates(approved_only=True)
    assert len(approved) == 1
    assert approved[0].template_id == "t1"


def test_list_templates_by_channel(engine: TemplateEngine) -> None:
    """list_templates filters by channel correctly."""
    email_tmpl = _welcome_template()
    sms_tmpl = MessageTemplate(
        template_id="sms-template",
        name="SMS",
        channel="sms",
        body_template="Hi {name}",
        variables=[TemplateVar(name="name", type="text")],
        approved=False,
        approved_by=None,
        created_at=_now(),
    )
    engine.register_template(email_tmpl)
    engine.register_template(sms_tmpl)
    engine.approve_template("welcome-email-v1", approver="admin")
    engine.approve_template("sms-template", approver="admin")

    email_list = engine.list_templates(channel="email", approved_only=True)
    assert all(t.channel == "email" for t in email_list)

    sms_list = engine.list_templates(channel="sms", approved_only=True)
    assert all(t.channel == "sms" for t in sms_list)


def test_validate_variables_returns_errors_list(engine: TemplateEngine) -> None:
    """validate_variables returns list of error strings for bad input."""
    tmpl = _welcome_template()
    errors = engine.validate_variables(tmpl, {"name": "Bob"})  # missing product
    assert isinstance(errors, list)
    assert len(errors) > 0


def test_approve_template_returns_false_for_unknown(engine: TemplateEngine) -> None:
    """approve_template returns False for non-existent template_id."""
    result = engine.approve_template("non-existent", "admin")
    assert result is False


def test_number_type_validation(engine: TemplateEngine) -> None:
    """A 'number' type variable must be numeric."""
    tmpl = MessageTemplate(
        template_id="num-template",
        name="Number Test",
        channel="webhook",
        body_template="Amount: {amount}",
        variables=[TemplateVar(name="amount", type="number")],
        approved=False,
        approved_by=None,
        created_at=_now(),
    )
    engine.register_template(tmpl)
    engine.approve_template("num-template", approver="admin")

    bad = engine.render(
        RenderRequest(
            template_id="num-template",
            variables={"amount": "not-a-number"},
            recipient="x@x.com",
            session_id="sess-009",
        )
    )
    assert bad.rendered_body == ""
    assert bad.blocked_reason is not None
