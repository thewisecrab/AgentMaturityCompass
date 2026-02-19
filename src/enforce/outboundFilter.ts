export interface OutboundRules {
  blockApiKeys?: boolean;
  blockEmails?: boolean;
  blockPhones?: boolean;
  blockSSNs?: boolean;
  blockCreditCards?: boolean;
  customPatterns?: RegExp[];
}

export interface Finding {
  type: string;
  match: string;
  index: number;
}

export interface OutboundResult {
  safe: boolean;
  filtered: string;
  findings: Finding[];
  allowed?: boolean;
  quarantined?: boolean;
  reason?: string;
}

const PATTERNS: Array<{ type: string; regex: RegExp }> = [
  { type: 'api_key_sk', regex: /sk-[A-Za-z0-9]{20,}/g },
  { type: 'api_key_ghp', regex: /ghp_[A-Za-z0-9]{20,}/g },
  { type: 'api_key_aws', regex: /AKIA[A-Z0-9]{16}/g },
  { type: 'email', regex: /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g },
  { type: 'phone', regex: /(\+?1[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}/g },
  { type: 'ssn', regex: /\b\d{3}-\d{2}-\d{4}\b/g },
  { type: 'credit_card', regex: /\b(?:\d{4}[-\s]?){3}\d{4}\b/g },
];

export function filterOutbound(content: string, rules?: OutboundRules): OutboundResult {
  const findings: Finding[] = [];
  let filtered = content;
  const r = rules ?? {};

  for (const { type, regex } of PATTERNS) {
    if (type.startsWith('api_key') && r.blockApiKeys === false) continue;
    if (type === 'email' && r.blockEmails === false) continue;
    if (type === 'phone' && r.blockPhones === false) continue;
    if (type === 'ssn' && r.blockSSNs === false) continue;
    if (type === 'credit_card' && r.blockCreditCards === false) continue;

    const re = new RegExp(regex.source, regex.flags);
    let m: RegExpExecArray | null;
    while ((m = re.exec(content)) !== null) {
      findings.push({ type, match: m[0], index: m.index });
    }
    filtered = filtered.replace(new RegExp(regex.source, regex.flags), `[REDACTED:${type}]`);
  }

  if (r.customPatterns) {
    for (const p of r.customPatterns) {
      const re = new RegExp(p.source, p.flags);
      let m: RegExpExecArray | null;
      while ((m = re.exec(content)) !== null) {
        findings.push({ type: 'custom', match: m[0], index: m.index });
      }
      filtered = filtered.replace(new RegExp(p.source, p.flags), '[REDACTED:custom]');
    }
  }

  return { safe: findings.length === 0, filtered, findings };
}

export function checkOutbound(recipient: string, allowlist?: string[]): OutboundResult {
  const allowed = !allowlist || allowlist.length === 0 || allowlist.includes(recipient);
  return {
    safe: allowed, filtered: recipient, findings: [],
    allowed, quarantined: !allowed,
    reason: allowed ? undefined : 'Recipient not in allowlist',
  };
}
