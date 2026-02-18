"""Tests for amc.product.context_pack — Context Pack Generator (Feature #31)."""
from __future__ import annotations

import pytest

from amc.product.context_pack import (
    ContextPackGenerator,
    ContextPackInput,
    ContextSource,
    get_context_pack_generator,
)


@pytest.fixture()
def gen(tmp_path):
    return ContextPackGenerator(db_path=tmp_path / "ctx.db")


def _make_source(sid, title, content, rel=1.0, stype="doc"):
    return ContextSource(
        source_type=stype,
        source_id=sid,
        title=title,
        content=content,
        relevance_score=rel,
    )


# ---------------------------------------------------------------------------
# Build
# ---------------------------------------------------------------------------

def test_build_basic(gen):
    sources = [
        _make_source("doc-1", "Proposal Draft", "This is the proposal for Q1 expansion."),
        _make_source("crm-1", "Deal Record", "Deal value: $50,000. Contact: Alice.", stype="crm"),
    ]
    inp = ContextPackInput(
        tenant_id="t1",
        task_type="proposal",
        task_ref="deal-42",
        sources=sources,
        token_budget=500,
    )
    record = gen.build(inp)

    assert record.pack_id
    assert record.tenant_id == "t1"
    assert record.task_type == "proposal"
    assert record.task_ref == "deal-42"
    assert len(record.snippets) > 0
    assert record.token_estimate > 0
    assert "proposal" in record.summary.lower()


def test_build_respects_token_budget(gen):
    long_content = "word " * 5000
    sources = [
        _make_source("doc-a", "Long Doc", long_content),
        _make_source("doc-b", "Short Doc", "Short content here."),
    ]
    inp = ContextPackInput(
        tenant_id="t1",
        task_type="review",
        sources=sources,
        token_budget=100,
    )
    record = gen.build(inp)
    assert record.token_estimate <= record.token_budget + 50  # small tolerance


def test_build_with_keywords(gen):
    sources = [
        _make_source("d1", "Finance Doc", "Revenue grew 20%. Total ARR is $2M."),
        _make_source("d2", "HR Doc", "Employee count increased to 50 staff members."),
    ]
    inp = ContextPackInput(
        tenant_id="t1",
        task_type="finance-review",
        sources=sources,
        keywords=["ARR", "revenue"],
        token_budget=500,
    )
    record = gen.build(inp)
    # The finance doc should be preferred (higher relevance due to keyword hits)
    snippets = record.snippets
    assert any("Revenue" in s["text"] or "ARR" in s["text"] for s in snippets)


def test_build_empty_sources(gen):
    inp = ContextPackInput(
        tenant_id="t1",
        task_type="empty",
        sources=[],
        token_budget=1000,
    )
    record = gen.build(inp)
    assert record.pack_id
    assert len(record.snippets) == 0
    assert "Empty" in record.summary


def test_build_filters_empty_content(gen):
    sources = [
        _make_source("d1", "Empty Doc", "   "),
        _make_source("d2", "Real Doc", "This has real content."),
    ]
    inp = ContextPackInput(tenant_id="t1", task_type="t", sources=sources, token_budget=500)
    record = gen.build(inp)
    assert all(s["text"].strip() for s in record.snippets)


# ---------------------------------------------------------------------------
# Get / List / Delete
# ---------------------------------------------------------------------------

def test_get_by_id(gen):
    inp = ContextPackInput(
        tenant_id="t1",
        task_type="summary",
        sources=[_make_source("d1", "Doc", "Content here.")],
        token_budget=200,
    )
    created = gen.build(inp)
    fetched = gen.get(created.pack_id)
    assert fetched is not None
    assert fetched.pack_id == created.pack_id


def test_get_nonexistent(gen):
    assert gen.get("no-such-id") is None


def test_list_by_tenant(gen):
    gen.build(ContextPackInput(tenant_id="t1", task_type="a", sources=[], token_budget=100))
    gen.build(ContextPackInput(tenant_id="t1", task_type="b", sources=[], token_budget=100))
    gen.build(ContextPackInput(tenant_id="t2", task_type="c", sources=[], token_budget=100))

    packs = gen.list_packs("t1")
    assert len(packs) == 2


def test_list_filter_by_task_type(gen):
    gen.build(ContextPackInput(tenant_id="t1", task_type="proposal", sources=[], token_budget=100))
    gen.build(ContextPackInput(tenant_id="t1", task_type="review", sources=[], token_budget=100))

    packs = gen.list_packs("t1", task_type="proposal")
    assert len(packs) == 1
    assert packs[0].task_type == "proposal"


def test_list_filter_by_task_ref(gen):
    gen.build(ContextPackInput(tenant_id="t1", task_type="t", task_ref="ref-1", sources=[], token_budget=100))
    gen.build(ContextPackInput(tenant_id="t1", task_type="t", task_ref="ref-2", sources=[], token_budget=100))

    packs = gen.list_packs("t1", task_ref="ref-1")
    assert len(packs) == 1
    assert packs[0].task_ref == "ref-1"


def test_delete(gen):
    record = gen.build(ContextPackInput(tenant_id="t1", task_type="del", sources=[], token_budget=100))
    assert gen.delete(record.pack_id) is True
    assert gen.get(record.pack_id) is None


def test_delete_nonexistent(gen):
    assert gen.delete("bad-id") is False


# ---------------------------------------------------------------------------
# Source types
# ---------------------------------------------------------------------------

def test_custom_source_type_coercion(gen):
    """Unknown source types should be mapped to 'custom'."""
    src = ContextSource(
        source_type="unknown_type",
        source_id="u1",
        title="Unknown",
        content="Some content here.",
        relevance_score=1.0,
    )
    inp = ContextPackInput(tenant_id="t1", task_type="t", sources=[src], token_budget=200)
    record = gen.build(inp)
    assert record.pack_id


# ---------------------------------------------------------------------------
# Singleton
# ---------------------------------------------------------------------------

def test_singleton_factory(tmp_path):
    import amc.product.context_pack as mod
    mod._generator = None
    g1 = get_context_pack_generator(db_path=tmp_path / "c.db")
    g2 = get_context_pack_generator()
    assert g1 is g2
    mod._generator = None
