import { verify } from "node:crypto";
import { canonicalize } from "../../utils/json.js";

export interface CompactSamlAssertion {
  issuer: string;
  audience: string;
  inResponseTo: string;
  subject: string;
  email: string;
  name?: string;
  groups?: string[];
  notBefore?: number;
  notOnOrAfter?: number;
  signature: string;
}

function fromBase64Url(value: string): Buffer {
  const normalized = value.replace(/-/g, "+").replace(/_/g, "/");
  const pad = normalized.length % 4 === 0 ? "" : "=".repeat(4 - (normalized.length % 4));
  return Buffer.from(`${normalized}${pad}`, "base64");
}

export function parseCompactSamlResponse(rawBase64: string): CompactSamlAssertion {
  const decoded = Buffer.from(rawBase64, "base64").toString("utf8");
  return JSON.parse(decoded) as CompactSamlAssertion;
}

export function verifyCompactSamlAssertion(params: {
  assertion: CompactSamlAssertion;
  idpIssuer: string;
  expectedAudience: string;
  inResponseTo: string;
  idpCertPem: string;
  acceptedClockSkewMs: number;
}): { ok: true; assertion: CompactSamlAssertion } | { ok: false; error: string } {
  try {
    if (params.assertion.issuer !== params.idpIssuer) {
      return { ok: false, error: "issuer mismatch" };
    }
    if (params.assertion.audience !== params.expectedAudience) {
      return { ok: false, error: "audience mismatch" };
    }
    if (params.assertion.inResponseTo !== params.inResponseTo) {
      return { ok: false, error: "inResponseTo mismatch" };
    }
    const now = Date.now();
    const skew = Math.max(0, params.acceptedClockSkewMs);
    if (typeof params.assertion.notBefore === "number" && now + skew < params.assertion.notBefore) {
      return { ok: false, error: "assertion not yet valid" };
    }
    if (typeof params.assertion.notOnOrAfter === "number" && now - skew >= params.assertion.notOnOrAfter) {
      return { ok: false, error: "assertion expired" };
    }
    const signature = params.assertion.signature;
    const payloadWithoutSig = {
      ...params.assertion,
      signature: undefined
    };
    const payloadBytes = Buffer.from(canonicalize(payloadWithoutSig), "utf8");
    const valid = verify(null, payloadBytes, params.idpCertPem, fromBase64Url(signature));
    if (!valid) {
      return { ok: false, error: "assertion signature invalid" };
    }
    return { ok: true, assertion: params.assertion };
  } catch (error) {
    return { ok: false, error: String(error) };
  }
}
