"""Tests for the Workflow Rollout Manager (Feature 25)."""
from __future__ import annotations

from pathlib import Path

import pytest

from amc.product.rollout_manager import (
    GateDecision,
    RolloutManager,
    RolloutStatus,
)


@pytest.fixture()
def mgr(tmp_path: Path) -> RolloutManager:
    return RolloutManager(db_path=tmp_path / "rollout.db")


def test_create_plan_with_default_stages(mgr: RolloutManager) -> None:
    plan = mgr.create_plan(artifact_id="wf-001", artifact_type="workflow")
    assert plan.plan_id
    assert plan.status == RolloutStatus.PENDING
    assert len(plan.stages) == 4  # default: canary → early → half → full
    assert plan.stages[0].traffic_percent == 5.0
    assert plan.stages[-1].traffic_percent == 100.0


def test_create_plan_with_custom_stages(mgr: RolloutManager) -> None:
    plan = mgr.create_plan(
        artifact_id="wf-002",
        stages=[
            {"traffic_percent": 10.0, "label": "pilot"},
            {"traffic_percent": 100.0, "label": "full"},
        ],
    )
    assert len(plan.stages) == 2
    assert plan.stages[0].label == "pilot"


def test_start_plan(mgr: RolloutManager) -> None:
    plan = mgr.create_plan(artifact_id="wf-start")
    started = mgr.start_plan(plan.plan_id)
    assert started.status == RolloutStatus.RUNNING


def test_traffic_split_deterministic(mgr: RolloutManager) -> None:
    plan = mgr.create_plan(artifact_id="wf-split")
    mgr.start_plan(plan.plan_id)

    # Canary = 5% → only ~5% of subjects should see new version
    results = [mgr.is_new_version(plan.plan_id, f"sub-{i}") for i in range(200)]
    new_version_count = sum(results)
    # Allow for ±5% variance around the expected 5%
    assert 0 <= new_version_count <= 30, f"Expected ~5% but got {new_version_count}/200"

    # Same subject always gets same result
    r1 = mgr.is_new_version(plan.plan_id, "stable-sub")
    r2 = mgr.is_new_version(plan.plan_id, "stable-sub")
    assert r1 == r2


def test_gate_holds_for_insufficient_data(mgr: RolloutManager) -> None:
    plan = mgr.create_plan(artifact_id="wf-gate-hold", min_sample=10)
    mgr.start_plan(plan.plan_id)

    # Record only 3 metrics
    for _ in range(3):
        mgr.record_metric(plan.plan_id, metric_value=0.97)

    result = mgr.evaluate_gate(plan.plan_id)
    assert result.decision == GateDecision.HOLD
    assert result.sample_size == 3
    assert "Insufficient" in result.rationale


def test_gate_promotes_on_success(mgr: RolloutManager) -> None:
    plan = mgr.create_plan(artifact_id="wf-gate-promote", min_sample=5, promote_threshold=0.90)
    mgr.start_plan(plan.plan_id)

    # Record 10 high-quality metrics
    for _ in range(10):
        mgr.record_metric(plan.plan_id, metric_value=0.95)

    result = mgr.evaluate_gate(plan.plan_id)
    assert result.decision == GateDecision.PROMOTE
    assert result.mean_metric >= 0.90

    # Plan should now be at stage 1
    updated = mgr.get_plan(plan.plan_id)
    assert updated is not None
    assert updated.current_stage == 1


def test_gate_triggers_rollback_on_failure(mgr: RolloutManager) -> None:
    plan = mgr.create_plan(
        artifact_id="wf-gate-rollback",
        min_sample=5,
        promote_threshold=0.90,
        rollback_threshold=0.80,
    )
    mgr.start_plan(plan.plan_id)

    for _ in range(10):
        mgr.record_metric(plan.plan_id, metric_value=0.65)

    result = mgr.evaluate_gate(plan.plan_id)
    assert result.decision == GateDecision.ROLLBACK

    updated = mgr.get_plan(plan.plan_id)
    assert updated is not None
    assert updated.status == RolloutStatus.ROLLED_BACK


def test_full_rollout_completes_after_all_stages(mgr: RolloutManager) -> None:
    plan = mgr.create_plan(
        artifact_id="wf-full",
        min_sample=2,
        promote_threshold=0.90,
        stages=[
            {"traffic_percent": 10.0, "label": "stage-0"},
            {"traffic_percent": 100.0, "label": "stage-1"},
        ],
    )
    mgr.start_plan(plan.plan_id)

    # Promote through stage 0
    for _ in range(5):
        mgr.record_metric(plan.plan_id, metric_value=0.95)
    result1 = mgr.evaluate_gate(plan.plan_id)
    assert result1.decision == GateDecision.PROMOTE

    # Promote through stage 1 (final)
    for _ in range(5):
        mgr.record_metric(plan.plan_id, metric_value=0.95, stage=1)
    result2 = mgr.evaluate_gate(plan.plan_id)
    assert result2.decision == GateDecision.PROMOTE

    final = mgr.get_plan(plan.plan_id)
    assert final is not None
    assert final.status == RolloutStatus.COMPLETED


def test_list_plans_filter_by_artifact_and_status(mgr: RolloutManager) -> None:
    p1 = mgr.create_plan(artifact_id="artifact-A")
    p2 = mgr.create_plan(artifact_id="artifact-B")
    mgr.start_plan(p1.plan_id)

    by_artifact = mgr.list_plans(artifact_id="artifact-A")
    assert len(by_artifact) == 1

    running = mgr.list_plans(status=RolloutStatus.RUNNING)
    assert any(p.plan_id == p1.plan_id for p in running)


def test_plan_as_dict_includes_stage_labels(mgr: RolloutManager) -> None:
    plan = mgr.create_plan(artifact_id="dict-check")
    d = plan.as_dict
    assert d["current_stage_label"] == "canary"
    assert d["current_traffic_percent"] == 5.0
    assert len(d["stages"]) == 4
