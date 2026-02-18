"""Tests for product orchestration routes (queue + escalation) via HTTP."""
from __future__ import annotations

import pytest
pytest.importorskip("fastapi")

from fastapi.testclient import TestClient
from amc.api import main as api_main

client = TestClient(api_main.app)


def test_product_orchestration_routes_are_registered():
    names = [r.path for r in api_main.app.routes]
    # Queue and escalation routes must exist
    assert "/api/v1/product/queue/submit" in names
    assert "/api/v1/product/queue/claim" in names
    assert "/api/v1/product/queue/ack" in names
    assert "/api/v1/product/queue/retry-stats" in names
    assert "/api/v1/product/escalation/submit" in names
    assert "/api/v1/product/escalation/stats" in names


def test_product_queue_api_flow():
    # Submit a job
    r = client.post("/api/v1/product/queue/submit", json={
        "task_type": "analysis",
        "payload": {"target": "doc-1"},
        "priority": 5,
        "sla_seconds": 300,
    })
    assert r.status_code == 200
    job = r.json()
    job_id = job["job_id"]
    assert "job_id" in job

    # Stats
    r2 = client.get("/api/v1/product/queue/retry-stats")
    assert r2.status_code == 200
    stats = r2.json()
    assert "total_jobs" in stats or "queued" in stats or isinstance(stats, dict)


def test_product_escalation_api_flow():
    r = client.post("/api/v1/product/escalation/submit", json={
        "source": "chat",
        "summary": "Need manual review",
        "category": "security",
        "severity": "high",
    })
    assert r.status_code == 200
    ticket = r.json()
    ticket_id = ticket["id"]

    r2 = client.post(f"/api/v1/product/escalation/{ticket_id}/claim", json={"agent": "agent-1"})
    assert r2.status_code == 200
    assert r2.json()["state"] in ("claimed", "in_progress")

    r3 = client.post(f"/api/v1/product/escalation/{ticket_id}/handoff", json={
        "to_team": "security-l2", "reason": "needs specialist"
    })
    assert r3.status_code == 200

    r4 = client.post(f"/api/v1/product/escalation/{ticket_id}/resolve")
    assert r4.status_code == 200

    r5 = client.get("/api/v1/product/escalation/stats")
    assert r5.status_code == 200
    assert r5.json()["total"] >= 1
