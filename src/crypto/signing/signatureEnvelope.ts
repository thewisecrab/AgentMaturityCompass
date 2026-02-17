import { z } from "zod";
import { verify } from "node:crypto";
import type { SignatureEnvelope } from "./signerTypes.js";

export const signatureEnvelopeSchema = z.object({
  v: z.literal(1),
  alg: z.literal("ed25519"),
  pubkeyB64: z.string().min(1),
  fingerprint: z.string().length(64),
  sigB64: z.string().min(1),
  signedTs: z.number().int(),
  signer: z.object({
    type: z.enum(["VAULT", "NOTARY"]),
    attestationLevel: z.enum(["SOFTWARE", "HARDWARE"]),
    notaryFingerprint: z.string().length(64).optional()
  })
});

export function verifySignatureEnvelope(digestHex: string, envelope: SignatureEnvelope): boolean {
  try {
    const parsed = signatureEnvelopeSchema.parse(envelope);
    const pubPem = Buffer.from(parsed.pubkeyB64, "base64").toString("utf8");
    return verify(
      null,
      Buffer.from(digestHex, "hex"),
      pubPem,
      Buffer.from(parsed.sigB64, "base64")
    );
  } catch {
    return false;
  }
}

