import { renderAdvisoryCards } from "./components/advisoryCard.js";

function htmlEscape(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

export async function renderAdvisoriesPage(params) {
  const { root, card, apiGet, apiPost, currentAgent } = params;
  const agentId = currentAgent();
  const list = await apiGet(`/advisories?scope=agent&targetId=${encodeURIComponent(agentId)}`).catch(() => ({ advisories: [] }));
  const rows = Array.isArray(list.advisories) ? list.advisories : Array.isArray(list) ? list : [];

  root.innerHTML = `
    ${card("Advisories", `
      <p class="muted">Evidence-bound advisories. ACK requires owner/operator action.</p>
      <div class="row wrap">
        <input id="advisoryAckId" placeholder="advisoryId" />
        <input id="advisoryAckNote" placeholder="ack note" />
        <button id="advisoryAckBtn">Acknowledge</button>
      </div>
      <pre id="advisoryAckOut" class="muted"></pre>
    `)}
    ${card("Active Advisory Cards", `<div id="advisoryCards"></div>`)}
    ${card("Raw", `<pre class="scroll">${htmlEscape(JSON.stringify(rows, null, 2))}</pre>`)}
  `;
  renderAdvisoryCards(document.getElementById("advisoryCards"), rows);
  document.getElementById("advisoryAckBtn")?.addEventListener("click", async () => {
    const advisoryId = document.getElementById("advisoryAckId")?.value || "";
    const note = document.getElementById("advisoryAckNote")?.value || "Acknowledged";
    const outEl = document.getElementById("advisoryAckOut");
    if (!advisoryId) {
      outEl.textContent = "advisoryId is required";
      return;
    }
    try {
      const out = await apiPost(`/advisories/${encodeURIComponent(advisoryId)}/ack`, { note });
      outEl.textContent = JSON.stringify(out, null, 2);
    } catch (error) {
      outEl.textContent = String(error);
    }
  });
}

