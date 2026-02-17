import { renderQuestionCard } from "./components/questionCard.js";

export async function renderDiagnosticViewPage(params) {
  const agentId = params.currentAgent();
  const [rendered, auto] = await Promise.all([
    params.apiGet(`/diagnostic/render?agentId=${encodeURIComponent(agentId)}`),
    params.apiGet(`/diagnostic/auto-answer?agentId=${encodeURIComponent(agentId)}`)
  ]);

  const scoreById = new Map((auto.questions ?? []).map((row) => [row.questionId, row]));
  const unknownReasons = new Map((auto.unknownReasons ?? []).map((row) => [row.questionId, row.reasons]));

  const groups = new Map();
  for (const dimension of rendered.dimensions ?? []) {
    groups.set(dimension.dimensionId, {
      name: dimension.name,
      items: []
    });
  }
  for (const question of rendered.questions ?? []) {
    const row = groups.get(question.dimensionId) ?? { name: `Dimension ${question.dimensionId}`, items: [] };
    const score = scoreById.get(question.qId);
    row.items.push({
      question,
      score: score
        ? {
            ...score,
            evidenceRefs: score.reasons?.length ? [] : (score.flags ?? []).slice(0, 3),
            reasons: unknownReasons.get(question.qId) ?? score.reasons ?? []
          }
        : null
    });
    groups.set(question.dimensionId, row);
  }

  const sections = [...groups.entries()]
    .sort((a, b) => Number(a[0]) - Number(b[0]))
    .map(([, group]) => {
      const cards = group.items
        .sort((a, b) => a.question.qId.localeCompare(b.question.qId))
        .map((row) => renderQuestionCard(row))
        .join("");
      return `<section><h2>${group.name}</h2>${cards}</section>`;
    })
    .join("");

  params.root.innerHTML = `
    ${params.card("Diagnostic Overview", `
      <div class="grid">
        <div><div class="muted">Agent</div><div class="tile-value">${agentId}</div></div>
        <div><div class="muted">Run ID</div><div class="tile-value">${auto.runId ?? "n/a"}</div></div>
        <div><div class="muted">Integrity</div><div class="tile-value">${typeof auto.integrityIndex === "number" ? auto.integrityIndex.toFixed(3) : "n/a"}</div></div>
        <div><div class="muted">Unknown Questions</div><div class="tile-value">${(auto.unknownReasons ?? []).length}</div></div>
      </div>
      ${(auto.unknownReasons ?? []).length > 0 ? `<p class="status-bad"><strong>Honesty banner:</strong> insufficient evidence for one or more questions.</p>` : ""}
    `)}
    ${sections}
  `;
}
