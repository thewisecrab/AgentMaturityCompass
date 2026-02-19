import { randomUUID } from 'node:crypto';

export interface UserUsage { userId: string; callsPerWeek: number[]; lastActiveMs: number; engagementScore: number; }
export interface AtRiskUser { userId: string; risk: 'low' | 'medium' | 'high'; reasons: string[]; }
export interface RetentionAction { actionId: string; trigger: string; action: string; }

const actions = new Map<string, { userId: string; action: string; timestamp: number }>();

export function identifyAtRisk(usageData: UserUsage[]): AtRiskUser[] {
  const results: AtRiskUser[] = [];
  const now = Date.now();
  for (const u of usageData) {
    const reasons: string[] = [];
    // Declining usage
    if (u.callsPerWeek.length >= 2) {
      const recent = u.callsPerWeek.slice(-2);
      if (recent[1]! < recent[0]! * 0.5) reasons.push('Usage declined >50%');
    }
    // Long gap
    const daysSinceActive = (now - u.lastActiveMs) / 86400000;
    if (daysSinceActive > 14) reasons.push(`Inactive for ${Math.round(daysSinceActive)} days`);
    // Low engagement
    if (u.engagementScore < 0.3) reasons.push('Low engagement score');
    if (reasons.length > 0) {
      const risk = reasons.length >= 3 ? 'high' : reasons.length >= 2 ? 'medium' : 'low';
      results.push({ userId: u.userId, risk, reasons });
    }
  }
  return results.sort((a, b) => (b.risk === 'high' ? 3 : b.risk === 'medium' ? 2 : 1) - (a.risk === 'high' ? 3 : a.risk === 'medium' ? 2 : 1));
}

export function triggerRetentionAction(userId: string, action: string): string {
  const id = randomUUID();
  actions.set(id, { userId, action, timestamp: Date.now() });
  return id;
}

export function getRetentionMetrics(): { totalActions: number; activeActions: number } {
  return { totalActions: actions.size, activeActions: actions.size };
}

export function createRetentionAction(trigger: string, action: string): RetentionAction {
  return { actionId: randomUUID(), trigger, action };
}
