"""Tests for amc.product.persona — Preference & Persona Manager (Feature #27)."""
from __future__ import annotations

import pytest

from amc.product.persona import (
    PersonaInput,
    PersonaManager,
    apply_persona,
    get_persona_manager,
)


@pytest.fixture()
def mgr(tmp_path):
    return PersonaManager(db_path=tmp_path / "persona.db")


# ---------------------------------------------------------------------------
# CRUD
# ---------------------------------------------------------------------------

def test_create_and_get(mgr):
    inp = PersonaInput(
        tenant_id="tenant-1",
        name="Default",
        tone="professional",
        style="concise",
        brand_voice="Bold and clear",
        forbidden_words=["utilize", "synergy"],
        preferred_words={"utilize": "use", "synergy": "collaboration"},
        signature="Best,\nAMC Team",
        metadata={"market": "SMB"},
    )
    record = mgr.create(inp)

    assert record.persona_id
    assert record.tenant_id == "tenant-1"
    assert record.name == "Default"
    assert record.tone == "professional"
    assert record.style == "concise"
    assert "utilize" in record.forbidden_words
    assert record.preferred_words["utilize"] == "use"
    assert record.active is True


def test_create_duplicate_raises(mgr):
    inp = PersonaInput(tenant_id="t1", name="Dup")
    mgr.create(inp)
    with pytest.raises(ValueError, match="already exists"):
        mgr.create(inp)


def test_get_nonexistent_returns_none(mgr):
    assert mgr.get("nonexistent-id") is None


def test_get_by_name(mgr):
    inp = PersonaInput(tenant_id="t1", name="ByName")
    created = mgr.create(inp)
    fetched = mgr.get_by_name("t1", "ByName")
    assert fetched is not None
    assert fetched.persona_id == created.persona_id


def test_list_for_tenant(mgr):
    mgr.create(PersonaInput(tenant_id="t2", name="A"))
    mgr.create(PersonaInput(tenant_id="t2", name="B"))
    mgr.create(PersonaInput(tenant_id="t3", name="C"))

    result = mgr.list_for_tenant("t2")
    assert len(result) == 2
    names = {r.name for r in result}
    assert names == {"A", "B"}


def test_update(mgr):
    rec = mgr.create(PersonaInput(tenant_id="t1", name="Upd", tone="casual"))
    updated = mgr.update(rec.persona_id, {"tone": "formal", "signature": "Regards"})
    assert updated.tone == "formal"
    assert updated.signature == "Regards"


def test_update_nonexistent_raises(mgr):
    with pytest.raises(KeyError):
        mgr.update("bad-id", {"tone": "formal"})


def test_delete_soft(mgr):
    rec = mgr.create(PersonaInput(tenant_id="t1", name="ToDelete"))
    assert mgr.delete(rec.persona_id) is True
    fetched = mgr.get(rec.persona_id)
    assert fetched is not None
    assert fetched.active is False


def test_list_active_only(mgr):
    rec = mgr.create(PersonaInput(tenant_id="t1", name="Active"))
    mgr.create(PersonaInput(tenant_id="t1", name="InactiveP"))
    to_del = mgr.get_by_name("t1", "InactiveP")
    mgr.delete(to_del.persona_id)  # type: ignore[union-attr]

    active = mgr.list_for_tenant("t1", active_only=True)
    names = {r.name for r in active}
    assert "Active" in names
    assert "InactiveP" not in names


# ---------------------------------------------------------------------------
# Persona application
# ---------------------------------------------------------------------------

def test_apply_preferred_words(mgr):
    rec = mgr.create(PersonaInput(
        tenant_id="t1",
        name="Apply",
        preferred_words={"utilize": "use", "leverage": "use"},
        forbidden_words=[],
    ))
    result = mgr.apply("Please utilize and leverage the tool.", rec.persona_id)
    assert "use" in result.transformed
    assert "utilize" not in result.transformed
    assert len(result.replacements_made) == 2


def test_apply_forbidden_words_flagged(mgr):
    rec = mgr.create(PersonaInput(
        tenant_id="t1",
        name="Forbidden",
        forbidden_words=["synergy"],
    ))
    result = mgr.apply("We need great synergy here.", rec.persona_id)
    assert "synergy" in result.forbidden_hits


def test_apply_signature_appended(mgr):
    rec = mgr.create(PersonaInput(
        tenant_id="t1",
        name="Sig",
        signature="Best,\nAMC Team",
    ))
    result = mgr.apply("Hello there.", rec.persona_id)
    assert result.signature_appended is True
    assert "Best," in result.transformed


def test_apply_signature_not_duplicated(mgr):
    sig = "Best,\nAMC Team"
    rec = mgr.create(PersonaInput(tenant_id="t1", name="NoDup", signature=sig))
    # Text already ends with signature
    result = mgr.apply("Hello.\n\n" + sig, rec.persona_id)
    assert result.signature_appended is False


def test_apply_nonexistent_persona_raises(mgr):
    with pytest.raises(KeyError):
        mgr.apply("some text", "bad-id")


# ---------------------------------------------------------------------------
# Invalid inputs
# ---------------------------------------------------------------------------

def test_invalid_tone(mgr):
    with pytest.raises(ValueError, match="Invalid tone"):
        mgr.create(PersonaInput(tenant_id="t1", name="X", tone="robot"))


def test_invalid_style(mgr):
    with pytest.raises(ValueError, match="Invalid style"):
        mgr.create(PersonaInput(tenant_id="t1", name="X", style="haiku"))


# ---------------------------------------------------------------------------
# Singleton factory
# ---------------------------------------------------------------------------

def test_singleton_factory(tmp_path, monkeypatch):
    import amc.product.persona as mod
    mod._manager = None
    mgr1 = get_persona_manager(db_path=tmp_path / "s.db")
    mgr2 = get_persona_manager()
    assert mgr1 is mgr2
    mod._manager = None  # reset
