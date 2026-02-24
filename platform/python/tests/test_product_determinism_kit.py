"""Tests for amc/product/determinism_kit.py"""
from __future__ import annotations

import pytest

from amc.product.determinism_kit import (
    DeterminismKit,
    CanonRule,
    canonicalize,
    canonical_hash,
    compute_consistency_score,
)


# ---------------------------------------------------------------------------
# Template Registry
# ---------------------------------------------------------------------------

def test_register_and_fetch_template(tmp_path):
    kit = DeterminismKit(db_path=tmp_path / "det.db")

    tpl = kit.register_template(
        name="email_reply",
        template_text="Hi {name}, thanks for your message about {topic}.",
        description="Standard email reply template",
        workflow_id="wf-email",
    )

    assert tpl.name == "email_reply"
    assert "name" in tpl.variables
    assert "topic" in tpl.variables
    assert tpl.workflow_id == "wf-email"
    assert tpl.active is True

    fetched = kit.get_template(tpl.id)
    assert fetched is not None
    assert fetched.name == "email_reply"


def test_register_template_idempotent_upsert(tmp_path):
    kit = DeterminismKit(db_path=tmp_path / "det.db")

    kit.register_template(name="t1", template_text="Hello {x}")
    updated = kit.register_template(name="t1", template_text="Hi {x} and {y}")

    assert updated.variables == ["x", "y"]
    all_templates = kit.list_templates()
    assert len(all_templates) == 1, "Upsert should not create duplicates"


def test_render_template(tmp_path):
    kit = DeterminismKit(db_path=tmp_path / "det.db")
    tpl = kit.register_template(
        name="greeting",
        template_text="Dear {salutation} {last_name},",
    )
    rendered = tpl.render({"salutation": "Dr.", "last_name": "Smith"})
    assert rendered == "Dear Dr. Smith,"


def test_render_template_via_kit(tmp_path):
    kit = DeterminismKit(db_path=tmp_path / "det.db")
    tpl = kit.register_template(name="t_x", template_text="Value={val}")
    out = kit.render_template(tpl.id, {"val": "42"})
    assert out == "Value=42"


def test_list_templates_filter_by_workflow(tmp_path):
    kit = DeterminismKit(db_path=tmp_path / "det.db")
    kit.register_template(name="t1", template_text="a", workflow_id="wf-a")
    kit.register_template(name="t2", template_text="b", workflow_id="wf-b")
    kit.register_template(name="t3", template_text="c", workflow_id="wf-a")

    result = kit.list_templates(workflow_id="wf-a")
    assert len(result) == 2
    assert all(t.workflow_id == "wf-a" for t in result)


def test_delete_template_soft(tmp_path):
    kit = DeterminismKit(db_path=tmp_path / "det.db")
    tpl = kit.register_template(name="todelete", template_text="x")
    assert kit.delete_template(tpl.id) is True
    assert kit.list_templates(active_only=True) == []
    assert kit.list_templates(active_only=False) != []


# ---------------------------------------------------------------------------
# Canonicalization Rules
# ---------------------------------------------------------------------------

def test_register_and_apply_lowercase_rule(tmp_path):
    kit = DeterminismKit(db_path=tmp_path / "det.db")
    rule = kit.register_canon_rule(
        name="lowercase_all",
        rule_type="lowercase",
        priority=10,
    )
    assert rule.rule_type == "lowercase"

    canon_text, c_hash = kit.canonicalize_text("Hello WORLD")
    assert canon_text == "hello world"
    assert len(c_hash) == 64


def test_register_strip_and_whitespace_rules(tmp_path):
    kit = DeterminismKit(db_path=tmp_path / "det.db")
    kit.register_canon_rule(name="strip_ws", rule_type="strip", priority=5)
    kit.register_canon_rule(name="normalize_ws", rule_type="whitespace", priority=10)

    canon_text, _ = kit.canonicalize_text("  hello   world  ")
    assert canon_text == "hello world"


def test_register_regex_rule(tmp_path):
    kit = DeterminismKit(db_path=tmp_path / "det.db")
    kit.register_canon_rule(
        name="remove_punctuation",
        rule_type="regex",
        pattern=r"[^\w\s]",
        replacement="",
        priority=20,
    )
    canon_text, _ = kit.canonicalize_text("Hello, World! How are you?")
    assert "," not in canon_text
    assert "!" not in canon_text
    assert "?" not in canon_text


def test_register_json_normalize_rule(tmp_path):
    kit = DeterminismKit(db_path=tmp_path / "det.db")
    kit.register_canon_rule(name="json_norm", rule_type="json_normalize", priority=5)

    text = '{"z": 1, "a": 2}'
    canon_text, _ = kit.canonicalize_text(text)
    assert canon_text == '{"a":2,"z":1}'


def test_invalid_rule_type_raises(tmp_path):
    kit = DeterminismKit(db_path=tmp_path / "det.db")
    with pytest.raises(ValueError, match="rule_type must be one of"):
        kit.register_canon_rule(name="bad", rule_type="unsupported")


def test_delete_canon_rule(tmp_path):
    kit = DeterminismKit(db_path=tmp_path / "det.db")
    rule = kit.register_canon_rule(name="r1", rule_type="strip")
    assert kit.delete_canon_rule(rule.id) is True
    assert kit.list_canon_rules(active_only=True) == []


# ---------------------------------------------------------------------------
# Standalone canonicalize helpers
# ---------------------------------------------------------------------------

def test_standalone_canonicalize():
    rules = [
        CanonRule(
            id="1", name="lc", description="", rule_type="lowercase",
            pattern="", replacement="", flags="", priority=10,
            active=True, created_at="now",
        ),
        CanonRule(
            id="2", name="ws", description="", rule_type="whitespace",
            pattern="", replacement="", flags="", priority=20,
            active=True, created_at="now",
        ),
    ]
    result = canonicalize("  Hello   WORLD  ", rules)
    assert result == "hello world"


def test_canonical_hash_deterministic():
    h1 = canonical_hash("hello world")
    h2 = canonical_hash("hello world")
    assert h1 == h2
    assert len(h1) == 64

    h3 = canonical_hash("hello world!")
    assert h3 != h1


def test_compute_consistency_score_exact():
    h = canonical_hash("same output")
    assert compute_consistency_score(h, h, method="exact") == 1.0
    assert compute_consistency_score(h, "different", method="exact") == 0.0


def test_compute_consistency_score_prefix():
    h = "abcdef1234567890"
    score = compute_consistency_score(h, h, method="prefix")
    assert score == 1.0

    score_partial = compute_consistency_score("abcXXX", "abcYYY", method="prefix")
    assert 0.0 < score_partial < 1.0


# ---------------------------------------------------------------------------
# Workflow Settings
# ---------------------------------------------------------------------------

def test_set_and_get_workflow_settings(tmp_path):
    kit = DeterminismKit(db_path=tmp_path / "det.db")
    settings = {
        "temperature": 0.0,
        "seed": 42,
        "max_tokens": 512,
        "model": "claude-3-opus",
    }
    ws = kit.set_workflow_settings("wf-deterministic", settings, description="Fixed inference settings")
    assert ws.workflow_id == "wf-deterministic"
    assert ws.settings["temperature"] == 0.0
    assert ws.settings["seed"] == 42

    fetched = kit.get_workflow_settings("wf-deterministic")
    assert fetched is not None
    assert fetched.settings == settings


def test_workflow_settings_upsert(tmp_path):
    kit = DeterminismKit(db_path=tmp_path / "det.db")
    kit.set_workflow_settings("wf-x", {"temperature": 0.5})
    ws = kit.set_workflow_settings("wf-x", {"temperature": 0.0, "seed": 1})
    assert ws.settings["temperature"] == 0.0
    assert ws.settings["seed"] == 1


def test_delete_workflow_settings(tmp_path):
    kit = DeterminismKit(db_path=tmp_path / "det.db")
    kit.set_workflow_settings("wf-del", {"foo": "bar"})
    assert kit.delete_workflow_settings("wf-del") is True
    assert kit.get_workflow_settings("wf-del") is None


def test_list_workflow_settings(tmp_path):
    kit = DeterminismKit(db_path=tmp_path / "det.db")
    kit.set_workflow_settings("wf-1", {"seed": 1})
    kit.set_workflow_settings("wf-2", {"seed": 2})
    all_ws = kit.list_workflow_settings()
    assert len(all_ws) == 2


# ---------------------------------------------------------------------------
# Run-to-run Consistency Scoring
# ---------------------------------------------------------------------------

def test_record_run_output_and_compare(tmp_path):
    kit = DeterminismKit(db_path=tmp_path / "det.db")

    out_a = kit.record_run_output("wf-score", "run-001", "The answer is 42.")
    out_b = kit.record_run_output("wf-score", "run-002", "The answer is 42.")

    assert out_a.canonical_hash == out_b.canonical_hash

    score = kit.compare_runs("wf-score", "run-001", "run-002")
    assert score.score == 1.0


def test_compare_runs_different_outputs(tmp_path):
    kit = DeterminismKit(db_path=tmp_path / "det.db")
    kit.record_run_output("wf-diff", "run-A", "Output one")
    kit.record_run_output("wf-diff", "run-B", "Output two")

    score = kit.compare_runs("wf-diff", "run-A", "run-B", method="exact")
    assert score.score == 0.0


def test_consistency_summary(tmp_path):
    kit = DeterminismKit(db_path=tmp_path / "det.db")
    for i in range(5):
        kit.record_run_output("wf-sum", f"run-{i}", "Stable output")

    # Compare pairs
    kit.compare_runs("wf-sum", "run-0", "run-1")
    kit.compare_runs("wf-sum", "run-0", "run-2")
    kit.compare_runs("wf-sum", "run-1", "run-2")

    summary = kit.consistency_summary("wf-sum")
    assert summary.total_runs == 5
    assert summary.total_comparisons == 3
    assert summary.mean_score == 1.0
    assert summary.match_rate == 1.0
    assert summary.perfect_matches == 3


def test_record_run_output_idempotent(tmp_path):
    kit = DeterminismKit(db_path=tmp_path / "det.db")
    out1 = kit.record_run_output("wf-idem", "run-x", "same output")
    out2 = kit.record_run_output("wf-idem", "run-x", "same output")
    assert out1.id == out2.id


def test_compare_runs_missing_raises(tmp_path):
    kit = DeterminismKit(db_path=tmp_path / "det.db")
    with pytest.raises(KeyError):
        kit.compare_runs("wf-missing", "does-not-exist-a", "does-not-exist-b")


def test_list_run_outputs(tmp_path):
    kit = DeterminismKit(db_path=tmp_path / "det.db")
    for i in range(3):
        kit.record_run_output("wf-list", f"run-{i}", f"output-{i}")

    outputs = kit.list_run_outputs("wf-list")
    assert len(outputs) == 3


def test_dict_property(tmp_path):
    kit = DeterminismKit(db_path=tmp_path / "det.db")
    tpl = kit.register_template(name="dt", template_text="{x}")
    d = tpl.dict
    assert "id" in d
    assert "variables" in d

    rule = kit.register_canon_rule(name="dr", rule_type="strip")
    rd = rule.dict
    assert "rule_type" in rd

    ws = kit.set_workflow_settings("wf-d", {"a": 1})
    assert "settings" in ws.dict
