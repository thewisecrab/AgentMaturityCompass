import { createCipheriv, createDecipheriv, randomBytes, scryptSync } from "node:crypto";

export interface BackupEncryptionEnvelope {
  scheme: "PASSPHRASE_AES_256_GCM";
  saltB64: string;
  nonceB64: string;
  kdf: {
    name: "scrypt";
    N: number;
    r: number;
    p: number;
  };
}

const KDF_DEFAULTS = {
  N: 16384,
  r: 8,
  p: 1
} as const;

interface KdfParams {
  N: number;
  r: number;
  p: number;
}

function deriveKey(passphrase: string, salt: Buffer, params: KdfParams = KDF_DEFAULTS): Buffer {
  return scryptSync(passphrase, salt, 32, {
    N: params.N,
    r: params.r,
    p: params.p
  });
}

export function encryptBackupPayload(payload: Buffer, passphrase: string): {
  encrypted: Buffer;
  envelope: BackupEncryptionEnvelope;
} {
  const salt = randomBytes(16);
  const nonce = randomBytes(12);
  const key = deriveKey(passphrase, salt);
  const cipher = createCipheriv("aes-256-gcm", key, nonce);
  const ciphertext = Buffer.concat([cipher.update(payload), cipher.final()]);
  const tag = cipher.getAuthTag();
  return {
    encrypted: Buffer.concat([ciphertext, tag]),
    envelope: {
      scheme: "PASSPHRASE_AES_256_GCM",
      saltB64: salt.toString("base64"),
      nonceB64: nonce.toString("base64"),
      kdf: {
        name: "scrypt",
        N: KDF_DEFAULTS.N,
        r: KDF_DEFAULTS.r,
        p: KDF_DEFAULTS.p
      }
    }
  };
}

export function decryptBackupPayload(params: {
  encrypted: Buffer;
  passphrase: string;
  envelope: BackupEncryptionEnvelope;
}): Buffer {
  if (params.encrypted.length < 16) {
    throw new Error("encrypted backup payload too short");
  }
  const salt = Buffer.from(params.envelope.saltB64, "base64");
  const nonce = Buffer.from(params.envelope.nonceB64, "base64");
  const key = deriveKey(params.passphrase, salt, {
    N: params.envelope.kdf.N,
    r: params.envelope.kdf.r,
    p: params.envelope.kdf.p
  });
  const ciphertext = params.encrypted.subarray(0, params.encrypted.length - 16);
  const tag = params.encrypted.subarray(params.encrypted.length - 16);
  const decipher = createDecipheriv("aes-256-gcm", key, nonce);
  decipher.setAuthTag(tag);
  return Buffer.concat([decipher.update(ciphertext), decipher.final()]);
}
