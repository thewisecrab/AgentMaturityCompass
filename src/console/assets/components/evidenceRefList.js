function esc(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

export function renderEvidenceRefList(refs) {
  const rows = Array.isArray(refs) ? refs.filter((row) => typeof row === "string") : [];
  if (rows.length === 0) {
    return "<span class='muted'>none</span>";
  }
  return rows.slice(0, 24).map((row) => `<code>${esc(row)}</code>`).join(" ");
}
