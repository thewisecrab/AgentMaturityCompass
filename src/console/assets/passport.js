import { renderPassportCard } from "./components/passportCard.js";
import { renderBadgeChip } from "./components/badgeChip.js";

function esc(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function parseStatusFromBadge(badge) {
  const text = String(badge ?? "").toUpperCase();
  if (text.includes("AMC VERIFIED")) return "VERIFIED";
  if (text.includes("AMC INFO")) return "INFO";
  return "UNTRUSTED";
}

function tile(label, value) {
  return `<div><div class="muted">${esc(label)}</div><div class="tile-value">${value}</div></div>`;
}

async function loadPassportData(params) {
  const [status, exportsRes, cacheRes, agentsRes] = await Promise.all([
    params.apiGet("/status").catch(() => null),
    params.apiGet("/passport/exports").catch(() => ({ exports: [] })),
    params.apiGet(`/passport/cache/latest?scope=agent&id=${encodeURIComponent(params.currentAgent())}`).catch(() => ({ passport: null })),
    params.apiGet("/agents").catch(() => ({ agents: [] }))
  ]);
  const agents = Array.isArray(agentsRes?.agents) ? agentsRes.agents : [];
  const badges = [];
  for (const agent of agents.slice(0, 20)) {
    const id = String(agent?.id ?? "");
    if (!id) continue;
    try {
      const row = await params.apiGet(`/passport/badge?agentId=${encodeURIComponent(id)}`);
      badges.push({
        agentId: id,
        badge: String(row?.badge ?? "")
      });
    } catch {
      badges.push({
        agentId: id,
        badge: "AMC UNTRUSTED • unavailable"
      });
    }
  }
  return {
    status,
    exports: Array.isArray(exportsRes?.exports) ? exportsRes.exports : [],
    cache: cacheRes?.passport ?? null,
    badges
  };
}

export async function renderPassportPage(params) {
  const data = await loadPassportData(params);
  const passport = data.cache;
  const warnings = [];
  if (data.status?.passport?.policySignatureValid === false) {
    warnings.push("<div class='card status-bad'><strong>PASSPORT POLICY UNTRUSTED</strong></div>");
  }
  if (passport?.status?.label === "UNTRUSTED") {
    warnings.push("<div class='card status-bad'><strong>UNTRUSTED PASSPORT</strong></div>");
  } else if (passport?.status?.label === "INFORMATIONAL") {
    warnings.push(`<div class='card status-warn'><strong>INFORMATIONAL ONLY</strong>: ${esc((passport.status.reasons || []).join(", ") || "gates unmet")}</div>`);
  }

  const maturity = typeof passport?.maturity?.overall === "number" ? passport.maturity.overall.toFixed(1) : "UNKNOWN";
  const assurance = typeof passport?.checkpoints?.lastAssuranceCert?.riskAssuranceScore === "number"
    ? String(Math.round(passport.checkpoints.lastAssuranceCert.riskAssuranceScore))
    : "UNKNOWN";
  const value = typeof passport?.valueDimensions?.valueScore === "number"
    ? String(Math.round(passport.valueDimensions.valueScore))
    : "UNKNOWN";
  const risks = [
    passport?.strategyFailureRisks?.ecosystemFocusRisk,
    passport?.strategyFailureRisks?.clarityPathRisk,
    passport?.strategyFailureRisks?.economicSignificanceRisk,
    passport?.strategyFailureRisks?.riskAssuranceRisk,
    passport?.strategyFailureRisks?.digitalDualityRisk
  ].filter((row) => typeof row === "number");
  const riskSummary = risks.length > 0 ? String(Math.round(risks.reduce((sum, row) => sum + row, 0) / risks.length)) : "UNKNOWN";

  params.root.innerHTML = [
    ...warnings,
    params.card(
      "Agent Passport",
      `
      <div class="grid">
        ${tile("Status", renderBadgeChip({ status: passport?.status?.label === "INFORMATIONAL" ? "INFO" : passport?.status?.label ?? "UNTRUSTED", badge: passport?.status?.label ?? "UNTRUSTED" }))}
        ${tile("Maturity", esc(`${maturity}/5`))}
        ${tile("Assurance", esc(assurance))}
        ${tile("Value", esc(value))}
        ${tile("Risk avg", esc(riskSummary))}
      </div>
      <div class="row wrap">
        <button id="passportCreateBtn">Create Current Agent Passport</button>
        <button id="passportExportBtn" class="secondary">Export Current Agent Passport</button>
        <button id="passportVerifyBtn" class="secondary">Verify Passport File</button>
      </div>
      <pre id="passportOut" class="scroll muted"></pre>
      `
    ),
    params.card(
      "Agent Badges",
      data.badges.length > 0
        ? data.badges
          .map((row) => `<div class="row wrap"><code>${esc(row.agentId)}</code>${renderBadgeChip({ status: parseStatusFromBadge(row.badge), badge: row.badge })}<span class="muted">${esc(row.badge)}</span></div>`)
          .join("")
        : "<div class='muted'>No agents found.</div>"
    ),
    params.card(
      "Exports",
      data.exports.length > 0
        ? data.exports.map((row) => renderPassportCard(row)).join("")
        : "<div class='muted'>No passport exports yet.</div>"
    )
  ].join("");

  document.getElementById("passportCreateBtn")?.addEventListener("click", async () => {
    const out = await params.apiPost("/passport/create", {
      scopeType: "AGENT",
      scopeId: params.currentAgent()
    });
    const view = document.getElementById("passportOut");
    if (view) {
      view.textContent = JSON.stringify(out, null, 2);
    }
    await renderPassportPage(params);
  });

  document.getElementById("passportExportBtn")?.addEventListener("click", async () => {
    const outFile = window.prompt("Output .amcpass path", `.amc/passport/exports/agent/${params.currentAgent()}/manual.amcpass`);
    if (!outFile) return;
    const out = await params.apiPost("/passport/export", {
      scopeType: "AGENT",
      scopeId: params.currentAgent(),
      outFile: outFile.trim()
    });
    const view = document.getElementById("passportOut");
    if (view) {
      view.textContent = JSON.stringify(out, null, 2);
    }
    await renderPassportPage(params);
  });

  document.getElementById("passportVerifyBtn")?.addEventListener("click", async () => {
    const file = window.prompt("Passport file path", ".amc/passport/exports/agent/default/latest.amcpass");
    if (!file) return;
    const out = await params.apiPost("/passport/verify", { file: file.trim() });
    const view = document.getElementById("passportOut");
    if (view) {
      view.textContent = JSON.stringify(out, null, 2);
    }
  });
}

