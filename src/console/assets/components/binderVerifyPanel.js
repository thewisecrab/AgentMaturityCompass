import { renderControlStatusChip } from "./controlStatusChip.js";

function esc(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

export function renderBinderVerifyPanel(verify) {
  if (!verify) {
    return "<div class='muted'>No verification result.</div>";
  }
  const errors = Array.isArray(verify.errors) ? verify.errors : [];
  return `
    <div class="card">
      <div class="row wrap">
        <strong>Verification</strong>
        ${renderControlStatusChip(verify.ok ? "PASS" : "FAIL")}
      </div>
      <div class="muted">sha256: <code>${esc(verify.fileSha256 || "-")}</code></div>
      <div class="muted">binderId: <code>${esc(verify.binder?.binderId || "-")}</code></div>
      <div class="muted">proofs: ${renderControlStatusChip(verify.proofsValid ? "PASS" : "FAIL")}</div>
      <div class="muted">pii-scan: ${renderControlStatusChip(verify.piiScanValid ? "PASS" : "FAIL")}</div>
      <div class="muted">signature: ${renderControlStatusChip(verify.signatureValid ? "PASS" : "FAIL")}</div>
      <div class="muted">digest: ${renderControlStatusChip(verify.digestValid ? "PASS" : "FAIL")}</div>
      <div class="muted">binding: ${renderControlStatusChip(verify.bindingValid ? "PASS" : "FAIL")}</div>
      <pre class="scroll">${esc(JSON.stringify(errors, null, 2))}</pre>
    </div>
  `;
}
