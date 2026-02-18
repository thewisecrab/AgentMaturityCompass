from __future__ import annotations

import pytest

pytest.importorskip("fastapi")


from amc.api.routers import product as product_router
from amc.api import main as api_main


def test_product_features_endpoint_like_contract_smoke():
    """Call router function directly to avoid client/runtime dependency drift."""
    res = product_router.list_product_features(relevance="high", amc_fit=True, limit=3)
    assert res.count == 3
    assert all(item.relevance == "high" for item in res.features)
    assert res.amc_fit_only is True


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
