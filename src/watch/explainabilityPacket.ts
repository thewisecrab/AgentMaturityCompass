/**
 * Explainability packets — structured reasoning provenance.
 */

import { createHash, randomUUID } from 'node:crypto';

export interface ExplainabilityClaim {
  claim: string;
  evidence: string;
  confidence: number;
}

export interface ExplainabilityPacket {
  packetId: string;
  claims: ExplainabilityClaim[];
  digest: string;
  createdAt: Date;
}

export function createPacket(claims: ExplainabilityClaim[]): ExplainabilityPacket {
  const digest = createHash('sha256').update(JSON.stringify(claims)).digest('hex');
  return { packetId: randomUUID(), claims, digest, createdAt: new Date() };
}

export function verifyPacket(packet: ExplainabilityPacket): boolean {
  const expected = createHash('sha256').update(JSON.stringify(packet.claims)).digest('hex');
  return expected === packet.digest;
}
