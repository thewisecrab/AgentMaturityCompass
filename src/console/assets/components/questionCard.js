import { renderEvidenceChip } from "./evidenceChip.js";

function esc(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

export function renderQuestionCard(params) {
  const unknown = params.score?.unknown === true;
  const reasons = unknown ? (params.score?.reasons ?? []) : [];
  const refs = params.score?.evidenceRefs ?? [];
  const chips = refs.map((row) => renderEvidenceChip(row)).join(" ");
  const examples = (params.question.tailoredEvidenceExamples ?? []).map((row) => `<li>${esc(row)}</li>`).join("");
  return `
    <section class="card">
      <h3>${esc(params.question.qId)} — ${esc(params.question.title)}</h3>
      <p>${esc(params.question.howThisApplies)}</p>
      <div class="row wrap">
        <span><strong>Measured:</strong> ${typeof params.score?.measuredScore === "number" ? params.score.measuredScore : "n/a"}</span>
        <span><strong>Target:</strong> ${params.question.ownerTarget === null ? "(not set)" : params.question.ownerTarget}</span>
        <span><strong>Status:</strong> ${unknown ? "UNKNOWN" : "OK"}</span>
        <span><strong>Coverage:</strong> ${typeof params.score?.evidenceCoverage === "number" ? params.score.evidenceCoverage.toFixed(2) : "n/a"}</span>
      </div>
      ${chips.length > 0 ? `<div class="row wrap">${chips}</div>` : ""}
      ${reasons.length > 0 ? `<p class="status-bad"><strong>UNKNOWN reasons:</strong> ${esc(reasons.join(" | "))}</p>` : ""}
      <details>
        <summary>Evidence examples for this agent</summary>
        <ul>${examples}</ul>
      </details>
    </section>
  `;
}
