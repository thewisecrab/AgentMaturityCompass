import { emitGuardEvent } from './evidenceEmitter.js';
export interface MdnsResult {
  allowed: boolean;
  discovered: string[];
  blocked: string[];
  hostname: string;
  reason?: string;
}

const queryLog = new Map<string, { count: number; firstSeen: number; lastSeen: number }>();

export function checkMdnsAccess(hostname: string, allowlist?: string[]): MdnsResult {
  const blocked: string[] = [];
  const now = Date.now();

  const entry = queryLog.get(hostname) || { count: 0, firstSeen: now, lastSeen: now };
  entry.count++;
  entry.lastSeen = now;
  queryLog.set(hostname, entry);

  if (hostname.endsWith('.local')) {
    if (!allowlist || !allowlist.some(a => hostname === a || hostname.endsWith('.' + a))) {
      blocked.push(hostname);
      emitGuardEvent({ agentId: 'system', moduleCode: 'E11', decision: 'allow', reason: 'E11 decision', severity: 'low' });
      return { allowed: false, discovered: [], blocked, hostname, reason: '.local resolution blocked by default' };
    }
  }

  if (/[^a-zA-Z0-9._-]/.test(hostname)) {
    blocked.push(hostname);
    emitGuardEvent({ agentId: 'system', moduleCode: 'E11', decision: 'allow', reason: 'E11 decision', severity: 'low' });
    return { allowed: false, discovered: [], blocked, hostname, reason: 'Suspicious characters in hostname' };
  }

  const timeWindow = 60000;
  if (entry.count > 100 && (now - entry.firstSeen) < timeWindow) {
    emitGuardEvent({ agentId: 'system', moduleCode: 'E11', decision: 'allow', reason: 'E11 decision', severity: 'low' });
    return { allowed: false, discovered: [], blocked: [hostname], hostname, reason: 'Query frequency exceeded threshold' };
  }

  emitGuardEvent({ agentId: 'system', moduleCode: 'E11', decision: 'allow', reason: 'E11 decision', severity: 'low' });
  return { allowed: true, discovered: [hostname], blocked: [], hostname };
}

export function scanMdns(): MdnsResult {
  emitGuardEvent({ agentId: 'system', moduleCode: 'E11', decision: 'allow', reason: 'E11 decision', severity: 'low' });
  return { allowed: true, discovered: [], blocked: [], hostname: '' };
}