from __future__ import annotations

from amc.product.features import (
    FeatureProposal,
    Relevance,
    count_features,
    get_features,
    select_high_impact,
)


def test_all_features_and_unique_ids():
    feats = get_features()
    assert count_features() == 50
    ids = [f.feature_id for f in feats]
    assert len(ids) == len(set(ids)) == 50


def test_high_fit_filter_and_limit():
    fit = get_features(amc_fit_only=True)
    assert len(fit) > 30
    assert all(f.amc_fit for f in fit)
    rec = select_high_impact(limit=5)
    assert len(rec) == 5
    assert all(f.relevance == Relevance.HIGH for f in rec)
    assert all(f.amc_fit for f in rec)


def test_product_features_type_guards():
    feats = get_features(relevance=Relevance.LOW)
    assert feats
    assert all(f.relevance == Relevance.LOW for f in feats)
    assert all(f.summary and f.owner_hint for f in feats)
