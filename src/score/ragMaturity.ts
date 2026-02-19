/**
 * RAG Maturity Scoring
 *
 * RAG (Retrieval-Augmented Generation) is the #1 enterprise AI use case.
 * "Prototype worked great on 100 docs. Production was subpar and only end
 *  users could tell." — from r/Rag (362K members)
 *
 * AMC scores RAG maturity across 6 dimensions.
 */

export interface RAGCapabilityProfile {
  // Dimension 1: Retrieval Quality
  hybridSearchEnabled: boolean;           // semantic + keyword
  rerankingEnabled: boolean;              // cross-encoder reranking
  retrievalAccuracyBenchmarked: boolean;  // measured hit rate
  retrievalHitRate?: number;              // 0–1

  // Dimension 2: Chunking Strategy
  chunkingStrategy: 'naive' | 'sentence' | 'paragraph' | 'semantic' | 'hierarchical';
  chunkOverlapConfigured: boolean;
  metadataAttachedToChunks: boolean;      // "Metadata design should consume 40% of dev time"
  chunkQualityValidated: boolean;

  // Dimension 3: Data Freshness
  incrementalIndexingEnabled: boolean;    // partial updates without full reindex
  stalenessDetectionEnabled: boolean;    // detects outdated documents
  dataLineageTracked: boolean;            // where did each chunk come from?

  // Dimension 4: Production Readiness
  testedBeyond100Docs: boolean;           // tested at production data scale
  latencyBenchmarked: boolean;
  p99LatencyMs?: number;
  failoverConfigured: boolean;

  // Dimension 5: Evidence & Provenance
  sourceAttributionInAnswers: boolean;    // answers cite which chunks they used
  confidenceScoresProvided: boolean;      // retrieval confidence per result
  groundingVerified: boolean;             // answer grounded in retrieved content

  // Dimension 6: Security
  accessControlOnIndex: boolean;          // not all users can retrieve all docs
  piiFilteringEnabled: boolean;           // PII removed before indexing
  indexTamperDetected: boolean;           // index integrity monitored
}

export interface RAGMaturityResult {
  overallScore: number;            // 0–100
  level: 'L1-Basic' | 'L2-Functional' | 'L3-Production' | 'L4-Enterprise' | 'L5-Expert';
  dimensionScores: {
    retrievalQuality: number;
    chunkingStrategy: number;
    dataFreshness: number;
    productionReadiness: number;
    evidenceProvenance: number;
    security: number;
  };
  gaps: string[];
  recommendations: string[];
  deploymentRisk: 'low' | 'medium' | 'high' | 'critical';
}

export function scoreRAGMaturity(profile: RAGCapabilityProfile): RAGMaturityResult {
  const gaps: string[] = [];
  const recommendations: string[] = [];

  // Dimension 1: Retrieval Quality (0–100)
  let retrieval = 0;
  if (profile.hybridSearchEnabled) retrieval += 30;
  else { gaps.push('Semantic-only search — hybrid search significantly improves precision'); recommendations.push('Enable hybrid search (BM25 + vector). "Pure semantic search fails for enterprise."'); }
  if (profile.rerankingEnabled) retrieval += 35;
  else { gaps.push('No reranking — cross-encoder reranking shifts chunk rankings significantly'); recommendations.push('Add cross-encoder reranking. Reranking shifted results "more than you would expect."'); }
  if (profile.retrievalAccuracyBenchmarked) { retrieval += 25; if ((profile.retrievalHitRate ?? 0) >= 0.8) retrieval += 10; }
  else { gaps.push('Retrieval accuracy never measured'); recommendations.push('Benchmark retrieval hit rate on representative queries before production.'); }

  // Dimension 2: Chunking Strategy (0–100)
  const chunkScoreMap: Record<string, number> = { naive: 10, sentence: 30, paragraph: 50, semantic: 75, hierarchical: 90 };
  let chunking = chunkScoreMap[profile.chunkingStrategy] ?? 10;
  if (profile.chunkOverlapConfigured) chunking = Math.min(100, chunking + 15);
  if (profile.metadataAttachedToChunks) chunking = Math.min(100, chunking + 20);
  else { gaps.push('No metadata on chunks — metadata design should consume 40% of dev time'); recommendations.push('Add rich metadata: source file, section, date, author, document type.'); }
  if (profile.chunkQualityValidated) chunking = Math.min(100, chunking + 10);

  // Dimension 3: Data Freshness (0–100)
  let freshness = 0;
  if (profile.incrementalIndexingEnabled) freshness += 40;
  else { gaps.push('Full reindex required for updates — blocks production scalability'); }
  if (profile.stalenessDetectionEnabled) freshness += 35;
  if (profile.dataLineageTracked) freshness += 25;
  else { gaps.push('No data lineage — cannot trace answer back to source document version'); }

  // Dimension 4: Production Readiness (0–100)
  let production = 0;
  if (profile.testedBeyond100Docs) production += 40;
  else { gaps.push('Only tested on ≤100 docs — prototype gap: production behavior at scale is unknown'); recommendations.push('"Prototype worked great on 100 docs. Production was subpar." Test at full scale.'); }
  if (profile.latencyBenchmarked) { production += 30; if ((profile.p99LatencyMs ?? 9999) < 500) production += 15; }
  if (profile.failoverConfigured) production += 15;

  // Dimension 5: Evidence & Provenance (0–100)
  let evidence = 0;
  if (profile.sourceAttributionInAnswers) evidence += 45;
  else { gaps.push('Answers do not cite source chunks — hallucination undetectable by user'); recommendations.push('Always include source citations. AMC Truthguard requires evidence binding.'); }
  if (profile.confidenceScoresProvided) evidence += 30;
  if (profile.groundingVerified) evidence += 25;

  // Dimension 6: Security (0–100)
  let security = 0;
  if (profile.accessControlOnIndex) security += 50;
  else { gaps.push('No access control on index — all users can retrieve all documents'); recommendations.push('Implement row-level security on vector index. Critical for enterprise.'); }
  if (profile.piiFilteringEnabled) security += 30;
  else { gaps.push('No PII filtering before indexing — regulatory risk'); }
  if (profile.indexTamperDetected) security += 20;

  const dimensionScores = {
    retrievalQuality: Math.round(retrieval),
    chunkingStrategy: Math.round(chunking),
    dataFreshness: Math.round(freshness),
    productionReadiness: Math.round(production),
    evidenceProvenance: Math.round(evidence),
    security: Math.round(security),
  };

  const overallScore = Math.round(
    Object.values(dimensionScores).reduce((a, b) => a + b, 0) / 6
  );

  const level: RAGMaturityResult['level'] =
    overallScore >= 85 ? 'L5-Expert' :
    overallScore >= 70 ? 'L4-Enterprise' :
    overallScore >= 50 ? 'L3-Production' :
    overallScore >= 30 ? 'L2-Functional' :
    'L1-Basic';

  const deploymentRisk: RAGMaturityResult['deploymentRisk'] =
    dimensionScores.security < 30 || dimensionScores.productionReadiness < 20 ? 'critical' :
    overallScore < 40 ? 'high' :
    overallScore < 65 ? 'medium' :
    'low';

  return { overallScore, level, dimensionScores, gaps, recommendations, deploymentRisk };
}
