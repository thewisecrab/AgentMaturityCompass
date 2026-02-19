export interface ABACCondition {
  attribute: string;
  operator: 'eq' | 'neq' | 'in' | 'contains' | 'gt' | 'lt' | 'exists';
  value: unknown;
}

export interface ABACPolicy {
  id: string;
  effect: 'allow' | 'deny';
  logic?: 'AND' | 'OR';
  conditions: ABACCondition[];
}

export interface ABACRequest {
  subject: Record<string, unknown>;
  resource: Record<string, unknown>;
  action: string;
  environment?: Record<string, unknown>;
}

export interface ABACResult {
  allowed: boolean;
  matchedPolicies: string[];
  matchedAttributes: string[];
  reason: string;
}

function evalCondition(cond: ABACCondition, attrs: Record<string, unknown>): boolean {
  const val = attrs[cond.attribute];
  switch (cond.operator) {
    case 'eq': return val === cond.value;
    case 'neq': return val !== cond.value;
    case 'in': return Array.isArray(cond.value) && (cond.value as unknown[]).includes(val);
    case 'contains': return typeof val === 'string' && typeof cond.value === 'string' && val.includes(cond.value);
    case 'gt': return typeof val === 'number' && typeof cond.value === 'number' && val > cond.value;
    case 'lt': return typeof val === 'number' && typeof cond.value === 'number' && val < cond.value;
    case 'exists': return val !== undefined && val !== null;
    default: return false;
  }
}

export function checkAccess(request: ABACRequest, policies: ABACPolicy[]): ABACResult {
  const allAttrs = { ...request.subject, ...request.resource, action: request.action, ...(request.environment || {}) };
  const matchedPolicies: string[] = [];
  const matchedAttributes: string[] = [];
  let hasAllow = false;
  let hasDeny = false;

  for (const policy of policies) {
    const logic = policy.logic || 'AND';
    const results = policy.conditions.map(c => evalCondition(c, allAttrs));

    const matches = logic === 'AND' ? results.every(Boolean) : results.some(Boolean);
    if (matches) {
      matchedPolicies.push(policy.id);
      for (const c of policy.conditions) matchedAttributes.push(c.attribute);
      if (policy.effect === 'deny') hasDeny = true;
      else hasAllow = true;
    }
  }

  // deny-overrides
  const allowed = hasDeny ? false : hasAllow;
  return {
    allowed,
    matchedPolicies,
    matchedAttributes: [...new Set(matchedAttributes)],
    reason: hasDeny ? 'Denied by policy' : hasAllow ? 'Allowed by policy' : 'No matching policy (default deny)',
  };
}

export function checkABAC(subjectAttrs: Record<string, string>, requiredAttrs: Record<string, string>): ABACResult {
  const matched: string[] = [];
  for (const [k, v] of Object.entries(requiredAttrs)) {
    if (subjectAttrs[k] === v) matched.push(k);
  }
  return {
    allowed: matched.length === Object.keys(requiredAttrs).length,
    matchedPolicies: [],
    matchedAttributes: matched,
    reason: matched.length === Object.keys(requiredAttrs).length ? 'All attributes matched' : 'Missing attributes',
  };
}
