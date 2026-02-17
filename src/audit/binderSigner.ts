import { canonicalize } from "../utils/json.js";
import { sha256Hex } from "../utils/hash.js";
import { signSerializedPayloadWithAuditor } from "../org/orgSigner.js";
import { binderSignatureSchema, type AuditBinderJson } from "./binderSchema.js";

export function signBinderJson(workspace: string, binder: AuditBinderJson) {
  const canonical = canonicalize(binder);
  const signed = signSerializedPayloadWithAuditor(workspace, canonical);
  return binderSignatureSchema.parse({
    digestSha256: sha256Hex(Buffer.from(canonical, "utf8")),
    signature: signed.signature,
    signedTs: signed.signedTs,
    signer: "auditor",
    envelope: signed.envelope
  });
}
