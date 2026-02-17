function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

export function renderPromptViewer(params) {
  const systemText = typeof params.systemText === "string" ? params.systemText : "";
  const allowlists = params.allowlists && typeof params.allowlists === "object" ? params.allowlists : {};
  const recurrence = params.recurrence && typeof params.recurrence === "object" ? params.recurrence : {};
  const lines = [
    `<h4>Provider Prompt (${escapeHtml(params.provider || "generic")})</h4>`,
    `<pre style="max-height:240px;overflow:auto;white-space:pre-wrap">${escapeHtml(systemText)}</pre>`,
    `<h4>Allowlists</h4>`,
    `<pre>${escapeHtml(JSON.stringify(allowlists, null, 2))}</pre>`,
    `<h4>Recurrence Checklist</h4>`,
    `<pre>${escapeHtml(JSON.stringify(recurrence, null, 2))}</pre>`
  ];
  return lines.join("");
}

