import { z } from "zod";

export const merkleProofPayloadSchema = z.object({
  v: z.literal(1),
  ts: z.number().int(),
  entryHash: z.string().length(64),
  leafIndex: z.number().int().min(0),
  merkleRoot: z.string().length(64),
  proofPath: z.array(
    z.object({
      position: z.enum(["left", "right"]),
      hash: z.string().length(64)
    })
  ),
  rootSignatureFingerprint: z.string().length(64)
});

export const merkleProofSignatureSchema = z.object({
  digestSha256: z.string().length(64),
  signature: z.string().min(1),
  signedTs: z.number().int(),
  signer: z.literal("auditor"),
  envelope: z
    .object({
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
    })
    .optional()
});

export type MerkleProofPayload = z.infer<typeof merkleProofPayloadSchema>;
export type MerkleProofSignature = z.infer<typeof merkleProofSignatureSchema>;
