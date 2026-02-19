import { generateKeyPairSync, sign, verify, KeyObject, createHash } from 'node:crypto';

export interface SignResult {
  signature: Buffer;
  signedAt: string;
  algorithm: string;
}

export interface VerifyResult {
  valid: boolean;
  algorithm: string;
  verifiedAt: string;
}

export function generateKeyPair(): { publicKey: KeyObject; privateKey: KeyObject } {
  return generateKeyPairSync('ed25519');
}

export function signSkill(skillCode: string, privateKey: KeyObject): SignResult {
  const data = Buffer.from(skillCode, 'utf-8');
  const signature = sign(null, data, privateKey);
  return {
    signature,
    signedAt: new Date().toISOString(),
    algorithm: 'ed25519',
  };
}

export function verifySkill(skillCode: string, signature: Buffer, publicKey: KeyObject): VerifyResult {
  const data = Buffer.from(skillCode, 'utf-8');
  const valid = verify(null, data, publicKey, signature);
  return {
    valid,
    algorithm: 'ed25519',
    verifiedAt: new Date().toISOString(),
  };
}
