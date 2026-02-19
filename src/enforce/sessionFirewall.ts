export type SessionState = 'active' | 'suspended' | 'terminated';

export interface SessionRecord {
  sessionId: string;
  state: SessionState;
  createdAt: number;
  lastActivity: number;
  metadata: Record<string, string>;
}

export interface SessionFirewallResult {
  allowed: boolean;
  reason: string;
}

export class SessionFirewall {
  private sessions = new Map<string, SessionRecord>();

  createSession(sessionId: string, metadata: Record<string, string> = {}): SessionRecord {
    const record: SessionRecord = {
      sessionId, state: 'active', createdAt: Date.now(), lastActivity: Date.now(), metadata,
    };
    this.sessions.set(sessionId, record);
    return record;
  }

  checkSession(sessionId: string, action: string): SessionFirewallResult {
    const session = this.sessions.get(sessionId);
    if (!session) return { allowed: false, reason: 'Session not found' };

    if (session.state === 'terminated') {
      return { allowed: false, reason: 'Session is terminated' };
    }

    if (session.state === 'suspended') {
      if (action === 'read') {
        return { allowed: true, reason: 'Read allowed in suspended state' };
      }
      return { allowed: false, reason: 'Only read actions allowed in suspended state' };
    }

    session.lastActivity = Date.now();
    return { allowed: true, reason: 'Session is active' };
  }

  suspendSession(sessionId: string): boolean {
    const session = this.sessions.get(sessionId);
    if (!session || session.state !== 'active') return false;
    session.state = 'suspended';
    return true;
  }

  terminateSession(sessionId: string): boolean {
    const session = this.sessions.get(sessionId);
    if (!session || session.state === 'terminated') return false;
    session.state = 'terminated';
    return true;
  }

  getState(sessionId: string): SessionState | null {
    return this.sessions.get(sessionId)?.state ?? null;
  }
}

const defaultFirewall = new SessionFirewall();

export function checkSessionTransfer(fromSession: string, toSession: string): SessionFirewallResult {
  const fromState = defaultFirewall.getState(fromSession);
  if (fromState === 'terminated' || fromState === 'suspended') {
    return { allowed: false, reason: 'Source session is not active' };
  }
  const samePrefix = fromSession.split('-')[0] === toSession.split('-')[0];
  return { allowed: samePrefix, reason: samePrefix ? 'Same trust boundary' : 'Cross-boundary transfer blocked' };
}
