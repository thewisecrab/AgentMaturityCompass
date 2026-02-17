import { renderValuePage } from "./value.js";

export async function renderValueAgentPage(params) {
  const agentId = typeof params.currentAgent === "function" ? params.currentAgent() : "default";
  const encodedId = encodeURIComponent(agentId);
  const snapshot = await params.apiGet(`/value/snapshot/latest?scope=agent&id=${encodedId}`).catch(() => null);
  const reportResp = await params.apiGet(`/value/report?scope=agent&id=${encodedId}&windowDays=30`).catch(() => null);
  const report = reportResp?.report ?? reportResp ?? null;

  if (!snapshot || !report) {
    await renderValuePage(params);
    return;
  }

  params.root.innerHTML = `
    <section class="card">
      <h3>Value Realization: Agent <code>${agentId}</code></h3>
      <p class="muted">Agent-scoped value dimensions, economic significance, and evidence gating.</p>
      <div class="row wrap">
        <a href="./value">Workspace Value</a>
        <a href="./valueKpis">KPI Detail</a>
      </div>
      <pre class="scroll">${JSON.stringify(snapshot, null, 2)}</pre>
    </section>
    <section class="card">
      <h3>Report Series</h3>
      <pre class="scroll">${JSON.stringify(report.series || {}, null, 2)}</pre>
    </section>
  `;

  if (typeof params.subscribe === "function") {
    params.subscribe((event) => {
      if (!event || !["VALUE_UPDATED", "VALUE_REGRESSION_DETECTED", "VALUE_EVIDENCE_INSUFFICIENT"].includes(event.type)) {
        return;
      }
      renderValueAgentPage(params).catch(() => undefined);
    });
  }
}
