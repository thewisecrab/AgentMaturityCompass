export function mechanicSimulatorGate(params: {
  integrityIndex: number;
  correlationRatio: number;
  minIntegrity?: number;
  minCorrelation?: number;
}): { ok: boolean; reasons: string[] } {
  const reasons: string[] = [];
  const minIntegrity = params.minIntegrity ?? 0.85;
  const minCorrelation = params.minCorrelation ?? 0.9;
  if (params.integrityIndex < minIntegrity) {
    reasons.push(`integrity index below threshold (${params.integrityIndex.toFixed(3)} < ${minIntegrity.toFixed(3)})`);
  }
  if (params.correlationRatio < minCorrelation) {
    reasons.push(`correlation ratio below threshold (${params.correlationRatio.toFixed(3)} < ${minCorrelation.toFixed(3)})`);
  }
  return {
    ok: reasons.length === 0,
    reasons
  };
}
