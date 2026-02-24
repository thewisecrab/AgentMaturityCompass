from __future__ import annotations

from pathlib import Path

from amc.product.version_control import get_version_control_store, reset_version_history


def test_prompt_version_snapshot_diff_and_rollback(tmp_path: Path) -> None:
    store = get_version_control_store(tmp_path / "prompt_versions.json")
    reset_version_history(tmp_path / "prompt_versions.json")

    v1 = store.snapshot(
        artifact_type="prompt",
        artifact_id="onboarding",
        content={"version": 1, "steps": ["ask", "confirm"]},
        note="initial",
    )
    v2 = store.snapshot(
        artifact_type="prompt",
        artifact_id="onboarding",
        content={"version": 2, "steps": ["ask", "confirm", "notify"], "tone": "formal"},
        note="updated",
    )

    assert v1.version == 1
    assert v2.version == 2
    assert v2.parent_version == 1

    diff = store.diff("prompt", "onboarding", from_version=1, to_version=2)
    assert set(diff.added) == {"tone", "steps[2]"}
    assert "version" in diff.changed

    rolled = store.rollback("prompt", "onboarding", target_version=1)
    assert rolled.version == 3
    assert rolled.content["version"] == 1


def test_workflow_version_history_defaults_and_latest(tmp_path: Path) -> None:
    store = get_version_control_store(tmp_path / "workflow_versions.json")
    reset_version_history(tmp_path / "workflow_versions.json")

    store.snapshot("workflow", "wf-1", {"nodes": ["a", "b"]})
    second = store.snapshot("workflow", "wf-1", {"nodes": ["a", "b", "c"]})

    latest = store.get_snapshot("workflow", "wf-1")
    assert latest is not None
    assert latest.version == 2
    assert latest.content == {"nodes": ["a", "b", "c"]}

    explicit = store.get_snapshot("workflow", "wf-1", version=1)
    assert explicit is not None
    assert explicit.version == 1

    all_snaps = store.list_snapshots("workflow", "wf-1")
    assert len(all_snaps) == 2
    assert all_snaps[0].version == 1
    assert all_snaps[1].version == 2

    # Default diff compares from previous version to latest when not specified.
    default_diff = store.diff("workflow", "wf-1")
    assert default_diff.from_version == 1
    assert default_diff.to_version == 2
    assert default_diff.added == ["nodes[2]"]
