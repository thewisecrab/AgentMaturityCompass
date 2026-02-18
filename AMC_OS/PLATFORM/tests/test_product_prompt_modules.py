"""Tests for amc/product/prompt_modules.py"""
from __future__ import annotations

import pytest

from amc.product.prompt_modules import (
    ModuleRef,
    PromptModuleRegistry,
    MODULE_TYPES,
)


def _registry(tmp_path):
    return PromptModuleRegistry(db_path=tmp_path / "pm.db")


# ---------------------------------------------------------------------------
# Module CRUD
# ---------------------------------------------------------------------------

def test_create_and_fetch_module(tmp_path):
    reg = _registry(tmp_path)
    mod = reg.create_module(
        name="role_analyst",
        module_type="role",
        content="You are a senior financial analyst specializing in AMC workflows.",
        description="Analyst role module",
        tags=["finance", "analyst"],
    )
    assert mod.name == "role_analyst"
    assert mod.module_type == "role"
    assert "finance" in mod.tags
    assert mod.active is True

    fetched = reg.get_module(mod.id)
    assert fetched is not None
    assert fetched.name == "role_analyst"


def test_create_module_invalid_type_raises(tmp_path):
    reg = _registry(tmp_path)
    with pytest.raises(ValueError, match="module_type must be one of"):
        reg.create_module(name="bad", module_type="invalid_type", content="x")


def test_create_module_upsert(tmp_path):
    reg = _registry(tmp_path)
    reg.create_module(name="m1", module_type="role", content="v1")
    updated = reg.create_module(name="m1", module_type="constraints", content="v2")
    assert updated.module_type == "constraints"
    assert updated.content == "v2"
    assert len(reg.list_modules()) == 1


def test_list_modules_filter_by_type(tmp_path):
    reg = _registry(tmp_path)
    reg.create_module(name="r1", module_type="role", content="role1")
    reg.create_module(name="c1", module_type="constraints", content="constraint1")
    reg.create_module(name="c2", module_type="constraints", content="constraint2")

    roles = reg.list_modules(module_type="role")
    assert len(roles) == 1

    constraints = reg.list_modules(module_type="constraints")
    assert len(constraints) == 2


def test_list_modules_filter_by_tag(tmp_path):
    reg = _registry(tmp_path)
    reg.create_module(name="m1", module_type="role", content="x", tags=["alpha", "beta"])
    reg.create_module(name="m2", module_type="role", content="y", tags=["beta", "gamma"])
    reg.create_module(name="m3", module_type="role", content="z", tags=["delta"])

    result = reg.list_modules(tag="beta")
    assert len(result) == 2


def test_update_module(tmp_path):
    reg = _registry(tmp_path)
    mod = reg.create_module(name="m_upd", module_type="role", content="old content")
    updated = reg.update_module(mod.id, {"content": "new content", "tags": ["new"]})
    assert updated.content == "new content"
    assert "new" in updated.tags


def test_delete_module(tmp_path):
    reg = _registry(tmp_path)
    mod = reg.create_module(name="m_del", module_type="role", content="x")
    assert reg.delete_module(mod.id) is True
    assert reg.list_modules(active_only=True) == []


def test_all_module_types_valid(tmp_path):
    reg = _registry(tmp_path)
    for i, mtype in enumerate(MODULE_TYPES):
        reg.create_module(name=f"mod_{i}", module_type=mtype, content=f"content {i}")
    mods = reg.list_modules()
    assert len(mods) == len(MODULE_TYPES)


# ---------------------------------------------------------------------------
# Template CRUD
# ---------------------------------------------------------------------------

def test_create_and_fetch_template(tmp_path):
    reg = _registry(tmp_path)
    reg.create_module(name="role_sdr", module_type="role", content="You are an SDR.")
    reg.create_module(name="constraints_sdr", module_type="constraints", content="Be concise.")
    reg.create_module(name="format_email", module_type="format", content="Respond in email format.")

    tmpl = reg.create_template(
        name="sdr_email_template",
        module_refs=[
            {"module_name": "role_sdr"},
            {"module_name": "constraints_sdr"},
            {"module_name": "format_email"},
        ],
        description="SDR email composition template",
        separator="\n\n",
    )

    assert tmpl.name == "sdr_email_template"
    assert len(tmpl.module_refs) == 3
    assert tmpl.separator == "\n\n"


def test_template_upsert(tmp_path):
    reg = _registry(tmp_path)
    reg.create_module(name="r", module_type="role", content="role")
    reg.create_template(name="t1", module_refs=[{"module_name": "r"}])
    t_updated = reg.create_template(name="t1", module_refs=[{"module_name": "r"}], separator="\n")
    assert t_updated.separator == "\n"
    assert len(reg.list_templates()) == 1


def test_list_templates(tmp_path):
    reg = _registry(tmp_path)
    reg.create_template(name="ta", module_refs=[])
    reg.create_template(name="tb", module_refs=[])
    assert len(reg.list_templates()) == 2


def test_delete_template(tmp_path):
    reg = _registry(tmp_path)
    tmpl = reg.create_template(name="tdel", module_refs=[])
    assert reg.delete_template(tmpl.id) is True
    assert reg.list_templates(active_only=True) == []


# ---------------------------------------------------------------------------
# Composition
# ---------------------------------------------------------------------------

def test_compose_basic(tmp_path):
    reg = _registry(tmp_path)
    reg.create_module(name="role_m", module_type="role", content="You are an expert.")
    reg.create_module(name="format_m", module_type="format", content="Respond in JSON.")

    tmpl = reg.create_template(
        name="basic",
        module_refs=[{"module_name": "role_m"}, {"module_name": "format_m"}],
        separator="\n\n",
    )

    composed = reg.compose(tmpl.id)
    assert "You are an expert." in composed
    assert "Respond in JSON." in composed
    assert "\n\n" in composed


def test_compose_with_context_substitution(tmp_path):
    reg = _registry(tmp_path)
    reg.create_module(
        name="greeting",
        module_type="role",
        content="Hello {user_name}, you are working on {task}.",
    )
    tmpl = reg.create_template(name="personalized", module_refs=[{"module_name": "greeting"}])
    composed = reg.compose(tmpl.id, context={"user_name": "Alice", "task": "outreach"})
    assert "Hello Alice, you are working on outreach." in composed


def test_compose_with_override_content(tmp_path):
    reg = _registry(tmp_path)
    reg.create_module(name="base_role", module_type="role", content="Default role.")
    tmpl = reg.create_template(
        name="with_override",
        module_refs=[{"module_name": "base_role", "override_content": "Override role!"}],
    )
    composed = reg.compose(tmpl.id)
    assert "Override role!" in composed
    assert "Default role." not in composed


def test_compose_skips_inactive_modules(tmp_path):
    reg = _registry(tmp_path)
    mod = reg.create_module(name="inactive_mod", module_type="role", content="Inactive content.")
    reg.create_module(name="active_mod", module_type="constraints", content="Active content.")
    reg.delete_module(mod.id)  # Deactivate

    tmpl = reg.create_template(
        name="t_inactive",
        module_refs=[
            {"module_name": "inactive_mod"},
            {"module_name": "active_mod"},
        ],
    )
    composed = reg.compose(tmpl.id)
    assert "Inactive content." not in composed
    assert "Active content." in composed


def test_compose_by_name(tmp_path):
    reg = _registry(tmp_path)
    reg.create_module(name="nm", module_type="role", content="Role text.")
    tmpl = reg.create_template(name="by_name_tmpl", module_refs=[{"module_name": "nm"}])
    composed = reg.compose("by_name_tmpl")  # Pass name instead of ID
    assert "Role text." in composed


def test_compose_unknown_template_raises(tmp_path):
    reg = _registry(tmp_path)
    with pytest.raises(KeyError):
        reg.compose("nonexistent-id-or-name")


# ---------------------------------------------------------------------------
# Versioning
# ---------------------------------------------------------------------------

def test_snapshot_version_increments(tmp_path):
    reg = _registry(tmp_path)
    reg.create_module(name="vm", module_type="role", content="Version test.")
    tmpl = reg.create_template(name="versioned", module_refs=[{"module_name": "vm"}])

    v1 = reg.snapshot_version(tmpl.id, note="initial")
    v2 = reg.snapshot_version(tmpl.id, note="second")

    assert v1.version == 1
    assert v2.version == 2
    assert v1.template_name == "versioned"
    assert "Version test." in v1.composed_text


def test_snapshot_captures_module_content(tmp_path):
    reg = _registry(tmp_path)
    mod = reg.create_module(name="snap_m", module_type="role", content="Original content.")
    tmpl = reg.create_template(name="snap_t", module_refs=[{"module_name": "snap_m"}])

    v1 = reg.snapshot_version(tmpl.id, note="v1")
    assert v1.module_snapshot["snap_m"] == "Original content."

    # Mutate module; snapshot should be immutable
    reg.update_module(mod.id, {"content": "Changed content."})
    v2 = reg.snapshot_version(tmpl.id, note="v2")
    assert v2.module_snapshot["snap_m"] == "Changed content."
    # v1 should be unchanged
    v1_refetched = reg.get_version(v1.id)
    assert v1_refetched is not None
    assert v1_refetched.module_snapshot["snap_m"] == "Original content."


def test_list_versions(tmp_path):
    reg = _registry(tmp_path)
    reg.create_module(name="lv_m", module_type="role", content="x")
    tmpl = reg.create_template(name="lv_t", module_refs=[{"module_name": "lv_m"}])

    for i in range(3):
        reg.snapshot_version(tmpl.id, note=f"v{i+1}")

    versions = reg.list_versions(tmpl.id)
    assert len(versions) == 3
    # Should be ordered by version desc
    assert versions[0].version == 3
    assert versions[-1].version == 1


def test_latest_version(tmp_path):
    reg = _registry(tmp_path)
    reg.create_module(name="lat_m", module_type="role", content="x")
    tmpl = reg.create_template(name="lat_t", module_refs=[{"module_name": "lat_m"}])

    reg.snapshot_version(tmpl.id)
    reg.snapshot_version(tmpl.id)
    latest = reg.latest_version(tmpl.id)
    assert latest is not None
    assert latest.version == 2


def test_get_template_version(tmp_path):
    reg = _registry(tmp_path)
    reg.create_module(name="gtv_m", module_type="role", content="x")
    tmpl = reg.create_template(name="gtv_t", module_refs=[{"module_name": "gtv_m"}])

    reg.snapshot_version(tmpl.id)
    v2 = reg.snapshot_version(tmpl.id)

    fetched = reg.get_template_version(tmpl.id, 2)
    assert fetched is not None
    assert fetched.id == v2.id


def test_version_dict_property(tmp_path):
    reg = _registry(tmp_path)
    reg.create_module(name="dp_m", module_type="role", content="x")
    tmpl = reg.create_template(name="dp_t", module_refs=[{"module_name": "dp_m"}])
    v = reg.snapshot_version(tmpl.id)
    d = v.dict
    assert "version" in d
    assert "composed_text" in d
    assert "module_snapshot" in d


def test_module_ref_to_from_dict():
    ref = ModuleRef(module_name="test_module", override_content="override")
    d = ref.to_dict()
    assert d["module_name"] == "test_module"
    assert d["override_content"] == "override"

    restored = ModuleRef.from_dict(d)
    assert restored.module_name == "test_module"
    assert restored.override_content == "override"
