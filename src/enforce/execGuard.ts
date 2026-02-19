/**
 * Shell execution guard — blocks dangerous commands.
 */

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
      return { allowed: false, blockedPattern: pattern };
    }
  }
  return { allowed: true };
}
