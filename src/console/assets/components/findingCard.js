function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function severityClass(severity) {
  const value = String(severity || "INFO").toUpperCase();
  if (value === "CRITICAL" || value === "HIGH") {
    return "status-bad";
  }
  if (value === "MEDIUM") {
    return "status-warn";
  }
  return "status-ok";
}

export function renderFindingCard(finding) {
  const refs = Array.isArray(finding?.evidenceRefs?.eventHashes) ? finding.evidenceRefs.eventHashes : [];
  const hints = Array.isArray(finding?.remediationHints) ? finding.remediationHints : [];
  return `
    <article class="card ${severityClass(finding?.severity)}">
      <div class="row wrap">
        <strong>${escapeHtml(finding?.category || "UNKNOWN")}</strong>
        <span><code>${escapeHtml(finding?.findingId || "-")}</code></span>
        <span>${escapeHtml(finding?.severity || "INFO")}</span>
      </div>
      <div class="muted">template: <code>${escapeHtml(finding?.descriptionTemplateId || "-")}</code></div>
      <div class="muted">scenario: <code>${escapeHtml(finding?.scenarioId || "-")}</code></div>
      <div class="muted">evidence: ${refs.length === 0 ? "none" : refs.map((row) => `<code>${escapeHtml(row)}</code>`).join(" ")}</div>
      <div class="muted">remediation: ${hints.length === 0 ? "none" : hints.map((row) => `<code>${escapeHtml(row)}</code>`).join(" ")}</div>
    </article>
  `;
}
