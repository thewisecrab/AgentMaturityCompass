function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

export function renderPromptDiffViewer(diff) {
  if (!diff || diff.status !== "ok") {
    return `<p class="muted">No previous prompt snapshot available yet.</p>`;
  }
  return `<pre>${escapeHtml(JSON.stringify(diff, null, 2))}</pre>`;
}

