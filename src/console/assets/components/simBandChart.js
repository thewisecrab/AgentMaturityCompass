function esc(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

export function renderSimBandChart(container, candidate) {
  if (!container) {
    return;
  }
  if (!candidate?.projected?.maturityDeltaBand) {
    container.innerHTML = "<p class=\"muted\">No numeric projection available.</p>";
    return;
  }
  const maturity = candidate.projected.maturityDeltaBand;
  const risk = candidate.projected.riskIndexDeltaBand || { low: 0, mid: 0, high: 0 };
  const value = candidate.projected.valueDeltaBand || { low: 0, mid: 0, high: 0 };
  const format = (n) => Number(n || 0).toFixed(3);
  container.innerHTML = `
    <div class="grid">
      <div class="card">
        <strong>Maturity Delta Band</strong>
        <div>low=${format(maturity.low)} mid=${format(maturity.mid)} high=${format(maturity.high)}</div>
      </div>
      <div class="card">
        <strong>Risk Delta Band</strong>
        <div>low=${format(risk.low)} mid=${format(risk.mid)} high=${format(risk.high)}</div>
      </div>
      <div class="card">
        <strong>Value Delta Band</strong>
        <div>low=${format(value.low)} mid=${format(value.mid)} high=${format(value.high)}</div>
      </div>
    </div>
    ${
      Array.isArray(candidate.honestyNotes) && candidate.honestyNotes.length > 0
        ? `<ul class="list">${candidate.honestyNotes.map((row) => `<li>${esc(row)}</li>`).join("")}</ul>`
        : ""
    }
  `;
}

