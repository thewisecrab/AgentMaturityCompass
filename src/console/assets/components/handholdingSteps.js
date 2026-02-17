function esc(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

export function renderHandholdingSteps(container, steps) {
  if (!container) {
    return;
  }
  const rows = Array.isArray(steps) ? steps : [];
  container.innerHTML = rows.length
    ? `<ol>${rows.map((row) => `<li><strong>${esc(row.title)}</strong><div class="muted">${esc(row.body)}</div></li>`).join("")}</ol>`
    : "<p class=\"muted\">No guided steps available.</p>";
}

