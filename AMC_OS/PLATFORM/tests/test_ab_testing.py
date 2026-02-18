"""Tests for the A/B Testing Platform (Feature 48)."""
from __future__ import annotations

from pathlib import Path

import pytest

from amc.product.ab_testing import (
    ABTestingPlatform,
    ExperimentStatus,
)


@pytest.fixture()
def platform(tmp_path: Path) -> ABTestingPlatform:
    return ABTestingPlatform(db_path=tmp_path / "ab.db")


def test_create_experiment_with_defaults(platform: ABTestingPlatform) -> None:
    exp = platform.create_experiment(name="test-exp-1")
    assert exp.experiment_id
    assert exp.status == ExperimentStatus.DRAFT
    assert len(exp.variants) == 2
    control = next(v for v in exp.variants if v.is_control)
    assert control.name == "control"


def test_create_experiment_with_custom_variants(platform: ABTestingPlatform) -> None:
    exp = platform.create_experiment(
        name="custom-variants",
        variants=[
            {"name": "control", "is_control": True, "weight": 1.0, "config": {"prompt": "A"}},
            {"name": "variant_b", "is_control": False, "weight": 1.0, "config": {"prompt": "B"}},
            {"name": "variant_c", "is_control": False, "weight": 0.5, "config": {"prompt": "C"}},
        ],
    )
    assert len(exp.variants) == 3
    assert sum(1 for v in exp.variants if v.is_control) == 1


def test_start_and_get_experiment(platform: ABTestingPlatform) -> None:
    exp = platform.create_experiment(name="start-test")
    started = platform.start_experiment(exp.experiment_id)
    assert started.status == ExperimentStatus.RUNNING
    fetched = platform.get_experiment(exp.experiment_id)
    assert fetched is not None
    assert fetched.status == ExperimentStatus.RUNNING


def test_stop_experiment(platform: ABTestingPlatform) -> None:
    exp = platform.create_experiment(name="stop-test")
    platform.start_experiment(exp.experiment_id)
    stopped = platform.stop_experiment(exp.experiment_id)
    assert stopped.status == ExperimentStatus.STOPPED


def test_conclude_experiment(platform: ABTestingPlatform) -> None:
    exp = platform.create_experiment(name="conclude-test")
    platform.start_experiment(exp.experiment_id)
    concluded = platform.stop_experiment(exp.experiment_id, conclude=True)
    assert concluded.status == ExperimentStatus.CONCLUDED


def test_deterministic_variant_assignment(platform: ABTestingPlatform) -> None:
    exp = platform.create_experiment(name="assign-test")
    platform.start_experiment(exp.experiment_id)

    # Same subject → same variant
    a1 = platform.assign_variant(exp.experiment_id, "subject-123")
    a2 = platform.assign_variant(exp.experiment_id, "subject-123")
    assert a1 is not None and a2 is not None
    assert a1.variant_id == a2.variant_id


def test_assignment_returns_none_for_non_running_experiment(platform: ABTestingPlatform) -> None:
    exp = platform.create_experiment(name="draft-assign")
    result = platform.assign_variant(exp.experiment_id, "any-subject")
    assert result is None


def test_record_observation_and_list_from_db(platform: ABTestingPlatform) -> None:
    exp = platform.create_experiment(name="obs-test")
    platform.start_experiment(exp.experiment_id)
    control = next(v for v in exp.variants if v.is_control)
    obs_id = platform.record_observation(
        experiment_id=exp.experiment_id,
        variant_id=control.variant_id,
        subject_id="s1",
        primary_metric_value=0.92,
    )
    assert obs_id


def test_analysis_requires_min_sample(platform: ABTestingPlatform) -> None:
    exp = platform.create_experiment(name="analysis-small", min_sample_size=100)
    platform.start_experiment(exp.experiment_id)
    control = next(v for v in exp.variants if v.is_control)
    platform.record_observation(exp.experiment_id, control.variant_id, "s1", 0.90)

    analysis = platform.analyze(exp.experiment_id)
    assert not analysis.min_sample_met
    assert analysis.winner_variant_id is None
    assert "Insufficient data" in analysis.conclusion


def test_analysis_selects_winner_with_sufficient_data(platform: ABTestingPlatform) -> None:
    exp = platform.create_experiment(
        name="winner-test",
        primary_metric="success_rate",
        min_sample_size=5,
        variants=[
            {"name": "control", "is_control": True, "weight": 1.0, "config": {}},
            {"name": "treatment", "is_control": False, "weight": 1.0, "config": {}},
        ],
    )
    platform.start_experiment(exp.experiment_id)

    control_v = next(v for v in exp.variants if v.is_control)
    treatment_v = next(v for v in exp.variants if not v.is_control)

    # Control: ~0.70 avg
    for i in range(20):
        platform.record_observation(
            exp.experiment_id, control_v.variant_id, f"ctrl-{i}", 0.70 + (i % 5) * 0.01
        )
    # Treatment: ~0.90 avg (clear winner)
    for i in range(20):
        platform.record_observation(
            exp.experiment_id, treatment_v.variant_id, f"trt-{i}", 0.90 + (i % 5) * 0.01
        )

    analysis = platform.analyze(exp.experiment_id)
    assert analysis.total_observations == 40
    assert analysis.min_sample_met
    # Should identify treatment as winner (significantly higher mean)
    assert analysis.winner_variant_id == treatment_v.variant_id


def test_list_experiments_filters_by_status(platform: ABTestingPlatform) -> None:
    exp1 = platform.create_experiment(name="e1")
    exp2 = platform.create_experiment(name="e2")
    platform.start_experiment(exp2.experiment_id)

    drafts = platform.list_experiments(status=ExperimentStatus.DRAFT)
    running = platform.list_experiments(status=ExperimentStatus.RUNNING)

    assert any(e.experiment_id == exp1.experiment_id for e in drafts)
    assert any(e.experiment_id == exp2.experiment_id for e in running)


def test_experiment_as_dict_serializable(platform: ABTestingPlatform) -> None:
    exp = platform.create_experiment(name="dict-test")
    d = exp.as_dict
    assert d["experiment_id"] == exp.experiment_id
    assert isinstance(d["variants"], list)
