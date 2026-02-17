import { renderControlStatusChip } from "./controlStatusChip.js";
import { renderEvidenceRefList } from "./evidenceRefList.js";

function esc(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

export function renderControlFamilyCard(family) {
  const controls = Array.isArray(family?.controls) ? family.controls : [];
  const rows = controls
    .slice(0, 8)
    .map((control) => {
      const reasons = Array.isArray(control?.reasons) ? control.reasons : [];
      return `
        <tr>
          <td><code>${esc(control?.controlId || "-")}</code></td>
          <td>${renderControlStatusChip(control?.status || "INSUFFICIENT_EVIDENCE")}</td>
          <td>${reasons.length > 0 ? reasons.map((reason) => `<code>${esc(reason)}</code>`).join(" ") : "<span class='muted'>none</span>"}</td>
          <td>${renderEvidenceRefList(control?.evidenceRefs || [])}</td>
        </tr>
      `;
    })
    .join("");

  return `
    <article class="card">
      <div class="row wrap">
        <strong>${esc(family?.title || family?.familyId || "Control family")}</strong>
        <span>${renderControlStatusChip((family?.statusSummary?.fail ?? 0) > 0 ? "FAIL" : (family?.statusSummary?.insufficient ?? 0) > 0 ? "INSUFFICIENT_EVIDENCE" : "PASS")}</span>
      </div>
      <div class="muted">
        pass=${esc(family?.statusSummary?.pass ?? 0)} fail=${esc(family?.statusSummary?.fail ?? 0)} insufficient=${esc(family?.statusSummary?.insufficient ?? 0)}
      </div>
      <div class="scroll">
        <table>
          <thead>
            <tr>
              <th>Control</th>
              <th>Status</th>
              <th>Reasons</th>
              <th>Evidence Refs</th>
            </tr>
          </thead>
          <tbody>
            ${rows || "<tr><td colspan='4' class='muted'>No controls.</td></tr>"}
          </tbody>
        </table>
      </div>
    </article>
  `;
}
