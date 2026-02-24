"""Tests for amc.product.glossary — Domain Glossary + Terminology Enforcer (Feature #29)."""
from __future__ import annotations

import pytest

from amc.product.glossary import (
    GlossaryManager,
    TermInput,
    get_glossary_manager,
)


@pytest.fixture()
def mgr(tmp_path):
    return GlossaryManager(db_path=tmp_path / "glossary.db")


# ---------------------------------------------------------------------------
# CRUD
# ---------------------------------------------------------------------------

def test_register_and_get(mgr):
    inp = TermInput(
        tenant_id="t1",
        canonical="Machine Learning",
        variants=["ML", "machine learning", "machine-learning"],
        definition="A subset of AI",
        domain="tech",
        severity="warning",
    )
    record = mgr.register(inp)

    assert record.term_id
    assert record.canonical == "Machine Learning"
    assert "ML" in record.variants
    assert record.domain == "tech"
    assert record.active is True


def test_register_upserts_on_canonical_conflict(mgr):
    inp = TermInput(tenant_id="t1", canonical="API", variants=["api"], definition="First")
    first = mgr.register(inp)

    inp2 = TermInput(tenant_id="t1", canonical="API", variants=["api", "A.P.I."], definition="Updated")
    second = mgr.register(inp2)

    assert first.term_id == second.term_id
    assert second.definition == "Updated"
    assert "A.P.I." in second.variants


def test_get_nonexistent(mgr):
    assert mgr.get("no-such-id") is None


def test_list_terms_filtered(mgr):
    mgr.register(TermInput(tenant_id="t1", canonical="Invoice", domain="finance"))
    mgr.register(TermInput(tenant_id="t1", canonical="API", domain="tech"))
    mgr.register(TermInput(tenant_id="t2", canonical="Other", domain="finance"))

    finance = mgr.list_terms("t1", domain="finance")
    assert len(finance) == 1
    assert finance[0].canonical == "Invoice"


def test_delete_soft(mgr):
    rec = mgr.register(TermInput(tenant_id="t1", canonical="ToDelete"))
    assert mgr.delete(rec.term_id) is True
    deleted = mgr.get(rec.term_id)
    assert deleted is not None
    assert deleted.active is False

    active = mgr.list_terms("t1", active_only=True)
    assert not any(t.canonical == "ToDelete" for t in active)


def test_invalid_severity(mgr):
    with pytest.raises(ValueError, match="Invalid severity"):
        mgr.register(TermInput(tenant_id="t1", canonical="X", severity="critical"))


# ---------------------------------------------------------------------------
# Enforcement
# ---------------------------------------------------------------------------

def test_enforce_detects_variant(mgr):
    mgr.register(TermInput(
        tenant_id="t1",
        canonical="Application Programming Interface",
        variants=["api", "API", "a.p.i."],
        severity="warning",
    ))
    # Use a variant that is not the canonical
    result = mgr.enforce("Please use the api endpoint.", "t1")
    assert result.violation_count >= 1
    assert any(v.found_variant.lower() == "api" for v in result.violations)


def test_enforce_auto_correct(mgr):
    mgr.register(TermInput(
        tenant_id="t1",
        canonical="Artificial Intelligence",
        variants=["A.I.", "AI", "Artificial intelligence"],
        severity="warning",
    ))
    result = mgr.enforce("We use AI and A.I. daily.", "t1", auto_correct=True)
    assert "Artificial Intelligence" in result.corrected_text


def test_enforce_no_correction_when_disabled(mgr):
    mgr.register(TermInput(
        tenant_id="t1",
        canonical="Artificial Intelligence",
        variants=["AI"],
        severity="warning",
    ))
    result = mgr.enforce("We use AI daily.", "t1", auto_correct=False)
    # Violations found but text unchanged
    assert result.violation_count > 0
    assert "AI" in result.corrected_text  # original text preserved


def test_enforce_canonical_not_flagged(mgr):
    """Using the canonical term should not produce violations."""
    mgr.register(TermInput(
        tenant_id="t1",
        canonical="Machine Learning",
        variants=["ML", "machine-learning"],
    ))
    result = mgr.enforce("We use Machine Learning extensively.", "t1")
    # Canonical is not a variant → no violations
    assert all(v.canonical != v.found_variant for v in result.violations)


def test_enforce_counts_by_severity(mgr):
    mgr.register(TermInput(
        tenant_id="t1", canonical="CanonA", variants=["varA"], severity="error"
    ))
    mgr.register(TermInput(
        tenant_id="t1", canonical="CanonB", variants=["varB"], severity="warning"
    ))
    result = mgr.enforce("Found varA and varB here.", "t1")
    assert result.error_count >= 1
    assert result.warning_count >= 1


def test_enforce_empty_text(mgr):
    result = mgr.enforce("", "t1")
    assert result.violation_count == 0
    assert result.corrected_text == ""


def test_enforce_no_terms_registered(mgr):
    result = mgr.enforce("Some random text here.", "t99")
    assert result.violation_count == 0


# ---------------------------------------------------------------------------
# Singleton
# ---------------------------------------------------------------------------

def test_singleton_factory(tmp_path):
    import amc.product.glossary as mod
    mod._manager = None
    m1 = get_glossary_manager(db_path=tmp_path / "g.db")
    m2 = get_glossary_manager()
    assert m1 is m2
    mod._manager = None
