import { signSerializedPayloadWithAuditor } from "../org/orgSigner.js";
import { verifySignatureEnvelope } from "../crypto/signing/signatureEnvelope.js";
import { getPublicKeyHistory, verifyHexDigestAny } from "../crypto/keys.js";
import { sha256Hex } from "../utils/hash.js";
import { canonicalize } from "../utils/json.js";
import { promptPackSignatureSchema, type PromptPack, type PromptPackSignature } from "./promptPackSchema.js";

export function signPromptPack(workspace: string, pack: PromptPack): PromptPackSignature {
  const signed = signSerializedPayloadWithAuditor(workspace, canonicalize(pack));
  return promptPackSignatureSchema.parse(signed);
}

export function digestPromptPack(pack: PromptPack): string {
  return sha256Hex(Buffer.from(canonicalize(pack), "utf8"));
}

export function verifyPromptPackDigestSignature(params: {
  workspace?: string;
  digestHex: string;
  signature: PromptPackSignature;
  publicKeyPem?: string;
}): boolean {
  if (params.signature.envelope) {
    try {
      return verifySignatureEnvelope(params.digestHex, params.signature.envelope);
    } catch {
      // fallback below
    }
  }
  if (params.publicKeyPem) {
    return verifyHexDigestAny(params.digestHex, params.signature.signature, [params.publicKeyPem]);
  }
  if (params.workspace) {
    return verifyHexDigestAny(params.digestHex, params.signature.signature, getPublicKeyHistory(params.workspace, "auditor"));
  }
  return false;
}
