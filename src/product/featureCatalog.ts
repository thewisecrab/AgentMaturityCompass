export interface ProductFeature {
  id: string;
  name: string;
  relevance: string;
  amcFit: boolean;
  pricingRange?: string;
  lane?: string;
}

const features: ProductFeature[] = [
  {
    id: "AMC-W1-FEATURE-1",
    name: "Memory Retention Integrity",
    relevance: "high",
    amcFit: true,
    pricingRange: "$1k-$3k",
    lane: "core"
  },
  {
    id: "AMC-W1-FEATURE-2",
    name: "TOCTOU Hardening",
    relevance: "high",
    amcFit: true,
    pricingRange: "$2k-$5k",
    lane: "security"
  }
];

export function listFeatures(filter: { relevance?: string; lane?: string; amcFit?: boolean } = {}): ProductFeature[] {
  return features.filter((f) => {
    if (filter.relevance && f.relevance !== filter.relevance) return false;
    if (filter.lane && f.lane !== filter.lane) return false;
    if (filter.amcFit !== undefined && f.amcFit !== filter.amcFit) return false;
    return true;
  });
}

export function getRecommended(limit = 10): ProductFeature[] {
  return features.slice(0, Math.max(0, limit));
}

export type { ProductFeature as FeatureCatalogFeature };
