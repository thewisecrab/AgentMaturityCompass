import { randomUUID } from 'node:crypto';

export interface FailureRecord { id: string; message: string; stack?: string; code?: string; timestamp: number; }
export interface Cluster { id: string; pattern: string; failures: FailureRecord[]; }
export interface FailureCluster { clusterId: string; pattern: string; count: number; }

export class FailureClusterer {
  private failures: FailureRecord[] = [];

  addFailure(error: { message: string; stack?: string; code?: string }): string {
    const id = randomUUID();
    this.failures.push({ id, ...error, timestamp: Date.now() });
    return id;
  }

  getClusters(): Cluster[] {
    const groups = new Map<string, FailureRecord[]>();
    for (const f of this.failures) {
      const normalized = f.message.replace(/\b[0-9a-f-]{8,}\b/gi, '<ID>').replace(/\d+/g, '<N>').split(':')[0]!.trim();
      const key = f.code ?? normalized;
      if (!groups.has(key)) groups.set(key, []);
      groups.get(key)!.push(f);
    }
    return [...groups.entries()].map(([pattern, failures]) => ({ id: randomUUID(), pattern, failures }));
  }

  getSimilarFailures(error: { message: string }): FailureRecord[] {
    const norm = error.message.replace(/\d+/g, '<N>').split(':')[0]!.trim();
    return this.failures.filter(f => f.message.replace(/\d+/g, '<N>').split(':')[0]!.trim() === norm);
  }

  getRootCause(clusterId: string): string {
    const clusters = this.getClusters();
    const c = clusters.find(cl => cl.id === clusterId);
    return c?.pattern ?? 'Unknown';
  }
}

export function clusterFailures(errors: string[]): FailureCluster[] {
  return [{ clusterId: randomUUID(), pattern: errors[0] ?? 'unknown', count: errors.length }];
}
