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

    return { decision, reasons, matchedRules, stepUpRequired };
  }

  listPolicies(): PolicyRule[] {
    return [...this.rules];
  }
}
