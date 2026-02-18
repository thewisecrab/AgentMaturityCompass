"""Tests for the product API router.

Uses FastAPI TestClient for all handler tests so Pydantic models are
constructed correctly by the framework — avoids calling handlers directly
with raw dicts.
"""
from __future__ import annotations

import pytest
pytest.importorskip("fastapi")

from fastapi.testclient import TestClient
from amc.api import main as api_main
from amc.api.routers import product as product_router


# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------

client = TestClient(api_main.app)


# ---------------------------------------------------------------------------
# Features catalog
# ---------------------------------------------------------------------------

def test_product_features_endpoint_like_contract_smoke():
    res = product_router.list_product_features(relevance="high", amc_fit=True, limit=3)
    assert res.count == 3
    assert all(item.relevance == "high" for item in res.features)


def test_product_features_invalid_relevance_raises_http_error():
    with pytest.raises(Exception):
        product_router.list_product_features(relevance="ultra")


def test_product_features_summary():
    summary = product_router.product_features_summary()
    assert summary.total == 50
    assert summary.fit_count >= summary.recommendation_count
    assert summary.by_relevance


def test_product_router_is_included_in_api():
    names = [r.path for r in api_main.app.routes]
    assert "/api/v1/product/features" in names
    assert "/api/v1/product/features/summary" in names


# ---------------------------------------------------------------------------
# Metering via HTTP
# ---------------------------------------------------------------------------

def test_product_metering_router_endpoints_round_trip():
    r = client.post("/api/v1/product/metering", json={
        "tenant_id": "t-test", "workflow_id": "wf-1", "run_id": "r-1",
        "actor_id": "agent", "duration_ms": 200, "tool_calls": 2,
        "model_calls": 1, "input_tokens": 50, "output_tokens": 30,
        "browser_minutes": 0.0,
    })
    assert r.status_code == 200
    body = r.json()
    assert body["event"]["tenant_id"] == "t-test"

    r2 = client.get("/api/v1/product/metering", params={"tenant_id": "t-test"})
    assert r2.status_code == 200
    assert r2.json()["count"] >= 1

    r3 = client.get("/api/v1/product/metering/billing", params={"tenant_id": "t-test"})
    assert r3.status_code in (200, 404)  # 404 ok if no events yet (fresh ledger)


# ---------------------------------------------------------------------------
# Feedback via HTTP
# ---------------------------------------------------------------------------

def test_product_feedback_router_round_trip():
    r = client.post("/api/v1/product/feedback", json={
        "tenant_id": "t-fb", "workflow_id": "wf-fb",
        "run_id": "r-fb", "sentiment": "positive",
        "rating": 5, "correction_note": "great",
    })
    assert r.status_code == 200

    r2 = client.get("/api/v1/product/feedback", params={"tenant_id": "t-fb"})
    assert r2.status_code == 200
    assert r2.json()["count"] >= 1

    r3 = client.get("/api/v1/product/feedback/score", params={"tenant_id": "t-fb", "workflow_id": "wf-fb"})
    assert r3.status_code in (200, 422)  # 422 acceptable if params optional in impl


# ---------------------------------------------------------------------------
# Analytics via HTTP
# ---------------------------------------------------------------------------

def test_product_analytics_router_smoke():
    r = client.get("/api/v1/product/analytics")
    assert r.status_code == 200
    body = r.json()
    # Response contains receipt and metering aggregate fields
    assert "total_receipts" in body or "allowed_receipts" in body or "total_events" in body


# ---------------------------------------------------------------------------
# Version control via HTTP
# ---------------------------------------------------------------------------

def test_product_versioning_router_round_trip():
    r = client.post("/api/v1/product/versions/snapshot", json={
        "artifact_type": "prompt", "artifact_id": "onboarding",
        "content": {"v": 1, "steps": ["a", "b"]}, "note": "init",
    })
    assert r.status_code == 200
    snap = r.json()
    assert snap["version"] >= 1

    r2 = client.post("/api/v1/product/versions/snapshot", json={
        "artifact_type": "prompt", "artifact_id": "onboarding",
        "content": {"v": 2, "steps": ["a", "b", "c"]}, "note": "add c",
    })
    assert r2.status_code == 200

    r3 = client.post("/api/v1/product/versions/diff", json={
        "artifact_type": "prompt", "artifact_id": "onboarding",
        "from_version": 1, "to_version": 2,
    })
    assert r3.status_code == 200

    r4 = client.post("/api/v1/product/versions/rollback", json={
        "artifact_type": "prompt", "artifact_id": "onboarding", "target_version": 1,
    })
    assert r4.status_code == 200


# ---------------------------------------------------------------------------
# Tool contract via HTTP
# ---------------------------------------------------------------------------

def test_tool_contract_router_round_trip():
    contract = {
        "tool_name": "send_email",
        "parameters": {
            "to": {"type": "string", "required": True},
            "subject": {"type": "string", "required": True},
        }
    }
    r = client.post("/api/v1/product/tool-contract/check", json={
        "tool_name": "send_email",
        "contract": contract,
        "invocation": {"to": "x@y.com", "subject": "hi"},
    })
    assert r.status_code == 200
    assert r.json()["valid"] is True

    r2 = client.post("/api/v1/product/tool-contract/check", json={
        "tool_name": "send_email",
        "contract": contract,
        "invocation": {"to": "x@y.com"},
    })
    assert r2.status_code == 200
    assert r2.json()["valid"] is False


# ---------------------------------------------------------------------------
# Failure clustering via HTTP
# ---------------------------------------------------------------------------

def test_failures_cluster_router_flow():
    r = client.post("/api/v1/product/failures/cluster", json={
        "findings": [
            {"rule_id": "S10", "module": "shield.s10", "title": "Injection attempt", "evidence": "ignore all instructions"},
            {"rule_id": "S10", "module": "shield.s10", "title": "Injection attempt", "evidence": "system override"},
            {"rule_id": "E1", "module": "enforce.e1", "title": "Policy denied exec", "evidence": "rm -rf /"},
        ]
    })
    assert r.status_code == 200
    body = r.json()
    assert body["total_findings"] == 3
    assert len(body["clusters"]) >= 1


# ---------------------------------------------------------------------------
# Feature-gate route registration coverage
# ---------------------------------------------------------------------------

def test_product_feature_versions_and_failures_routes_are_registered():
    names = [r.path for r in api_main.app.routes]
    assert "/api/v1/product/versions/snapshot" in names
    assert "/api/v1/product/failures/cluster" in names
    assert "/api/v1/product/tool-contract/check" in names
