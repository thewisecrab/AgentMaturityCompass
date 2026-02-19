/**
 * Tool health monitoring — predicts tool reliability from history.
 */

export interface CallRecord {
  toolName: string;
  params: Record<string, unknown>;
  succeeded: boolean;
  latencyMs: number;
  errorType?: string;
}

export interface ReliabilityPrediction {
  toolName: string;
  failureProbability: number;
  predictedLatencyMs: number;
  totalHistoricalCalls: number;
  confidence: string;
}

export class ToolReliabilityPredictor {
  private history = new Map<string, CallRecord[]>();

  record(call: CallRecord): void {
    const existing = this.history.get(call.toolName) ?? [];
    existing.push(call);
    this.history.set(call.toolName, existing);
  }

  predict(toolName: string, _params: Record<string, unknown>): ReliabilityPrediction {
    const records = this.history.get(toolName) ?? [];
    if (records.length === 0) {
      return { toolName, failureProbability: 0.1, predictedLatencyMs: 1000, totalHistoricalCalls: 0, confidence: 'none' };
    }

    const failures = records.filter(r => !r.succeeded).length;
    const avgLatency = records.reduce((sum, r) => sum + r.latencyMs, 0) / records.length;

    return {
      toolName,
      failureProbability: failures / records.length,
      predictedLatencyMs: Math.round(avgLatency),
      totalHistoricalCalls: records.length,
      confidence: records.length >= 100 ? 'high' : records.length >= 10 ? 'medium' : 'low',
    };
  }
}
