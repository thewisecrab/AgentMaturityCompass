"""Tests for amc.product.scratchpad — Working Memory Scratchpad Manager."""
from __future__ import annotations

import time

import pytest

from amc.product.scratchpad import (
    Lifecycle,
    ScratchEntry,
    ScratchpadManager,
    get_scratchpad_manager,
)


@pytest.fixture()
def mgr(tmp_path):
    return ScratchpadManager(db_path=tmp_path / "scratchpad.db")


def _entry(
    key: str,
    value,
    session: str = "sess1",
    lifecycle: Lifecycle = Lifecycle.KEEP,
    ttl: int | None = None,
    tags: list[str] | None = None,
) -> ScratchEntry:
    return ScratchEntry(
        session_id=session,
        key=key,
        value=value,
        lifecycle=lifecycle,
        ttl_seconds=ttl,
        tags=tags or [],
    )


# ---------------------------------------------------------------------------
# Basic set / get
# ---------------------------------------------------------------------------


def test_set_and_get(mgr):
    record = mgr.set(_entry("user_goal", "Build a dashboard"))
    assert record.entry_id
    assert record.key == "user_goal"
    assert record.value == "Build a dashboard"
    assert record.lifecycle == Lifecycle.KEEP.value


def test_set_upsert(mgr):
    mgr.set(_entry("color", "red"))
    updated = mgr.set(_entry("color", "blue"))
    assert updated.value == "blue"

    fetched = mgr.get("sess1", "color")
    assert fetched is not None
    assert fetched.value == "blue"


def test_get_nonexistent_returns_none(mgr):
    assert mgr.get("sess1", "ghost_key") is None


def test_session_isolation(mgr):
    mgr.set(_entry("k", "session-a", session="sess_a"))
    mgr.set(_entry("k", "session-b", session="sess_b"))

    a = mgr.get("sess_a", "k")
    b = mgr.get("sess_b", "k")
    assert a is not None and a.value == "session-a"
    assert b is not None and b.value == "session-b"


def test_value_types_preserved(mgr):
    mgr.set(_entry("list_key", [1, 2, 3]))
    mgr.set(_entry("dict_key", {"nested": True}))
    mgr.set(_entry("int_key", 42))
    mgr.set(_entry("bool_key", False))

    assert mgr.get("sess1", "list_key").value == [1, 2, 3]
    assert mgr.get("sess1", "dict_key").value == {"nested": True}
    assert mgr.get("sess1", "int_key").value == 42
    assert mgr.get("sess1", "bool_key").value is False


# ---------------------------------------------------------------------------
# TTL / expiry
# ---------------------------------------------------------------------------


def test_expired_entry_not_returned(mgr):
    mgr.set(_entry("ephemeral", "quick", ttl=1))
    time.sleep(1.1)
    assert mgr.get("sess1", "ephemeral") is None


def test_non_expired_entry_returned(mgr):
    mgr.set(_entry("valid", "still here", ttl=60))
    record = mgr.get("sess1", "valid")
    assert record is not None
    assert record.is_expired is False


def test_is_expired_property(mgr):
    record = mgr.set(_entry("will_expire", "v", ttl=1))
    time.sleep(1.1)
    assert record.is_expired is True


def test_purge_expired(mgr):
    mgr.set(_entry("e1", "x", ttl=1, session="sess_p"))
    mgr.set(_entry("e2", "y", ttl=1, session="sess_p"))
    mgr.set(_entry("e3", "z", ttl=3600, session="sess_p"))
    time.sleep(1.1)
    purged = mgr.purge_expired()
    assert purged == 2
    assert mgr.get("sess_p", "e3") is not None


# ---------------------------------------------------------------------------
# List
# ---------------------------------------------------------------------------


def test_list_session(mgr):
    mgr.set(_entry("a", 1))
    mgr.set(_entry("b", 2))
    mgr.set(_entry("c", 3, session="other"))

    records = mgr.list_session("sess1")
    assert len(records) == 2


def test_list_session_lifecycle_filter(mgr):
    mgr.set(_entry("k1", "v", lifecycle=Lifecycle.KEEP))
    mgr.set(_entry("k2", "v", lifecycle=Lifecycle.DISCARD))
    mgr.set(_entry("k3", "v", lifecycle=Lifecycle.PROMOTE))

    keeps = mgr.list_session("sess1", lifecycle=Lifecycle.KEEP)
    assert len(keeps) == 1 and keeps[0].key == "k1"


def test_list_session_tag_filter(mgr):
    mgr.set(_entry("tagged", "v", tags=["important", "context"]))
    mgr.set(_entry("untagged", "v"))

    tagged = mgr.list_session("sess1", tag="important")
    assert len(tagged) == 1
    assert tagged[0].key == "tagged"


def test_list_session_excludes_expired_by_default(mgr):
    mgr.set(_entry("expired_key", "v", ttl=1))
    time.sleep(1.1)
    records = mgr.list_session("sess1")
    keys = {r.key for r in records}
    assert "expired_key" not in keys


def test_list_session_include_expired_flag(mgr):
    mgr.set(_entry("expired_key2", "v", ttl=1))
    time.sleep(1.1)
    records = mgr.list_session("sess1", include_expired=True)
    keys = {r.key for r in records}
    assert "expired_key2" in keys


# ---------------------------------------------------------------------------
# Delete / clear
# ---------------------------------------------------------------------------


def test_delete_entry(mgr):
    mgr.set(_entry("del_me", "v"))
    ok = mgr.delete("sess1", "del_me")
    assert ok is True
    assert mgr.get("sess1", "del_me") is None


def test_delete_nonexistent_returns_false(mgr):
    assert mgr.delete("sess1", "ghost") is False


def test_clear_session(mgr):
    mgr.set(_entry("x1", "a"))
    mgr.set(_entry("x2", "b"))
    mgr.set(_entry("x3", "c", session="other"))

    count = mgr.clear_session("sess1")
    assert count == 2
    assert mgr.list_session("sess1") == []
    assert mgr.list_session("other") != []


def test_clear_session_lifecycle_scoped(mgr):
    mgr.set(_entry("keep_this", "k", lifecycle=Lifecycle.KEEP))
    mgr.set(_entry("discard_this", "d", lifecycle=Lifecycle.DISCARD))

    count = mgr.clear_session("sess1", lifecycle=Lifecycle.DISCARD)
    assert count == 1
    assert mgr.get("sess1", "keep_this") is not None


# ---------------------------------------------------------------------------
# Lifecycle sweep
# ---------------------------------------------------------------------------


def test_sweep_discards_discard_lifecycle(mgr):
    mgr.set(_entry("d_key", "v", lifecycle=Lifecycle.DISCARD))
    mgr.set(_entry("k_key", "v", lifecycle=Lifecycle.KEEP))

    result = mgr.sweep_session("sess1")
    assert "d_key" in result.discarded_keys
    assert result.kept == 1
    assert mgr.get("sess1", "d_key") is None


def test_sweep_promotes_promote_lifecycle(mgr):
    mgr.set(_entry("p_key", "v", lifecycle=Lifecycle.PROMOTE))
    result = mgr.sweep_session("sess1")
    assert "p_key" in result.promoted_keys

    # After sweep the entry should still exist but lifecycle=keep
    record = mgr.get("sess1", "p_key")
    assert record is not None
    assert record.lifecycle == Lifecycle.KEEP.value
    assert record.promoted_to == "promoted"


def test_sweep_discards_expired_entries(mgr):
    mgr.set(_entry("exp_key", "v", ttl=1))
    time.sleep(1.1)
    result = mgr.sweep_session("sess1")
    assert result.expired_discarded >= 1
    assert "exp_key" in result.discarded_keys


def test_sweep_result_totals(mgr):
    mgr.set(_entry("a", "v", lifecycle=Lifecycle.KEEP))
    mgr.set(_entry("b", "v", lifecycle=Lifecycle.DISCARD))
    mgr.set(_entry("c", "v", lifecycle=Lifecycle.PROMOTE))

    result = mgr.sweep_session("sess1")
    assert result.total_entries == 3
    assert result.kept == 2       # keep + promoted→keep
    assert result.promoted == 1


# ---------------------------------------------------------------------------
# Promoted entries
# ---------------------------------------------------------------------------


def test_get_promoted(mgr):
    mgr.set(_entry("pr1", "v", lifecycle=Lifecycle.PROMOTE))
    mgr.set(_entry("pr2", "v", lifecycle=Lifecycle.KEEP))
    mgr.sweep_session("sess1")

    promoted = mgr.get_promoted("sess1")
    keys = {r.key for r in promoted}
    assert "pr1" in keys
    assert "pr2" not in keys


# ---------------------------------------------------------------------------
# Singleton factory
# ---------------------------------------------------------------------------


def test_singleton_factory(tmp_path, monkeypatch):
    import amc.product.scratchpad as mod
    mod._manager = None
    m1 = get_scratchpad_manager(db_path=tmp_path / "s.db")
    m2 = get_scratchpad_manager()
    assert m1 is m2
    mod._manager = None  # reset
