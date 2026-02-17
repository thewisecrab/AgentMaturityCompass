function esc(text) {
  return String(text)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

export function renderPluginTable(container, rows) {
  if (!container) {
    return;
  }
  if (!Array.isArray(rows) || rows.length === 0) {
    container.innerHTML = "<p class=\"muted\">No plugins installed.</p>";
    return;
  }
  container.innerHTML = `
    <table>
      <thead>
        <tr>
          <th>Plugin</th>
          <th>Publisher</th>
          <th>Registry</th>
          <th>Installed</th>
          <th>Integrity</th>
        </tr>
      </thead>
      <tbody>
        ${rows
          .map((row) => {
            const ok = row?.verification?.ok === true;
            const errors = Array.isArray(row?.verification?.errors) ? row.verification.errors : [];
            return `
              <tr>
                <td>${esc(row.id)}@${esc(row.version)}</td>
                <td><code>${esc(row.publisherFingerprint)}</code></td>
                <td><code>${esc(row.registryFingerprint)}</code></td>
                <td>${row.installedTs ? new Date(row.installedTs).toISOString() : "-"}</td>
                <td>${ok ? "PASS" : `FAIL${errors.length ? ` (${esc(errors[0])})` : ""}`}</td>
              </tr>
            `;
          })
          .join("")}
      </tbody>
    </table>
  `;
}
