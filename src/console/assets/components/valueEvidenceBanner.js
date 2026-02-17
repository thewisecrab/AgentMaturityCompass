function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

export function renderValueEvidenceBanner(snapshot) {
  if (!snapshot || snapshot.status !== "INSUFFICIENT_EVIDENCE") {
    return "<div class='card status-ok'><strong>Evidence gates OK</strong> for strong value claims.</div>";
  }
  const reasons = Array.isArray(snapshot.reasons) ? snapshot.reasons : [];
  return `<div class="card status-bad">
    <strong>INSUFFICIENT EVIDENCE</strong>
    <ul>${reasons.map((reason) => `<li>${escapeHtml(reason)}</li>`).join("")}</ul>
  </div>`;
}
