"""Tests for amc.product.tool_discovery — Natural Language Tool Discovery."""
from __future__ import annotations

import pytest

from amc.product.tool_discovery import (
    ToolDiscoveryEngine,
    ToolRegistration,
    get_tool_discovery_engine,
)


@pytest.fixture()
def engine(tmp_path):
    return ToolDiscoveryEngine(db_path=tmp_path / "discovery.db")


def _reg(name: str, desc: str, caps: list[str] | None = None, tags: list[str] | None = None, category: str = "general") -> ToolRegistration:
    return ToolRegistration(
        tool_name=name,
        description=desc,
        capabilities=caps or [],
        tags=tags or [],
        category=category,
    )


# ---------------------------------------------------------------------------
# Registry CRUD
# ---------------------------------------------------------------------------


def test_register_and_get(engine):
    reg = _reg("web_fetch", "Fetch content from a URL", caps=["http", "fetch", "scrape"])
    record = engine.register_tool(reg)
    assert record.tool_id
    assert record.tool_name == "web_fetch"
    assert "http" in record.capabilities
    assert record.active is True


def test_register_idempotent_update(engine):
    engine.register_tool(_reg("my_tool", "version 1"))
    updated = engine.register_tool(_reg("my_tool", "version 2", caps=["extra"]))
    assert updated.description == "version 2"
    assert "extra" in updated.capabilities


def test_get_by_name(engine):
    engine.register_tool(_reg("named_tool", "desc"))
    record = engine.get_tool_by_name("named_tool")
    assert record is not None
    assert record.tool_name == "named_tool"


def test_get_nonexistent_returns_none(engine):
    assert engine.get_tool("nonexistent-id") is None


def test_list_tools(engine):
    engine.register_tool(_reg("t1", "d1", category="search"))
    engine.register_tool(_reg("t2", "d2", category="write"))
    engine.register_tool(_reg("t3", "d3", category="search"))

    all_tools = engine.list_tools()
    assert len(all_tools) >= 3

    search_only = engine.list_tools(category="search")
    assert all(t.category == "search" for t in search_only)
    assert len(search_only) == 2


def test_deactivate_removes_from_active_list(engine):
    record = engine.register_tool(_reg("deact_tool", "d"))
    engine.deactivate_tool(record.tool_id)

    active = engine.list_tools(active_only=True)
    names = {t.tool_name for t in active}
    assert "deact_tool" not in names

    all_tools = engine.list_tools(active_only=False)
    names_all = {t.tool_name for t in all_tools}
    assert "deact_tool" in names_all


# ---------------------------------------------------------------------------
# Discovery / semantic search
# ---------------------------------------------------------------------------


def test_discover_basic_relevance(engine):
    engine.register_tool(_reg("browser_control", "Control a web browser, navigate pages, click elements",
                               caps=["browser", "navigate", "click"]))
    engine.register_tool(_reg("file_writer", "Write content to a file on disk",
                               caps=["file", "write", "disk"]))
    engine.register_tool(_reg("email_sender", "Send emails via SMTP",
                               caps=["email", "smtp", "send"]))

    results = engine.discover("I want to navigate to a web page and click a button", top_k=3)
    assert len(results) >= 1
    # browser_control should rank first
    assert results[0].tool_name == "browser_control"


def test_discover_empty_registry(engine):
    results = engine.discover("search the web")
    assert results == []


def test_discover_respects_top_k(engine):
    for i in range(10):
        engine.register_tool(_reg(f"tool_{i}", f"description for tool {i}"))
    results = engine.discover("tool description generic", top_k=3)
    assert len(results) <= 3


def test_discover_ranks_assigned(engine):
    engine.register_tool(_reg("alpha", "alpha description", caps=["alpha"]))
    engine.register_tool(_reg("beta", "beta description", caps=["beta"]))
    results = engine.discover("alpha capability", top_k=5)
    for i, r in enumerate(results, start=1):
        assert r.rank == i


def test_discover_category_filter(engine):
    engine.register_tool(_reg("cat_a1", "cat a tool 1", category="cat_a"))
    engine.register_tool(_reg("cat_b1", "cat b tool 1", category="cat_b"))
    results = engine.discover("tool", top_k=10, category="cat_a")
    assert all(r.category == "cat_a" for r in results)


def test_discover_min_success_rate_filter(engine):
    record = engine.register_tool(_reg("unreliable", "always fails", caps=["fail"]))
    # Record many failures
    for _ in range(5):
        engine.record_usage(record.tool_id, succeeded=False)

    # Tool with failure rate 100% should be excluded when min_success_rate=0.5
    results = engine.discover("fail", top_k=5, min_success_rate=0.5)
    names = {r.tool_name for r in results}
    assert "unreliable" not in names


# ---------------------------------------------------------------------------
# Usage history
# ---------------------------------------------------------------------------


def test_record_usage_returns_id(engine):
    rec = engine.register_tool(_reg("usage_tool", "d"))
    hid = engine.record_usage(rec.tool_id, session_id="s1", succeeded=True)
    assert hid


def test_history_boosts_success_rate_in_discover(engine):
    r1 = engine.register_tool(_reg("good_tool", "reliable search tool", caps=["search", "reliable"]))
    r2 = engine.register_tool(_reg("bad_tool", "search tool sometimes fails", caps=["search"]))

    # good_tool: 10 successes
    for _ in range(10):
        engine.record_usage(r1.tool_id, succeeded=True)
    # bad_tool: 8 failures, 2 successes
    for _ in range(8):
        engine.record_usage(r2.tool_id, succeeded=False)
    for _ in range(2):
        engine.record_usage(r2.tool_id, succeeded=True)

    results = engine.discover("search reliable tool", top_k=5)
    names = [r.tool_name for r in results]
    assert names.index("good_tool") < names.index("bad_tool")


# ---------------------------------------------------------------------------
# Singleton factory
# ---------------------------------------------------------------------------


def test_singleton_factory(tmp_path, monkeypatch):
    import amc.product.tool_discovery as mod
    mod._engine = None
    e1 = get_tool_discovery_engine(db_path=tmp_path / "s.db")
    e2 = get_tool_discovery_engine()
    assert e1 is e2
    mod._engine = None  # reset
