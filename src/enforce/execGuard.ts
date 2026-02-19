/**
 * Shell execution guard — blocks dangerous commands.
 */

import { emitGuardEvent } from './evidenceEmitter.js';

export interface ExecGuardResult {
  allowed: boolean;
  blockedPattern?: string;
}

const BLOCKED_PATTERNS = [
  'rm -rf /',
  'rm -rf ~',
  'rm -rf *',
  'curl | bash',
  'curl | sh',
  'wget | bash',
  'wget | sh',
  '>/etc/',
  'dd if=',
  'mkfs',
  ':(){:|:&};:',
  'chmod 777 /',
  'chmod -R 777',
  '> /dev/sda',
  'mv /* /dev/null',
];

export function checkExec(command: string): ExecGuardResult {
  const lower = command.toLowerCase().replace(/\s+/g, ' ');
  for (const pattern of BLOCKED_PATTERNS) {
    if (lower.includes(pattern.toLowerCase())) {
      emitGuardEvent({ agentId: 'system', moduleCode: 'E2', decision: 'deny', reason: `Blocked pattern: ${pattern}`, severity: 'critical', meta: { command, pattern } });
      return { allowed: false, blockedPattern: pattern };
    }
  }
  emitGuardEvent({ agentId: 'system', moduleCode: 'E2', decision: 'allow', reason: 'Command allowed', severity: 'low', meta: { command } });
  return { allowed: true };
}
