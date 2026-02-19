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
      return { allowed: false, discovered: [], blocked, hostname, reason: '.local resolution blocked by default' };
    }
  }

  if (/[^a-zA-Z0-9._-]/.test(hostname)) {
    blocked.push(hostname);
    return { allowed: false, discovered: [], blocked, hostname, reason: 'Suspicious characters in hostname' };
  }

  const timeWindow = 60000;
  if (entry.count > 100 && (now - entry.firstSeen) < timeWindow) {
    return { allowed: false, discovered: [], blocked: [hostname], hostname, reason: 'Query frequency exceeded threshold' };
  }

  return { allowed: true, discovered: [hostname], blocked: [], hostname };
}

export function scanMdns(): MdnsResult {
  return { allowed: true, discovered: [], blocked: [], hostname: '' };
}
