import { renderControlStatusChip } from "./controlStatusChip.js";
import { renderEvidenceRefList } from "./evidenceRefList.js";

function esc(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function itemLabel(item) {
  if (!item || typeof item !== "object") {
    return "unknown";
  }
  if (item.kind === "CONTROL") {
    return `control:${item.controlId}`;
  }
  if (item.kind === "PROOF") {
    return `proof:${item.id}`;
  }
  if (item.kind === "ARTIFACT_HASH") {
    return `artifact:${item.id}@${item.sha256}`;
  }
  return "unknown";
}

export function renderRequestCard(request) {
  const requested = Array.isArray(request?.requestedItems) ? request.requestedItems : [];
  const approvals = Array.isArray(request?.approvals) ? request.approvals : [];
  return `
    <article class="card">
      <div class="row wrap">
        <strong><code>${esc(request?.requestId || "-")}</code></strong>
        ${renderControlStatusChip(request?.status || "OPEN")}
      </div>
      <div class="muted">scope: <code>${esc(request?.scope?.type || "?" )}:${esc(request?.scope?.id || "?")}</code></div>
      <div class="muted">requester: <code>${esc(request?.requesterUserIdHash || "-")}</code></div>
      <div class="muted">items: ${requested.length === 0 ? "none" : requested.map((row) => `<code>${esc(itemLabel(row))}</code>`).join(" ")}</div>
      <div class="muted">approvals: ${approvals.length === 0 ? "none" : approvals.map((row) => `<code>${esc(row.role)}:${esc(row.userIdHash)}</code>`).join(" ")}</div>
      <div class="muted">fulfillment: ${request?.fulfillment ? `<code>${esc(request.fulfillment.binderSha256)}</code>` : "pending"}</div>
      <div class="muted">approval request id: <code>${esc(request?.pendingApprovalRequestId || "-")}</code></div>
      <div class="muted">evidence refs: ${renderEvidenceRefList(approvals.map((row) => row.approvalEventHash))}</div>
    </article>
  `;
}
