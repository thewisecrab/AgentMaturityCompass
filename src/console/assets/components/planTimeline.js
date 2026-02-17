import { renderActionCard } from "./actionCard.js";

function esc(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

export function renderPlanTimeline(container, plan) {
  if (!container) {
    return;
  }
  if (!plan) {
    container.innerHTML = "<p class=\"muted\">No mechanic plan yet.</p>";
    return;
  }
  const phases = Array.isArray(plan.phases) ? plan.phases : [];
  container.innerHTML = phases
    .map(
      (phase) => `
      <section class="card">
        <h4>${esc(phase.phaseId)} - ${esc(phase.goal || "")}</h4>
        <div class="grid">
          ${(phase.actions || []).map((action) => renderActionCard(action)).join("")}
        </div>
      </section>
    `
    )
    .join("");
}

