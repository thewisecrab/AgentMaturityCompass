import { randomUUID } from 'node:crypto';

export interface ReplayEvent { id: string; type: string; data: unknown; timestamp: number; }
export interface Recording { id: string; agentId: string; events: ReplayEvent[]; startedAt: number; }
export interface ReplaySession { sessionId: string; events: unknown[]; replaying: boolean; }

export class ReplayDebugger {
  private recordings = new Map<string, Recording>();

  recordSession(agentId: string): string {
    const id = randomUUID();
    this.recordings.set(id, { id, agentId, events: [], startedAt: Date.now() });
    return id;
  }

  addEvent(sessionId: string, event: { type: string; data: unknown }): ReplayEvent {
    const rec = this.recordings.get(sessionId);
    if (!rec) throw new Error('Recording not found');
    const e: ReplayEvent = { id: randomUUID(), ...event, timestamp: Date.now() };
    rec.events.push(e);
    return e;
  }

  replaySession(sessionId: string): ReplayEvent[] {
    const rec = this.recordings.get(sessionId);
    if (!rec) throw new Error('Recording not found');
    return [...rec.events].sort((a, b) => a.timestamp - b.timestamp);
  }

  diffSessions(a: string, b: string): { onlyInA: ReplayEvent[]; onlyInB: ReplayEvent[]; common: number } {
    const recA = this.recordings.get(a);
    const recB = this.recordings.get(b);
    if (!recA || !recB) throw new Error('Recording not found');
    const typesA = new Set(recA.events.map(e => e.type));
    const typesB = new Set(recB.events.map(e => e.type));
    const common = [...typesA].filter(t => typesB.has(t)).length;
    return {
      onlyInA: recA.events.filter(e => !typesB.has(e.type)),
      onlyInB: recB.events.filter(e => !typesA.has(e.type)),
      common,
    };
  }

  exportReplay(sessionId: string): string {
    const rec = this.recordings.get(sessionId);
    if (!rec) throw new Error('Recording not found');
    return JSON.stringify(rec, null, 2);
  }
}

export function createReplaySession(events: unknown[]): ReplaySession {
  return { sessionId: randomUUID(), events, replaying: false };
}
