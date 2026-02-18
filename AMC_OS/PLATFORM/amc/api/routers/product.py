"""AMC API — Product Feature Router.

Routes for navigating AMC’s feature roadmap and readiness posture.
This keeps non-core productization work visible to operators and automations
without hardcoding roadmap context in clients.
"""
from __future__ import annotations

from typing import Any

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field

from amc.product import Relevance, get_features

router = APIRouter(prefix="/api/v1/product", tags=["product"])


class ProductFeatureRow(BaseModel):
    feature_id: int
    title: str
    lane: str
    summary: str
    relevance: str
    amc_fit: bool
    rationale: str
    owner_hint: str
    effort: str
    blockers: list[str] = Field(default_factory=list)


class ProductFeaturesResponse(BaseModel):
    count: int
    relevance: str | None = None
    amc_fit_only: bool = True
    features: list[ProductFeatureRow] = Field(default_factory=list)


class ProductFeatureSummary(BaseModel):
    total: int
    by_lane: dict[str, int]
    by_relevance: dict[str, int]
    fit_count: int
    recommendation_count: int


@router.get("/features", response_model=ProductFeaturesResponse)
def list_product_features(
    relevance: str | None = None,
    amc_fit: bool = True,
    limit: int = 0,
) -> ProductFeaturesResponse:
    """Return the 50-feature extension catalog with optional filters."""
    rel = None
    if relevance is not None:
        try:
            rel = Relevance(relevance.lower())
        except ValueError as exc:
            raise HTTPException(
                status_code=400,
                detail=(
                    "invalid relevance value. Use one of: "
                    + ", ".join(r.value for r in Relevance)
                ),
            ) from exc

    feats = get_features(relevance=rel, amc_fit_only=amc_fit)
    if limit > 0:
        feats = feats[:limit]

    out = [
        ProductFeatureRow(
            feature_id=f.feature_id,
            title=f.title,
            lane=f.lane.value,
            summary=f.summary,
            relevance=f.relevance.value,
            amc_fit=f.amc_fit,
            rationale=f.rationale,
            owner_hint=f.owner_hint,
            effort=f.effort,
            blockers=list(f.blockers),
        )
        for f in feats
    ]

    return ProductFeaturesResponse(
        count=len(out),
        relevance=relevance.lower() if relevance else None,
        amc_fit_only=amc_fit,
        features=out,
    )


@router.get("/features/summary", response_model=ProductFeatureSummary)
def product_features_summary() -> ProductFeatureSummary:
    """Summary counts for quick planning automation and dashboards."""
    feats = get_features(amc_fit_only=True)

    by_lane: dict[str, int] = {}
    by_relevance: dict[str, int] = {}

    for feat in feats:
        by_lane[feat.lane.value] = by_lane.get(feat.lane.value, 0) + 1
        by_relevance[feat.relevance.value] = by_relevance.get(feat.relevance.value, 0) + 1

    recommendations = get_features(relevance=Relevance.HIGH, amc_fit_only=True)

    return ProductFeatureSummary(
        total=50,
        by_lane=by_lane,
        by_relevance=by_relevance,
        fit_count=len(feats),
        recommendation_count=len(recommendations),
    )


def product_feature_matrix() -> dict[str, Any]:
    """Internal helper for matrix export from roadmap tools."""
    feats = get_features(amc_fit_only=True)
    out: dict[str, Any] = {"high": 0, "medium": 0, "low": 0}
    for feat in feats:
        out[feat.relevance.value] = out.get(feat.relevance.value, 0) + 1
    return out
