/**
 * Download quarantine — validates downloads before allowing.
 */

import { createHash } from 'node:crypto';
import { emitGuardEvent } from '../enforce/evidenceEmitter.js';

export interface QuarantineResult {
  allowed: boolean;
  reason: string;
  hash: string;
}

const BLOCKED_DOMAINS = ['malware.example.com', 'phishing.example.org'];
const BLOCKED_EXTENSIONS = new Set(['.exe', '.bat', '.cmd', '.ps1', '.msi', '.scr']);

export function quarantineCheck(url: string, filename: string): QuarantineResult {
  const hash = createHash('sha256').update(`${url}:${filename}`).digest('hex');

  for (const domain of BLOCKED_DOMAINS) {
    if (url.includes(domain)) {
      emitGuardEvent({ agentId: 'system', moduleCode: 'S13', decision: 'allow', reason: 'S13 decision', severity: 'high' });
      return { allowed: false, reason: `Blocked domain: ${domain}`, hash };
    }
  }

  const ext = filename.slice(filename.lastIndexOf('.')).toLowerCase();
  if (BLOCKED_EXTENSIONS.has(ext)) {
    emitGuardEvent({ agentId: 'system', moduleCode: 'S13', decision: 'allow', reason: 'S13 decision', severity: 'high' });
    return { allowed: false, reason: `Blocked file extension: ${ext}`, hash };
  }

  if (!url.startsWith('https://')) {
    emitGuardEvent({ agentId: 'system', moduleCode: 'S13', decision: 'allow', reason: 'S13 decision', severity: 'high' });
    return { allowed: false, reason: 'Non-HTTPS download blocked', hash };
  }

  emitGuardEvent({ agentId: 'system', moduleCode: 'S13', decision: 'allow', reason: 'S13 decision', severity: 'high' });
  return { allowed: true, reason: 'Passed quarantine checks', hash };
}