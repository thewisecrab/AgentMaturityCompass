/**
 * Platform Dependency Score
 *
 * "Built $800k/month Amazon business, lost everything overnight" (796↑ r/startups)
 * What happens to your agent if its primary platform suspends your API key tomorrow?
 * Score single points of failure in the agent's infrastructure.
 */

export interface PlatformDependencyProfile {
  // LLM Provider
  primaryLLMProvider: string;              // e.g. 'openai', 'anthropic'
  hasLLMFallback: boolean;                 // secondary provider configured
  llmFallbackProvider?: string;
  llmSwitchTimeMinutes?: number;           // how long to restore service after primary loss

  // Vector / Database
  vectorStoreProvider: string;             // e.g. 'pinecone', 'weaviate', 'pgvector'
  hasVectorStoreFallback: boolean;
  databaseBackupsEnabled: boolean;
  canRestoreFromBackup: boolean;

  // Infrastructure
  cloudProvider: string;                   // e.g. 'aws', 'gcp', 'azure', 'self-hosted'
  hasMultiRegion: boolean;
  hasSecondaryCloudProvider: boolean;

  // API Keys & Secrets
  apiKeysInVault: boolean;                 // keys managed by AMC vault or equivalent
  apiKeyRotationEnabled: boolean;          // automatic rotation
  hasBackupKeys: boolean;                  // secondary keys ready to activate

  // Data Portability
  dataIsPortable: boolean;                 // can export and move data
  dataExportFormatDocumented: boolean;
  vendorLockInAssessed: boolean;
}

export interface PlatformDependencyScore {
  score: number;           // 0–100 (higher = more resilient)
  resilience: 'fragile' | 'vulnerable' | 'resilient' | 'antifragile';
  singlePointsOfFailure: string[];
  riskMatrix: { provider: string; risk: 'critical' | 'high' | 'medium' | 'low'; impact: string }[];
  recommendations: string[];
  worstCaseRecoveryTime: string;
}

export function scorePlatformDependency(profile: PlatformDependencyProfile): PlatformDependencyScore {
  let score = 0;
  const spof: string[] = [];
  const riskMatrix: PlatformDependencyScore['riskMatrix'] = [];
  const recommendations: string[] = [];

  // LLM Provider resilience (30 pts)
  if (profile.hasLLMFallback) {
    score += 20;
    if ((profile.llmSwitchTimeMinutes ?? 999) < 5) score += 10;
  } else {
    spof.push(`Single LLM provider: ${profile.primaryLLMProvider}`);
    riskMatrix.push({ provider: profile.primaryLLMProvider, risk: 'critical', impact: 'Total agent outage if API suspended or rate-limited' });
    recommendations.push(`Add ${profile.primaryLLMProvider === 'openai' ? 'Anthropic' : 'OpenAI'} as fallback via AMC Bridge. Switch time target: <5 min.`);
  }

  // Database resilience (25 pts)
  if (profile.hasVectorStoreFallback) score += 10;
  else { spof.push(`Single vector store: ${profile.vectorStoreProvider}`); recommendations.push('Add local fallback vector store (e.g., pgvector) for continuity.'); }
  if (profile.databaseBackupsEnabled) score += 10;
  else { recommendations.push('Enable automated database backups. Without this, a provider incident = permanent data loss.'); }
  if (profile.canRestoreFromBackup) score += 5;

  // Infrastructure (20 pts)
  if (profile.hasMultiRegion) score += 10;
  if (profile.hasSecondaryCloudProvider) score += 10;
  else if (profile.cloudProvider !== 'self-hosted') {
    riskMatrix.push({ provider: profile.cloudProvider, risk: 'high', impact: 'Regional outage or account suspension disables all infrastructure' });
  }

  // Secrets management (15 pts)
  if (profile.apiKeysInVault) score += 5;
  else { spof.push('API keys not in vault — manual rotation required on compromise'); }
  if (profile.apiKeyRotationEnabled) score += 5;
  if (profile.hasBackupKeys) score += 5;

  // Data portability (10 pts)
  if (profile.dataIsPortable) score += 5;
  else { recommendations.push('Ensure data can be exported in open format. Vendor lock-in on data is an existential risk.'); }
  if (profile.dataExportFormatDocumented) score += 3;
  if (profile.vendorLockInAssessed) score += 2;

  const resilience: PlatformDependencyScore['resilience'] =
    score >= 80 ? 'antifragile' :
    score >= 60 ? 'resilient' :
    score >= 35 ? 'vulnerable' :
    'fragile';

  const worstCase =
    !profile.hasLLMFallback && !profile.databaseBackupsEnabled ? '∞ (unrecoverable data loss possible)' :
    !profile.hasLLMFallback ? '4–48 hours (manual provider migration)' :
    (profile.llmSwitchTimeMinutes ?? 999) > 60 ? `${profile.llmSwitchTimeMinutes} minutes` :
    '<5 minutes';

  return { score: Math.min(100, score), resilience, singlePointsOfFailure: spof, riskMatrix, recommendations, worstCaseRecoveryTime: worstCase };
}
