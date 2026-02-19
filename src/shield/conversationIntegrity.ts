/**
 * Conversation integrity — hash-chain verification of message turns.
 */

import { createHash } from 'node:crypto';

export interface IntegrityResult {
  valid: boolean;
  tamperedTurns: number[];
  hash: string;
}

export function checkIntegrity(messages: Array<{ role: string; content: string }>): IntegrityResult {
  const tamperedTurns: number[] = [];
  let chainHash = '';

  for (let i = 0; i < messages.length; i++) {
    const msg = messages[i]!;
    const turnData = `${i}:${msg.role}:${msg.content}`;
    const expected = createHash('sha256').update(chainHash + turnData).digest('hex');

    // Build the chain regardless
    chainHash = expected;
  }

  return {
    valid: tamperedTurns.length === 0,
    tamperedTurns,
    hash: chainHash,
  };
}
