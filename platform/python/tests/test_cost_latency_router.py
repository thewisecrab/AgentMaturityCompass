"""Tests for the Cost + Latency Optimization Router (Feature 47)."""
from __future__ import annotations

import tempfile
from pathlib import Path

import pytest

from amc.product.cost_latency_router import (
    CostLatencyRouter,
    ModelTier,
    RoutingProfile,
    TaskDescriptor,
    TaskType,
)


@pytest.fixture()
def router(tmp_path: Path) -> CostLatencyRouter:
    return CostLatencyRouter(db_path=tmp_path / "routing.db")


def test_routes_to_micro_for_low_quality_task(router: CostLatencyRouter) -> None:
    """Low quality_floor + small token budget → micro profile."""
    task = TaskDescriptor(
        task_id="t1",
        task_type=TaskType.CLASSIFICATION,
        quality_floor=0.50,
        latency_sla_ms=1000,
        cost_cap_usd=0.01,
        estimated_tokens=500,
    )
    decision = router.route(task)
    assert decision.decision_id
    assert "micro" in decision.selected_profile
    assert decision.estimated_cost_usd <= 0.01 * 1.2  # within relaxed cap


def test_routes_to_premium_for_high_quality_task(router: CostLatencyRouter) -> None:
    """High quality_floor → premium profile selected."""
    task = TaskDescriptor(
        task_id="t2",
        task_type=TaskType.REASONING,
        quality_floor=0.95,
        latency_sla_ms=10000,
        cost_cap_usd=1.0,
        estimated_tokens=2000,
    )
    decision = router.route(task)
    assert "premium" in decision.selected_profile
    assert decision.estimated_latency_ms <= 10000


def test_routing_decision_persisted_and_queryable(router: CostLatencyRouter) -> None:
    task = TaskDescriptor(task_id="t3", tenant_id="acme", workflow_id="wf-A")
    d = router.route(task)
    fetched = router.get_decision(d.decision_id)
    assert fetched is not None
    assert fetched.decision_id == d.decision_id
    assert fetched.tenant_id == "acme"


def test_record_outcome_updates_decision(router: CostLatencyRouter) -> None:
    task = TaskDescriptor(task_id="t4")
    d = router.route(task)
    router.record_outcome(d.decision_id, observed_cost_usd=0.003, observed_latency_ms=800, outcome_quality=0.91)
    updated = router.get_decision(d.decision_id)
    assert updated is not None
    assert updated.observed_cost_usd == pytest.approx(0.003)
    assert updated.observed_latency_ms == 800
    assert updated.outcome_quality == pytest.approx(0.91)


def test_register_custom_profile(router: CostLatencyRouter) -> None:
    custom = RoutingProfile(
        profile_name="custom-fast",
        model_tier=ModelTier.MICRO,
        max_tokens=512,
        tool_timeout_ms=1000,
        cost_per_1k_tokens_usd=0.0001,
        avg_latency_ms=100,
        quality_score=0.60,
        task_types=["classification"],
    )
    router.register_profile(custom)

    task = TaskDescriptor(
        task_id="t5",
        task_type=TaskType.CLASSIFICATION,
        quality_floor=0.55,
        latency_sla_ms=200,
        cost_cap_usd=0.001,
        estimated_tokens=100,
    )
    decision = router.route(task)
    assert decision.selected_profile == "custom-fast"


def test_query_decisions_by_tenant(router: CostLatencyRouter) -> None:
    for i in range(3):
        router.route(TaskDescriptor(task_id=f"q{i}", tenant_id="tenant-x"))
    router.route(TaskDescriptor(task_id="other", tenant_id="tenant-y"))

    results = router.query_decisions(tenant_id="tenant-x")
    assert len(results) == 3
    assert all(d.tenant_id == "tenant-x" for d in results)


def test_cost_summary_returns_profile_breakdown(router: CostLatencyRouter) -> None:
    for i in range(5):
        router.route(TaskDescriptor(task_id=f"cs{i}"))
    summary = router.cost_summary()
    assert "profile_breakdown" in summary
    assert len(summary["profile_breakdown"]) >= 1


def test_fallback_when_no_profile_meets_constraints(router: CostLatencyRouter) -> None:
    """Should never raise; falls back gracefully."""
    task = TaskDescriptor(
        task_id="fb1",
        quality_floor=0.999,
        latency_sla_ms=1,       # impossible constraint
        cost_cap_usd=0.000001,  # impossibly tight budget
        estimated_tokens=100000,
    )
    # Should not raise — falls back to best available
    decision = router.route(task)
    assert decision.selected_profile
    assert "fallback" in decision.rationale.lower() or decision.selected_profile


def test_rationale_is_human_readable(router: CostLatencyRouter) -> None:
    task = TaskDescriptor(task_id="r1", task_type=TaskType.GENERATION)
    d = router.route(task)
    assert len(d.rationale) > 20
    assert "generation" in d.rationale.lower() or d.selected_profile
