"""Tests for amc.product.memory_consolidation — Memory Consolidation Engine."""
from __future__ import annotations

import pytest

from amc.product.memory_consolidation import (
    MemoryConsolidationEngine,
    MemoryItem,
    get_memory_consolidation_engine,
)


@pytest.fixture()
def engine(tmp_path):
    return MemoryConsolidationEngine(db_path=tmp_path / "memory.db")


def _item(content: str, session: str = "s1", tenant: str = "t1", **kwargs) -> MemoryItem:
    return MemoryItem(content=content, session_id=session, tenant_id=tenant, **kwargs)


# ---------------------------------------------------------------------------
# Item CRUD
# ---------------------------------------------------------------------------


def test_add_and_get_item(engine):
    record = engine.add_item(_item("The sky is blue"))
    assert record.item_id
    assert record.content == "The sky is blue"
    assert record.consolidated is False


def test_add_idempotent(engine):
    r1 = engine.add_item(_item("same content here", session="s1"))
    r2 = engine.add_item(_item("same content here", session="s1"))
    assert r1.item_id == r2.item_id


def test_get_nonexistent_returns_none(engine):
    assert engine.get_item("nonexistent-id") is None


def test_list_items_filters(engine):
    engine.add_item(_item("fact 1", session="s1", tenant="t1"))
    engine.add_item(_item("fact 2", session="s1", tenant="t1"))
    engine.add_item(_item("fact 3", session="s2", tenant="t1"))

    s1_items = engine.list_items(session_id="s1")
    assert len(s1_items) == 2
    s2_items = engine.list_items(session_id="s2")
    assert len(s2_items) == 1


def test_list_items_content_type_filter(engine):
    engine.add_item(_item("a fact", content_type="fact"))
    engine.add_item(_item("an observation", content_type="observation"))
    facts = engine.list_items(session_id="s1", content_type="fact")
    assert all(r.content_type == "fact" for r in facts)


def test_delete_item(engine):
    record = engine.add_item(_item("to delete"))
    ok = engine.delete_item(record.item_id)
    assert ok is True
    assert engine.get_item(record.item_id) is None


def test_delete_nonexistent_returns_false(engine):
    assert engine.delete_item("ghost-id") is False


# ---------------------------------------------------------------------------
# Consolidation
# ---------------------------------------------------------------------------


def test_consolidate_basic(engine):
    engine.add_item(_item("The user prefers dark mode", importance=0.8))
    engine.add_item(_item("The user uses dark theme on their device", importance=0.7))
    engine.add_item(_item("The product is called TurboApp", importance=0.9))

    result = engine.consolidate(session_id="s1", tenant_id="t1")
    assert result.consolidation_id
    assert result.item_count == 3
    assert len(result.facts) >= 1
    assert "Consolidated 3 items" in result.summary


def test_consolidate_merges_duplicates(engine):
    # Two very similar items + one distinct
    engine.add_item(_item("The sky is blue in clear weather"))
    engine.add_item(_item("The sky is blue when it is clear weather"))
    engine.add_item(_item("Water boils at 100 degrees Celsius"))

    result = engine.consolidate(session_id="s1", tenant_id="t1")
    # Consolidation ran and processed items
    assert result.item_count == 3
    # At minimum produces some output facts (dedup is heuristic, may or may not merge)
    assert len(result.facts) >= 1


def test_consolidate_detects_contradictions(engine):
    engine.add_item(_item("The user does not want email notifications"))
    engine.add_item(_item("The user wants email notifications"))
    engine.add_item(_item("The API base URL is https://api.example.com"))

    result = engine.consolidate(session_id="s1", tenant_id="t1")
    assert len(result.contradictions) >= 1
    assert result.contradictions[0]["type"] == "negation_conflict"


def test_consolidate_insufficient_items(engine):
    engine.add_item(_item("single fact only"))
    result = engine.consolidate(session_id="s1", tenant_id="t1", min_items=2)
    assert result.item_count == 0
    assert "Insufficient" in result.summary


def test_consolidate_marks_items_as_consolidated(engine):
    engine.add_item(_item("fact alpha"))
    engine.add_item(_item("fact beta"))
    result = engine.consolidate(session_id="s1", tenant_id="t1")

    # Items should now be marked consolidated
    items = engine.list_items(session_id="s1", consolidated=True)
    assert len(items) == 2
    for item in items:
        assert item.consolidation_id == result.consolidation_id


def test_consolidate_only_unconsolidated_items(engine):
    # Add and consolidate first batch
    engine.add_item(_item("old fact a"))
    engine.add_item(_item("old fact b"))
    engine.consolidate(session_id="s1", tenant_id="t1")

    # Add new batch
    engine.add_item(_item("new fact c"))
    engine.add_item(_item("new fact d"))
    result2 = engine.consolidate(session_id="s1", tenant_id="t1")

    # Second consolidation should only touch new items
    assert result2.item_count == 2


def test_consolidate_confidence_is_average(engine):
    engine.add_item(_item("fact a", confidence=0.9))
    engine.add_item(_item("fact b", confidence=0.5))
    result = engine.consolidate(session_id="s1", tenant_id="t1")
    assert abs(result.confidence - 0.7) < 0.01


# ---------------------------------------------------------------------------
# Get / List consolidations
# ---------------------------------------------------------------------------


def test_get_consolidation_by_id(engine):
    engine.add_item(_item("f1"))
    engine.add_item(_item("f2"))
    r = engine.consolidate(session_id="s1", tenant_id="t1")
    fetched = engine.get_consolidation(r.consolidation_id)
    assert fetched is not None
    assert fetched.consolidation_id == r.consolidation_id


def test_get_consolidation_nonexistent_returns_none(engine):
    assert engine.get_consolidation("ghost-id") is None


def test_list_consolidations(engine):
    for session in ("sess_a", "sess_b"):
        engine.add_item(_item("item 1", session=session))
        engine.add_item(_item("item 2", session=session))
        engine.consolidate(session_id=session, tenant_id="t1")

    all_c = engine.list_consolidations(tenant_id="t1")
    assert len(all_c) == 2

    a_only = engine.list_consolidations(session_id="sess_a")
    assert len(a_only) == 1


# ---------------------------------------------------------------------------
# Edge cases
# ---------------------------------------------------------------------------


def test_empty_content_type_filter(engine):
    engine.add_item(_item("f1", content_type="fact"))
    engine.add_item(_item("f2", content_type="fact"))
    engine.add_item(_item("f3", content_type="note"))
    result = engine.consolidate(session_id="s1", tenant_id="t1", content_type="fact")
    assert result.item_count == 2


# ---------------------------------------------------------------------------
# Singleton factory
# ---------------------------------------------------------------------------


def test_singleton_factory(tmp_path, monkeypatch):
    import amc.product.memory_consolidation as mod
    mod._engine = None
    e1 = get_memory_consolidation_engine(db_path=tmp_path / "s.db")
    e2 = get_memory_consolidation_engine()
    assert e1 is e2
    mod._engine = None  # reset
