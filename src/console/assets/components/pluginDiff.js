function esc(text) {
  return String(text)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

export function renderPluginDiff(container, diff) {
  if (!container) {
    return;
  }
  if (!diff) {
    container.innerHTML = "<p class=\"muted\">No diff available.</p>";
    return;
  }
  container.innerHTML = `
    <div class="grid">
      <div class="card"><h4>Added</h4><pre class="scroll">${esc(JSON.stringify(diff.added || [], null, 2))}</pre></div>
      <div class="card"><h4>Changed</h4><pre class="scroll">${esc(JSON.stringify(diff.changed || [], null, 2))}</pre></div>
      <div class="card"><h4>Removed</h4><pre class="scroll">${esc(JSON.stringify(diff.removed || [], null, 2))}</pre></div>
    </div>
  `;
}
