function esc(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

export function renderBenchWarnings(root, warnings) {
  if (!root) return;
  const list = Array.isArray(warnings) ? warnings : [];
  if (list.length === 0) {
    root.innerHTML = `<div class="muted">No warnings.</div>`;
    return;
  }
  root.innerHTML = `
    <ul>
      ${list.map((warning) => `<li>${esc(warning)}</li>`).join("")}
    </ul>
  `;
}
