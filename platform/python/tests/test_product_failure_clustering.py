from __future__ import annotations

from datetime import datetime, timezone

from amc.core.models import Finding, RiskLevel
from amc.product.failure_clustering import FailureFinding, cluster_failures, summarize_failure_clusters


def test_cluster_findings_by_module_rule_and_title() -> None:
    findings = [
        Finding(
            module="watch",
            rule_id="R1",
            title="Unsafe SQL pattern",
            description="Potential SQL concat",
            risk_level=RiskLevel.HIGH,
            file_path="app.py",
            evidence="line 10",
        ),
        Finding(
            module="watch",
            rule_id="R1",
            title="Unsafe SQL pattern",
            description="Potential SQL concat",
            risk_level=RiskLevel.HIGH,
            file_path="db.py",
            evidence="line 4",
        ),
        Finding(
            module="watch",
            rule_id="R2",
            title="Unsafe file write",
            description="path traversal",
            risk_level=RiskLevel.CRITICAL,
            file_path="fs.py",
            evidence="line 88",
        ),
    ]

    clusters = cluster_failures(findings)
    assert len(clusters) == 2

    clustered = next(c for c in clusters if c.rule_id == "R1")
    assert clustered.count == 2
    assert clustered.module == "watch"
    assert clustered.rule_id == "R1"
    assert "Recurring" in clustered.root_cause


def test_summary_contains_cluster_ordering_and_counts() -> None:
    payload = [
        {
            "module": "scanner",
            "rule_id": "AUTH",
            "title": "Missing auth",
            "risk_level": "critical",
            "evidence": "id 1",
            "timestamp": datetime(2026, 2, 18, 12, 0, 0, tzinfo=timezone.utc).isoformat(),
        },
        {
            "module": "scanner",
            "rule_id": "AUTH",
            "title": "Missing auth",
            "risk_level": "critical",
            "evidence": "id 2",
            "timestamp": datetime(2026, 2, 18, 12, 5, 0, tzinfo=timezone.utc).isoformat(),
        },
    ]

    response = summarize_failure_clusters(payload)
    assert response.total_findings == 2
    assert response.total_clusters == 1
    assert response.top_cluster_id is not None
    assert response.clusters[0].count == 2
    assert len(response.clusters[0].sample_evidence) == 2
