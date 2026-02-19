import { randomUUID } from 'node:crypto';

export interface Contribution { userId: string; content: string; timestamp: number; }
export interface CollabSessionData { id: string; participants: string[]; contributions: Contribution[]; active: boolean; }
export interface CollabSession { sessionId: string; participants: string[]; active: boolean; }

export class CollaborationManager {
  private sessions = new Map<string, CollabSessionData>();

  createSession(participants: string[]): CollabSessionData {
    const s: CollabSessionData = { id: randomUUID(), participants, contributions: [], active: true };
    this.sessions.set(s.id, s);
    return s;
  }

  addContribution(sessionId: string, userId: string, content: string): Contribution {
    const s = this.sessions.get(sessionId);
    if (!s) throw new Error('Session not found');
    const c: Contribution = { userId, content, timestamp: Date.now() };
    s.contributions.push(c);
    return c;
  }

  getHistory(sessionId: string): Contribution[] {
    return this.sessions.get(sessionId)?.contributions ?? [];
  }

  resolveConflict(sessionId: string, strategy: 'latest-wins' | 'merge' | 'vote'): string {
    const s = this.sessions.get(sessionId);
    if (!s || s.contributions.length === 0) return '';
    if (strategy === 'latest-wins') return s.contributions[s.contributions.length - 1]!.content;
    if (strategy === 'merge') return s.contributions.map(c => c.content).join('\n');
    const freq = new Map<string, number>();
    for (const c of s.contributions) freq.set(c.content, (freq.get(c.content) ?? 0) + 1);
    return [...freq.entries()].sort((a, b) => b[1] - a[1])[0]?.[0] ?? '';
  }
}

export function createCollabSession(participants: string[]): CollabSession {
  return { sessionId: randomUUID(), participants, active: true };
}
