import { renderCgxViewer } from "./components/cgxViewer.js";

export async function renderContextGraphPage(params) {
  const agentId = params.currentAgent();
  const [graph, pack, verify] = await Promise.all([
    params.apiGet(`/cgx/graph/latest?scope=agent&targetId=${encodeURIComponent(agentId)}`).catch(() => null),
    params.apiGet(`/cgx/pack/latest?agentId=${encodeURIComponent(agentId)}`).catch(() => null),
    params.apiGet("/cgx/verify").catch(() => null)
  ]);

  params.root.innerHTML = `
    ${params.card("CGX Status", `
      <div class="grid">
        <div><div class="muted">Agent</div><div class="tile-value">${agentId}</div></div>
        <div><div class="muted">Graph Signature</div><div class="tile-value">${verify?.workspaceGraph?.valid ? "PASS" : "WARN"}</div></div>
        <div><div class="muted">Pack Signature</div><div class="tile-value">${verify?.agentPacks?.find?.((row) => row.agentId === agentId)?.verify?.valid ? "PASS" : "WARN"}</div></div>
        <div><div class="muted">Pack Hash</div><div class="tile-value">${pack ? "present" : "missing"}</div></div>
      </div>
      <details><summary>Verification details</summary><pre>${JSON.stringify(verify, null, 2)}</pre></details>
      <details><summary>Context pack</summary><pre>${JSON.stringify(pack, null, 2)}</pre></details>
    `)}
    <div id="cgxViewer"></div>
  `;
  renderCgxViewer(document.getElementById("cgxViewer"), graph);
}
