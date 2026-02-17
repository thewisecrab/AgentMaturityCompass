function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function format(value, digits = 3) {
  if (typeof value !== "number" || !Number.isFinite(value)) {
    return "null";
  }
  return Number(value).toFixed(digits);
}

export function renderKpiCard(row) {
  const trust = row?.trustKindSummary ?? {};
  return `<article class="card">
    <h4><code>${escapeHtml(row?.kpiId ?? "unknown_kpi")}</code></h4>
    <div class="grid">
      <div><div class="muted">Current</div><div class="tile-value">${escapeHtml(format(row?.currentValue))}</div></div>
      <div><div class="muted">Baseline</div><div class="tile-value">${escapeHtml(format(row?.baselineValue))}</div></div>
      <div><div class="muted">Delta</div><div class="tile-value">${escapeHtml(format(row?.delta))}</div></div>
      <div><div class="muted">Normalized</div><div class="tile-value">${escapeHtml(format(row?.normalizedScore, 2))}</div></div>
    </div>
    <p class="muted">
      Trust mix O/A/SR: ${escapeHtml(format(trust.observed, 2))} /
      ${escapeHtml(format(trust.attested, 2))} /
      ${escapeHtml(format(trust.selfReported, 2))}
      | refs=${escapeHtml(String(row?.evidenceRefsCount ?? 0))}
    </p>
  </article>`;
}
