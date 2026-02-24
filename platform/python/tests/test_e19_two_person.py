"""Tests for E19 Two-Person Integrity Workflow Engine."""
from __future__ import annotations

import time
from datetime import datetime, timedelta, timezone

import pytest

from amc.enforce.e19_two_person import (
    ActionRole,
    ApprovalResult,
    RequestStatus,
    TwoPersonIntegrity,
    TwoPersonRequest,
)


@pytest.fixture
def tpi() -> TwoPersonIntegrity:
    engine = TwoPersonIntegrity(db_path=":memory:")
    engine.register_action_type(
        "deploy",
        required_roles=[ActionRole.APPROVER_1, ActionRole.APPROVER_2],
        min_approvers=2,
    )
    return engine


def test_happy_path(tpi: TwoPersonIntegrity) -> None:
    req = tpi.submit("deploy", "alice", "Deploy v1", {"tag": "v1"})
    assert req.status == RequestStatus.PENDING

    r1 = tpi.approve(req.request_id, "bob", ActionRole.APPROVER_1)
    assert r1.success
    assert r1.request_status == RequestStatus.PENDING

    r2 = tpi.approve(req.request_id, "carol", ActionRole.APPROVER_2)
    assert r2.success
    assert r2.request_status == RequestStatus.APPROVED

    result = tpi.execute(req.request_id)
    assert result.executed is True


def test_initiator_cannot_approve(tpi: TwoPersonIntegrity) -> None:
    req = tpi.submit("deploy", "alice", "Deploy v2")
    r = tpi.approve(req.request_id, "alice", ActionRole.APPROVER_1)
    assert r.success is False
    assert "initiator" in r.message.lower()


def test_duplicate_approver_rejected(tpi: TwoPersonIntegrity) -> None:
    req = tpi.submit("deploy", "alice", "Deploy v3")
    tpi.approve(req.request_id, "bob", ActionRole.APPROVER_1)
    r = tpi.approve(req.request_id, "bob", ActionRole.APPROVER_2)
    assert r.success is False
    assert "already" in r.message.lower()


def test_deny_stops_request(tpi: TwoPersonIntegrity) -> None:
    req = tpi.submit("deploy", "alice", "Deploy v4")
    r = tpi.approve(req.request_id, "bob", ActionRole.APPROVER_1, decision="deny")
    assert r.request_status == RequestStatus.DENIED

    result = tpi.execute(req.request_id)
    assert result.executed is False


def test_cannot_execute_pending(tpi: TwoPersonIntegrity) -> None:
    req = tpi.submit("deploy", "alice", "Deploy v5")
    tpi.approve(req.request_id, "bob", ActionRole.APPROVER_1)
    # Only 1 of 2 approvals
    result = tpi.execute(req.request_id)
    assert result.executed is False


def test_expired_request(tpi: TwoPersonIntegrity) -> None:
    tpi.register_action_type(
        "fast_expire",
        required_roles=[ActionRole.APPROVER_1],
        min_approvers=1,
        expiry_hours=0.0001,  # ~0.36 seconds
    )
    req = tpi.submit("fast_expire", "alice", "Quick")
    time.sleep(0.5)
    r = tpi.approve(req.request_id, "bob", ActionRole.APPROVER_1)
    assert r.request_status == RequestStatus.EXPIRED


def test_audit_trail(tpi: TwoPersonIntegrity) -> None:
    req = tpi.submit("deploy", "alice", "Audit test")
    tpi.approve(req.request_id, "bob", ActionRole.APPROVER_1)
    trail = tpi.get_audit_trail(req.request_id)
    assert len(trail) >= 2  # submit + approve
    assert trail[0]["event"] == "submit"


def test_unknown_action_type(tpi: TwoPersonIntegrity) -> None:
    with pytest.raises(ValueError, match="Unknown action type"):
        tpi.submit("nonexistent", "alice", "Nope")


def test_get_request(tpi: TwoPersonIntegrity) -> None:
    req = tpi.submit("deploy", "alice", "Get test")
    loaded = tpi.get_request(req.request_id)
    assert loaded.request_id == req.request_id
    assert loaded.initiator_id == "alice"
