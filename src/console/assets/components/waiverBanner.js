function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

export function renderWaiverBanner(waiver) {
  if (!waiver) {
    return "";
  }
  const expiresTs = Number(waiver.expiresTs || 0);
  const expiresIso = expiresTs > 0 ? new Date(expiresTs).toISOString() : "unknown";
  return `
    <div class="card status-warn">
      <strong>Waiver Active</strong>
      <div class="muted">ASSURANCE_WAIVER_ACTIVE: <code>${escapeHtml(waiver.waiverId || "unknown")}</code></div>
      <div class="muted">expires: ${escapeHtml(expiresIso)}</div>
      <div class="muted">reason: ${escapeHtml(waiver.reason || "n/a")}</div>
    </div>
  `;
}
