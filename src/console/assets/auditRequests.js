import { renderRequestCard } from "./components/requestCard.js";

function esc(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function parseItems(csv) {
  return String(csv || "")
    .split(",")
    .map((row) => row.trim())
    .filter((row) => row.length > 0);
}

export async function renderAuditRequestsPage(params) {
  const listed = await params.apiGet("/audit/requests").catch(() => ({ requests: [] }));
  const requests = Array.isArray(listed?.requests) ? listed.requests : [];

  params.root.innerHTML = [
    params.card(
      "Evidence Requests",
      `
      <div class="row wrap">
        <input id="auditReqScope" value="WORKSPACE" />
        <input id="auditReqScopeId" value="workspace" />
        <input id="auditReqItems" value="control:ACCESS_CONTROL.SSO_SCIM" />
      </div>
      <div class="row wrap">
        <button id="auditReqCreate">Create Request (AUDITOR)</button>
        <button id="auditReqRefresh" class="secondary">Refresh</button>
      </div>
      <p class="muted">Requests can include <code>control:&lt;id&gt;</code>, <code>proof:&lt;proofId&gt;</code>, or <code>artifact:&lt;id&gt;@&lt;sha256&gt;</code>. Fulfillment exports a restricted, privacy-safe binder.</p>
      `
    ),
    params.card(
      `Open/Closed Requests (${requests.length})`,
      requests.length > 0
        ? requests.map((request) => `
            ${renderRequestCard(request)}
            <div class="row wrap">
              <button data-action="approve" data-id="${esc(request.requestId)}">Approve</button>
              <button data-action="reject" data-id="${esc(request.requestId)}" class="secondary">Reject</button>
              <button data-action="fulfill" data-id="${esc(request.requestId)}" class="secondary">Fulfill</button>
            </div>
          `).join("")
        : "<div class='muted'>No requests.</div>"
    )
  ].join("");

  document.getElementById("auditReqRefresh")?.addEventListener("click", async () => {
    await renderAuditRequestsPage(params);
  });

  document.getElementById("auditReqCreate")?.addEventListener("click", async () => {
    const scopeType = (document.getElementById("auditReqScope")?.value || "WORKSPACE").trim();
    const scopeId = (document.getElementById("auditReqScopeId")?.value || "workspace").trim();
    const items = parseItems(document.getElementById("auditReqItems")?.value || "");
    await params.apiPost("/audit/requests/create", {
      scopeType,
      scopeId,
      requestedItems: items
    });
    await renderAuditRequestsPage(params);
  });

  for (const button of Array.from(document.querySelectorAll("button[data-action][data-id]"))) {
    button.addEventListener("click", async () => {
      const action = button.getAttribute("data-action");
      const requestId = button.getAttribute("data-id");
      if (!action || !requestId) {
        return;
      }
      if (action === "approve") {
        await params.apiPost(`/audit/requests/${encodeURIComponent(requestId)}/approve`, {
          reason: "owner approved from audit console"
        });
      } else if (action === "reject") {
        await params.apiPost(`/audit/requests/${encodeURIComponent(requestId)}/reject`, {});
      } else if (action === "fulfill") {
        const outFile = window.prompt("Output .amcaudit path", `.amc/audit/binders/exports/workspace/workspace/request_${requestId}.amcaudit`);
        if (!outFile) {
          return;
        }
        await params.apiPost(`/audit/requests/${encodeURIComponent(requestId)}/fulfill`, {
          outFile: outFile.trim()
        });
      }
      await renderAuditRequestsPage(params);
    });
  }
}
