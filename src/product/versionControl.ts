import { randomUUID } from 'node:crypto';

export interface Snapshot { version: number; agentId: string; config: unknown; message: string; timestamp: number; }
export interface VersionRecord { versionId: string; version: number; timestamp: Date; }

export class VersionControl {
  private history = new Map<string, Snapshot[]>();

  commit(agentId: string, config: unknown, message: string): Snapshot {
    if (!this.history.has(agentId)) this.history.set(agentId, []);
    const snaps = this.history.get(agentId)!;
    const snap: Snapshot = { version: snaps.length + 1, agentId, config: JSON.parse(JSON.stringify(config)), message, timestamp: Date.now() };
    snaps.push(snap);
    return snap;
  }

  diff(v1: number, v2: number, agentId: string): { added: string[]; removed: string[]; changed: string[] } {
    const snaps = this.history.get(agentId) ?? [];
    const s1 = snaps.find(s => s.version === v1);
    const s2 = snaps.find(s => s.version === v2);
    if (!s1 || !s2) throw new Error('Version not found');
    const keys1 = Object.keys(s1.config as Record<string, unknown>);
    const keys2 = Object.keys(s2.config as Record<string, unknown>);
    const added = keys2.filter(k => !keys1.includes(k));
    const removed = keys1.filter(k => !keys2.includes(k));
    const changed = keys1.filter(k => keys2.includes(k) && JSON.stringify((s1.config as Record<string, unknown>)[k]) !== JSON.stringify((s2.config as Record<string, unknown>)[k]));
    return { added, removed, changed };
  }

  rollback(agentId: string, version: number): Snapshot | undefined {
    const snaps = this.history.get(agentId) ?? [];
    return snaps.find(s => s.version === version);
  }

  log(agentId: string): Snapshot[] { return [...(this.history.get(agentId) ?? [])].reverse(); }
}

export function createVersion(resourceId: string, version: number): VersionRecord {
  return { versionId: `${resourceId}_v${version}`, version, timestamp: new Date() };
}
