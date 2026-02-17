import { createCipheriv, createDecipheriv, createHash, randomBytes } from "node:crypto";

const MAGIC = Buffer.from("AMC_BLOB_V1", "ascii");
const NONCE_BYTES = 12;
const AAD_HASH_BYTES = 32;
const SHA_BYTES = 32;
const TAG_BYTES = 16;

export interface BlobEnvelopeV1 {
  blobId: string;
  keyVersion: number;
  nonce: Buffer;
  aadHash: Buffer;
  payloadSha256: string;
  ciphertext: Buffer;
  tag: Buffer;
}

function sha256Bytes(input: Buffer): Buffer {
  return createHash("sha256").update(input).digest();
}

function sha256Hex(input: Buffer): string {
  return createHash("sha256").update(input).digest("hex");
}

function buildAad(blobId: string, keyVersion: number): Buffer {
  return Buffer.from(`${blobId}:${keyVersion}`, "utf8");
}

export function encryptBlobV1(params: {
  blobId: string;
  keyVersion: number;
  key: Buffer;
  plaintext: Buffer;
}): BlobEnvelopeV1 {
  const nonce = randomBytes(NONCE_BYTES);
  const aad = buildAad(params.blobId, params.keyVersion);
  const aadHash = sha256Bytes(aad);
  const payloadSha256 = sha256Hex(params.plaintext);
  const cipher = createCipheriv("aes-256-gcm", params.key, nonce);
  cipher.setAAD(aad);
  const ciphertext = Buffer.concat([cipher.update(params.plaintext), cipher.final()]);
  const tag = cipher.getAuthTag();
  return {
    blobId: params.blobId,
    keyVersion: params.keyVersion,
    nonce,
    aadHash,
    payloadSha256,
    ciphertext,
    tag
  };
}

export function encodeBlobV1(envelope: BlobEnvelopeV1): Buffer {
  const keyVersion = Buffer.alloc(4);
  keyVersion.writeUInt32BE(envelope.keyVersion >>> 0, 0);
  const cipherLength = Buffer.alloc(4);
  cipherLength.writeUInt32BE(envelope.ciphertext.length >>> 0, 0);
  const payloadSha = Buffer.from(envelope.payloadSha256, "hex");
  if (payloadSha.length !== SHA_BYTES) {
    throw new Error("invalid payload sha256 length");
  }
  return Buffer.concat([
    MAGIC,
    keyVersion,
    envelope.nonce,
    envelope.aadHash,
    payloadSha,
    cipherLength,
    envelope.ciphertext,
    envelope.tag
  ]);
}

export function decodeBlobV1(buffer: Buffer, expectedBlobId?: string): BlobEnvelopeV1 {
  let cursor = 0;
  const magic = buffer.subarray(cursor, cursor + MAGIC.length);
  cursor += MAGIC.length;
  if (!magic.equals(MAGIC)) {
    throw new Error("invalid blob magic");
  }
  if (buffer.length < MAGIC.length + 4 + NONCE_BYTES + AAD_HASH_BYTES + SHA_BYTES + 4 + TAG_BYTES) {
    throw new Error("blob payload too short");
  }
  const keyVersion = buffer.readUInt32BE(cursor);
  cursor += 4;
  const nonce = buffer.subarray(cursor, cursor + NONCE_BYTES);
  cursor += NONCE_BYTES;
  const aadHash = buffer.subarray(cursor, cursor + AAD_HASH_BYTES);
  cursor += AAD_HASH_BYTES;
  const payloadSha = buffer.subarray(cursor, cursor + SHA_BYTES);
  cursor += SHA_BYTES;
  const cipherLength = buffer.readUInt32BE(cursor);
  cursor += 4;
  const expectedTotal = MAGIC.length + 4 + NONCE_BYTES + AAD_HASH_BYTES + SHA_BYTES + 4 + cipherLength + TAG_BYTES;
  if (buffer.length !== expectedTotal) {
    throw new Error("blob payload length mismatch");
  }
  const ciphertext = buffer.subarray(cursor, cursor + cipherLength);
  cursor += cipherLength;
  const tag = buffer.subarray(cursor, cursor + TAG_BYTES);
  if (tag.length !== TAG_BYTES) {
    throw new Error("missing blob auth tag");
  }

  const blobId = expectedBlobId ?? "unknown";
  return {
    blobId,
    keyVersion,
    nonce: Buffer.from(nonce),
    aadHash: Buffer.from(aadHash),
    payloadSha256: payloadSha.toString("hex"),
    ciphertext: Buffer.from(ciphertext),
    tag: Buffer.from(tag)
  };
}

export function decryptBlobV1(params: {
  blobId: string;
  key: Buffer;
  envelope: BlobEnvelopeV1;
}): Buffer {
  const aad = buildAad(params.blobId, params.envelope.keyVersion);
  const aadHash = sha256Bytes(aad);
  if (!aadHash.equals(params.envelope.aadHash)) {
    throw new Error("blob aad hash mismatch");
  }
  const decipher = createDecipheriv("aes-256-gcm", params.key, params.envelope.nonce);
  decipher.setAAD(aad);
  decipher.setAuthTag(params.envelope.tag);
  const plaintext = Buffer.concat([decipher.update(params.envelope.ciphertext), decipher.final()]);
  const sha = sha256Hex(plaintext);
  if (sha !== params.envelope.payloadSha256) {
    throw new Error("blob payload hash mismatch");
  }
  return plaintext;
}

export function blobMagicV1(): string {
  return MAGIC.toString("ascii");
}

