import { emitGuardEvent } from './evidenceEmitter.js';
/**
 * Policy firewall — tool-call policy engine.
 */


export type PolicyDecision = 'allow' | 'deny' | 'stepup' | 'sanitize' | 'quarantine';

export interface PolicyResult {
  decision: PolicyDecision;
  reasons: string[];
  matchedRules: string[];
  stepUpRequired: boolean;
}

export interface PolicyRule {
  id: string;
  pattern: string;
  action: PolicyDecision;
  riskTier?: string;
}

export class PolicyFirewall {
  private rules: PolicyRule[] = [];

  addRule(rule: PolicyRule): void {
    this.rules.push(rule);
  }

  evaluate(toolName: string, args: Record<string, unknown>, _context?: Record<string, unknown>): PolicyResult {
    const reasons: string[] = [];
    const matchedRules: string[] = [];
    let decision: PolicyDecision = 'allow';
    let stepUpRequired = false;

    for (const rule of this.rules) {
      const re = new RegExp(rule.pattern, 'i');
      const argsStr = JSON.stringify(args);
      if (re.test(toolName) || re.test(argsStr)) {
        matchedRules.push(rule.id);
        reasons.push(`Rule ${rule.id} matched: ${rule.pattern}`);
        if (rule.action === 'deny') decision = 'deny';
        else if (rule.action === 'stepup') { decision = 'stepup'; stepUpRequired = true; }
        else if (rule.action === 'quarantine' && decision !== 'deny') decision = 'quarantine';
        else if (rule.action === 'sanitize' && decision === 'allow') decision = 'sanitize';
      }
    }

    const result = { decision, reasons, matchedRules, stepUpRequired };
    emitGuardEvent({
      agentId: _context?.agentId as string ?? 'unknown',
      moduleCode: 'E1',
      decision: decision === 'allow' ? 'allow' : decision === 'deny' ? 'deny' : decision === 'stepup' ? 'stepup' : 'warn',
      reason: reasons.join('; ') || 'no rules matched',
      severity: decision === 'deny' ? 'high' : decision === 'stepup' ? 'medium' : 'low',
      meta: { toolName, matchedRules },
    });
    return result;
  }

  check(agentId: string, tool: string, action: string): PolicyResult {
    return this.evaluate(action, { tool, agentId });
  }

  listPolicies(): PolicyRule[] {
    return [...this.rules];
  }
}
