import { renderKpiCard } from "./components/kpiCard.js";
import { renderValueEvidenceBanner } from "./components/valueEvidenceBanner.js";

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

export async function renderValueKpisPage(params) {
  const agentId = typeof params.currentAgent === "function" ? params.currentAgent() : "default";
  const scope = "agent";
  const id = encodeURIComponent(agentId);
  const snapshot = await params.apiGet(`/value/snapshot/latest?scope=${scope}&id=${id}`).catch(() => null);
  const contract = await params.apiGet(`/value/contracts?scope=${scope}&id=${id}`).catch(() => null);
  const cards = Array.isArray(snapshot?.kpis) ? snapshot.kpis.map((row) => renderKpiCard(row)).join("") : "";

  params.root.innerHTML = [
    renderValueEvidenceBanner(snapshot),
    params.card(
      "KPI Contract",
      `
      <p class="muted">Signed value contract drives deterministic normalization and dimension attribution.</p>
      <pre class="scroll">${escapeHtml(JSON.stringify(contract || { error: "contract unavailable for current role" }, null, 2))}</pre>
      `
    ),
    params.card("KPI Detail", cards || "<div class='card muted'>No KPI rows available.</div>")
  ].join("");

  if (typeof params.subscribe === "function") {
    params.subscribe((event) => {
      if (!event || !["VALUE_UPDATED", "VALUE_REGRESSION_DETECTED", "VALUE_EVIDENCE_INSUFFICIENT"].includes(event.type)) {
        return;
      }
      renderValueKpisPage(params).catch(() => undefined);
    });
  }
}
