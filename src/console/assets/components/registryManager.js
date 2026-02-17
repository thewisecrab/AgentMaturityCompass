function esc(text) {
  return String(text)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

export function renderRegistryManager(container, registries) {
  if (!container) {
    return;
  }
  const rows = Array.isArray(registries?.pluginRegistries?.registries)
    ? registries.pluginRegistries.registries
    : [];
  if (rows.length === 0) {
    container.innerHTML = "<p class=\"muted\">No registries configured.</p>";
    return;
  }
  container.innerHTML = `
    <table>
      <thead>
        <tr>
          <th>ID</th>
          <th>Type</th>
          <th>Base</th>
          <th>Pinned Fingerprint</th>
          <th>Allowed Publishers</th>
          <th>Risk</th>
        </tr>
      </thead>
      <tbody>
        ${rows
          .map(
            (row) => `
            <tr>
              <td>${esc(row.id)}</td>
              <td>${esc(row.type)}</td>
              <td><code>${esc(row.base)}</code></td>
              <td><code>${esc(row.pinnedRegistryPubkeyFingerprint)}</code></td>
              <td>${esc((row.allowPluginPublishers || []).join(", ") || "(any)")}</td>
              <td>${esc((row.allowRiskCategories || []).join(", "))}</td>
            </tr>
          `
          )
          .join("")}
      </tbody>
    </table>
  `;
}
