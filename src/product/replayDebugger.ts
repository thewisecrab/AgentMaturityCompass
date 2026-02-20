/**
 * replayDebugger.ts — Session replay with cursor-based playback,
 * step forward/backward, seek, and snapshot export.
 */

import { randomUUID } from 'node:crypto';

/* ── Interfaces ──────────────────────────────────────────────────── */

export interface ReplayEvent {
  eventId: string;
  type: string;
  timestamp: number;
  data: unknown;
  metadata: Record<string, unknown>;
}

/** Backward-compat shape from stubs.ts (extended) */
export interface ReplaySession { sessionId: string; events: unknown[]; replaying: boolean; }

export interface ReplaySnapshot {
  sessionId: string;
  events: ReplayEvent[];
  cursor: number;
  playing: boolean;
  totalEvents: number;
  currentEvent: ReplayEvent | null;
}

/* ── Class ───────────────────────────────────────────────────────── */

interface InternalSession {
  sessionId: string;
  events: ReplayEvent[];
  cursor: number;
  playing: boolean;
  speed: number;
  createdAt: number;
}

export class ReplayDebugger {
  private sessions = new Map<string, InternalSession>();

  createSession(events: Array<{ type: string; data: unknown; metadata?: Record<string, unknown> }>): string {
    const sessionId = randomUUID();
    const replayEvents: ReplayEvent[] = events.map((e, i) => ({
      eventId: randomUUID(),
      type: e.type,
      timestamp: Date.now() + i,
      data: e.data,
      metadata: e.metadata ?? {},
    }));
    this.sessions.set(sessionId, {
      sessionId, events: replayEvents, cursor: 0,
      playing: false, speed: 1, createdAt: Date.now(),
    });
    return sessionId;
  }

  addEvent(sessionId: string, type: string, data: unknown, metadata: Record<string, unknown> = {}): ReplayEvent {
    const session = this.sessions.get(sessionId);
    if (!session) throw new Error(`Session ${sessionId} not found`);
    const event: ReplayEvent = {
      eventId: randomUUID(), type, timestamp: Date.now(),
      data, metadata,
    };
    session.events.push(event);
    return event;
  }

  play(sessionId: string, speed = 1): ReplaySnapshot {
    const session = this.sessions.get(sessionId);
    if (!session) throw new Error(`Session ${sessionId} not found`);
    session.playing = true;
    session.speed = speed;
    return this.buildSnapshot(session);
  }

  pause(sessionId: string): ReplaySnapshot {
    const session = this.sessions.get(sessionId);
    if (!session) throw new Error(`Session ${sessionId} not found`);
    session.playing = false;
    return this.buildSnapshot(session);
  }

  stepForward(sessionId: string): ReplaySnapshot {
    const session = this.sessions.get(sessionId);
    if (!session) throw new Error(`Session ${sessionId} not found`);
    if (session.cursor < session.events.length - 1) {
      session.cursor++;
    }
    return this.buildSnapshot(session);
  }

  stepBackward(sessionId: string): ReplaySnapshot {
    const session = this.sessions.get(sessionId);
    if (!session) throw new Error(`Session ${sessionId} not found`);
    if (session.cursor > 0) {
      session.cursor--;
    }
    return this.buildSnapshot(session);
  }

  seek(sessionId: string, cursor: number): ReplaySnapshot {
    const session = this.sessions.get(sessionId);
    if (!session) throw new Error(`Session ${sessionId} not found`);
    session.cursor = Math.max(0, Math.min(cursor, session.events.length - 1));
    return this.buildSnapshot(session);
  }

  getSnapshot(sessionId: string): ReplaySnapshot {
    const session = this.sessions.get(sessionId);
    if (!session) throw new Error(`Session ${sessionId} not found`);
    return this.buildSnapshot(session);
  }

  exportSession(sessionId: string): string {
    const session = this.sessions.get(sessionId);
    if (!session) throw new Error(`Session ${sessionId} not found`);
    return JSON.stringify({
      sessionId: session.sessionId,
      events: session.events,
      createdAt: session.createdAt,
      exportedAt: Date.now(),
    }, null, 2);
  }

  listSessions(): Array<{ sessionId: string; eventCount: number; playing: boolean }> {
    return [...this.sessions.values()].map(s => ({
      sessionId: s.sessionId, eventCount: s.events.length, playing: s.playing,
    }));
  }

  private buildSnapshot(session: InternalSession): ReplaySnapshot {
    return {
      sessionId: session.sessionId,
      events: session.events,
      cursor: session.cursor,
      playing: session.playing,
      totalEvents: session.events.length,
      currentEvent: session.events[session.cursor] ?? null,
    };
  }
}

/* ── Legacy compat ───────────────────────────────────────────────── */

export function createReplaySession(events: unknown[]): ReplaySession {
  return { sessionId: randomUUID(), events, replaying: false };
}
