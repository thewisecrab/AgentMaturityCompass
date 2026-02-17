function esc(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

export function renderSchemaViewer(params) {
  const name = params?.name ?? "unknown";
  const schema = params?.schema ?? null;
  return `
    <div class="card">
      <div class="row spaced">
        <strong>${esc(name)}</strong>
      </div>
      <pre class="scroll">${esc(JSON.stringify(schema, null, 2))}</pre>
    </div>
  `;
}

