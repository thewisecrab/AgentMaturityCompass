"""AMC product extension layer.

Contains planning/roadmap metadata for non-core productization features that
support AMC as an end-to-end agent platform.
"""

from .features import Relevance, Domain, FeatureProposal, as_dicts, count_features, get_features, select_high_impact

__all__ = [
    "Relevance",
    "Domain",
    "FeatureProposal",
    "as_dicts",
    "count_features",
    "get_features",
    "select_high_impact",
]
