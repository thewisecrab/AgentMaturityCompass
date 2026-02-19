export interface SecretBlindResult {
  blinded: string;
  secretsFound: number;
  findings: Array<{ type: string; index: number }>;
}

const SECRET_PATTERNS: Array<{ type: string; regex: RegExp }> = [
  { type: 'aws_key', regex: /AKIA[A-Z0-9]{16}/g },
  { type: 'aws_secret', regex: /(?:aws_secret_access_key|AWS_SECRET)["\s:=]+[A-Za-z0-9/+=]{40}/gi },
  { type: 'github_token', regex: /gh[ps]_[A-Za-z0-9]{36,}/g },
  { type: 'github_oauth', regex: /gho_[A-Za-z0-9]{36,}/g },
  { type: 'openai_key', regex: /sk-[A-Za-z0-9]{20,}/g },
  { type: 'slack_token', regex: /xox[bprs]-[A-Za-z0-9-]{10,}/g },
  { type: 'slack_webhook', regex: /hooks\.slack\.com\/services\/T[A-Z0-9]+\/B[A-Z0-9]+\/[A-Za-z0-9]+/g },
  { type: 'jwt', regex: /eyJ[A-Za-z0-9_-]{10,}\.eyJ[A-Za-z0-9_-]{10,}\.[A-Za-z0-9_-]+/g },
  { type: 'private_key', regex: /-----BEGIN (RSA |EC |DSA |OPENSSH )?PRIVATE KEY-----/g },
  { type: 'connection_string', regex: /(mongodb|postgres|mysql|redis|amqp):\/\/[^\s"']+/gi },
  { type: 'generic_api_key', regex: /(?:api[_-]?key|apikey|api_secret)["\s:=]+["']?[A-Za-z0-9_\-]{16,}["']?/gi },
  { type: 'password_in_url', regex: /\/\/[^:]+:[^@]+@/g },
  { type: 'bearer_token', regex: /Bearer\s+[A-Za-z0-9_\-.]{20,}/g },
];

export function blindSecrets(text: string, extraPatterns?: RegExp[]): SecretBlindResult {
  let blinded = text;
  let secretsFound = 0;
  const findings: Array<{ type: string; index: number }> = [];

  for (const { type, regex } of SECRET_PATTERNS) {
    const re = new RegExp(regex.source, regex.flags);
    let m: RegExpExecArray | null;
    while ((m = re.exec(text)) !== null) {
      findings.push({ type, index: m.index });
      secretsFound++;
    }
    blinded = blinded.replace(new RegExp(regex.source, regex.flags), `[SECRET_BLIND:${type}]`);
  }

  if (extraPatterns) {
    for (const p of extraPatterns) {
      const re = new RegExp(p.source, p.flags);
      let m: RegExpExecArray | null;
      while ((m = re.exec(text)) !== null) {
        findings.push({ type: 'custom', index: m.index });
        secretsFound++;
      }
      blinded = blinded.replace(new RegExp(p.source, p.flags), '[SECRET_BLIND:custom]');
    }
  }

  return { blinded, secretsFound, findings };
}
