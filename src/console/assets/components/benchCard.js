function esc(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

export function benchCard(bench) {
  const id = bench?.bench?.benchId ?? bench?.benchId ?? "unknown";
  const scope = bench?.bench?.scope?.type ?? bench?.scopeType ?? "UNKNOWN";
  const trust = bench?.bench?.evidence?.trustLabel ?? bench?.trustLabel ?? "UNKNOWN";
  const integrity = bench?.bench?.evidence?.integrityIndex ?? bench?.evidence?.integrityIndex ?? null;
  return `
    <div class="card">
      <div><strong>${esc(id)}</strong></div>
      <div class="muted">scope: ${esc(scope)}</div>
      <div class="muted">trust: ${esc(trust)}</div>
      <div class="muted">integrity: ${integrity === null ? "n/a" : Number(integrity).toFixed(3)}</div>
    </div>
  `;
}
