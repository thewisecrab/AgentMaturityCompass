function esc(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function cssForStatus(status) {
  const value = String(status ?? "UNTRUSTED").toUpperCase();
  if (value === "VERIFIED") return "status-ok";
  if (value === "INFO" || value === "INFORMATIONAL") return "status-warn";
  return "status-bad";
}

export function renderBadgeChip(params) {
  const status = String(params?.status ?? "UNTRUSTED").toUpperCase();
  const badge = String(params?.badge ?? "").trim();
  return `<span class="${cssForStatus(status)}" title="${esc(badge)}">${esc(status)}</span>`;
}

