import { renderFindingCard } from "./components/findingCard.js";
import { renderScoreGauge } from "./components/scoreGauge.js";
import { renderWaiverBanner } from "./components/waiverBanner.js";

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function iso(ts) {
  return Number.isFinite(Number(ts)) ? new Date(Number(ts)).toISOString() : "-";
}

export async function renderAssurancePage(params) {
  const policy = await params.apiGet("/assurance/policy");
  const runsResponse = await params.apiGet("/assurance/runs");
  const certLatest = await params.apiGet("/assurance/cert/latest");
  const waiverStatus = await params.apiGet("/assurance/waiver/status").catch(() => ({ active: null }));
  const status = await params.apiGet("/status").catch(() => null);

  const runs = Array.isArray(runsResponse?.runs) ? runsResponse.runs : [];
  const latestRun = runs[0] || null;
  const latestRunDetail = latestRun
    ? await params.apiGet(`/assurance/runs/${encodeURIComponent(latestRun.runId)}`).catch(() => null)
    : null;
  const findings = Array.isArray(latestRunDetail?.findings?.findings) ? latestRunDetail.findings.findings : [];
  const topFindings = findings.slice(0, 8);

  const gate = status?.assurance || null;
  const policySigValid = policy?.signature?.valid === true;
  const breach = gate && gate.readyGateOk === false && Array.isArray(gate.readyGateReasons) && gate.readyGateReasons.includes("ASSURANCE_THRESHOLD_BREACH");

  const warnings = [];
  if (!policySigValid) {
    warnings.push("<div class='card status-bad'><strong>ASSURANCE POLICY UNTRUSTED</strong></div>");
  }
  if (breach) {
    warnings.push("<div class='card status-bad'><strong>Assurance breach blocks readiness</strong></div>");
  }

  const score = latestRun ? latestRun.score : null;
  const scoreStatus = latestRun ? latestRun.status : "UNKNOWN";

  const certSummary = certLatest?.latest?.cert || null;

  const findingsHtml = topFindings.length > 0
    ? topFindings.map((row) => renderFindingCard(row)).join("")
    : "<div class='card muted'>No findings for latest run.</div>";

  params.root.innerHTML = [
    ...warnings,
    renderWaiverBanner(waiverStatus?.active || certLatest?.waiver || null),
    params.card(
      "Assurance Dashboard",
      `
      ${renderScoreGauge({ label: "Risk Assurance Score", score, status: scoreStatus })}
      <div class="grid">
        <div><div class="muted">Latest run</div><div class="tile-value"><code>${escapeHtml(latestRun?.runId || "-")}</code></div></div>
        <div><div class="muted">Latest run ts</div><div class="tile-value">${escapeHtml(iso(latestRun?.generatedTs))}</div></div>
        <div><div class="muted">Latest cert</div><div class="tile-value"><code>${escapeHtml(certSummary?.certId || "-")}</code></div></div>
        <div><div class="muted">Cert status</div><div class="tile-value">${escapeHtml(certSummary?.status || "MISSING")}</div></div>
      </div>
      <div class="row wrap">
        <button id="assuranceRunNow">Run Assurance Now</button>
        <button id="assuranceIssueCert" class="secondary">Issue Certificate</button>
        <button id="assuranceRequestWaiver" class="secondary">Request Waiver</button>
      </div>
      <div class="row wrap">
        <a href="./assuranceRun${latestRun ? `?runId=${encodeURIComponent(latestRun.runId)}` : ""}">Open Run Detail</a>
        <a href="./assuranceCert">Open Certificate</a>
      </div>
      <p class="muted">Defensive assurance runs against AMC-controlled interfaces only. Trace storage is hashes/refs, not raw prompts/outputs.</p>
      <pre class="scroll">${escapeHtml(JSON.stringify({
        policySignature: policy?.signature,
        readinessGate: gate,
        lastCertStatus: certSummary?.status || null,
        thresholds: policy?.policy?.assurancePolicy?.thresholds || null
      }, null, 2))}</pre>
      `
    ),
    params.card("Top Findings", findingsHtml)
  ].join("");

  document.getElementById("assuranceRunNow")?.addEventListener("click", async () => {
    await params.apiPost("/assurance/run", {
      scope: "workspace",
      pack: "all"
    });
    await renderAssurancePage(params);
  });

  document.getElementById("assuranceIssueCert")?.addEventListener("click", async () => {
    if (!latestRun?.runId) {
      alert("No assurance run available to certify.");
      return;
    }
    await params.apiPost("/assurance/cert/issue", {
      runId: latestRun.runId
    });
    await renderAssurancePage(params);
  });

  document.getElementById("assuranceRequestWaiver")?.addEventListener("click", async () => {
    const reason = window.prompt("Waiver reason (required)", "Temporary business continuity while remediating assurance findings");
    if (!reason || reason.trim().length === 0) {
      return;
    }
    const hoursRaw = window.prompt("Waiver hours (1-72)", "24");
    const hours = Math.max(1, Math.min(72, Number.parseInt(hoursRaw || "24", 10) || 24));
    await params.apiPost("/assurance/waiver/request", {
      reason: reason.trim(),
      hours
    });
    await renderAssurancePage(params);
  });
}
