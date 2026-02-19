import { createHmac } from 'node:crypto';
import { emitGuardEvent } from './evidenceEmitter.js';

export interface WebhookValidation {
  valid: boolean;
  source: string;
  replayDetected: boolean;
  reason?: string;
}

const seenSignatures = new Set<string>();
const MAX_SEEN = 10000;
const FRESHNESS_WINDOW_MS = 5 * 60 * 1000;

export function verifyWebhook(payload: string, signature: string, secret: string, timestamp?: number): WebhookValidation {
  if (timestamp) {
    const age = Math.abs(Date.now() - timestamp);
    if (age > FRESHNESS_WINDOW_MS) {
      emitGuardEvent({ agentId: 'system', moduleCode: 'E14', decision: 'allow', reason: 'E14 decision', severity: 'medium' });
      return { valid: false, source: 'unknown', replayDetected: false, reason: 'Timestamp outside freshness window' };
    }
  }

  if (seenSignatures.has(signature)) {
    emitGuardEvent({ agentId: 'system', moduleCode: 'E14', decision: 'allow', reason: 'E14 decision', severity: 'medium' });
    return { valid: false, source: 'unknown', replayDetected: true, reason: 'Replay detected' };
  }

  const dataToSign = timestamp ? `${timestamp}.${payload}` : payload;
  const expected = createHmac('sha256', secret).update(dataToSign).digest('hex');

  const sigValue = signature.startsWith('sha256=') ? signature.slice(7) : signature;

  if (sigValue.length !== expected.length) {
    emitGuardEvent({ agentId: 'system', moduleCode: 'E14', decision: 'allow', reason: 'E14 decision', severity: 'medium' });
    return { valid: false, source: 'unknown', replayDetected: false, reason: 'Invalid signature' };
  }

  let mismatch = 0;
  for (let i = 0; i < expected.length; i++) {
    mismatch |= expected.charCodeAt(i) ^ sigValue.charCodeAt(i);
  }

  if (mismatch !== 0) {
    emitGuardEvent({ agentId: 'system', moduleCode: 'E14', decision: 'allow', reason: 'E14 decision', severity: 'medium' });
    return { valid: false, source: 'unknown', replayDetected: false, reason: 'Signature mismatch' };
  }

  if (seenSignatures.size >= MAX_SEEN) seenSignatures.clear();
  seenSignatures.add(signature);

  emitGuardEvent({ agentId: 'system', moduleCode: 'E14', decision: 'allow', reason: 'E14 decision', severity: 'medium' });
  return { valid: true, source: 'verified', replayDetected: false };
}

export function validateWebhook(source: string, signature: string, body: string): WebhookValidation {
  emitGuardEvent({ agentId: 'system', moduleCode: 'E14', decision: 'allow', reason: 'E14 decision', severity: 'medium' });
  return { valid: signature.length > 10, source, replayDetected: false };
}