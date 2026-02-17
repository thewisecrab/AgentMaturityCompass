import { randomUUID } from "node:crypto";
import { readdirSync } from "node:fs";
import { basename, dirname, join, resolve } from "node:path";
import { questionBank } from "../diagnostic/questionBank.js";
import { getAgentPaths, resolveAgentId } from "../fleet/paths.js";
import { loadRunReport } from "../diagnostic/runner.js";
import { loadTargetProfile } from "../targets/targetProfile.js";
import { ensureDir, pathExists, readUtf8, writeFileAtomic } from "../utils/fs.js";
import { sha256Hex } from "../utils/hash.js";
import { openLedger } from "../ledger/ledger.js";

type EocAuditType = "EDUCATION_VIEWED" | "OWNERSHIP_ASSIGNED" | "COMMITMENT_CREATED";

function logEocAudit(params: {
  workspace: string;
  agentId: string;
  auditType: EocAuditType;
  payload: Record<string, unknown>;
}): string {
  const ledger = openLedger(params.workspace);
  const sessionId = randomUUID();
  const payload = JSON.stringify({
    ...params.payload,
    agentId: params.agentId,
    auditType: params.auditType
  });
  try {
    ledger.startSession({
      sessionId,
      runtime: "unknown",
      binaryPath: "amc-eoc",
      binarySha256: sha256Hex("amc-eoc")
    });
    const event = ledger.appendEvidenceWithReceipt({
      sessionId,
      runtime: "unknown",
      eventType: "audit",
      payload,
      payloadExt: "json",
      inline: true,
      meta: {
        auditType: params.auditType,
        source: "eoc",
        agentId: params.agentId,
        trustTier: "OBSERVED",
        ...params.payload
      },
      receipt: {
        kind: "guard_check",
        agentId: params.agentId,
        providerId: "unknown",
        model: null,
        bodySha256: sha256Hex(Buffer.from(payload, "utf8"))
      }
    });
    ledger.sealSession(sessionId);
    return event.id;
  } finally {
    ledger.close();
  }
}

function latestRunId(workspace: string, agentId: string): string | null {
  const paths = getAgentPaths(workspace, agentId);
  if (!pathExists(paths.runsDir)) {
    return null;
  }
  const rows = readdirSync(paths.runsDir)
    .filter((file) => file.endsWith(".json"))
    .map((file) => {
      const run = JSON.parse(readUtf8(join(paths.runsDir, file))) as { runId?: string; ts?: number };
      return {
        runId: run.runId ?? basename(file, ".json"),
        ts: run.ts ?? 0
      };
    })
    .sort((a, b) => b.ts - a.ts);
  if (rows.length === 0) {
    return null;
  }
  return rows[0]?.runId ?? null;
}

function topGapRows(workspace: string, agentId: string, targetName: string): Array<{ questionId: string; current: number; target: number; gap: number }> {
  const runId = latestRunId(workspace, agentId);
  if (!runId) {
    return [];
  }
  const run = loadRunReport(workspace, runId, agentId);
  const target = loadTargetProfile(workspace, targetName, agentId);
  return run.questionScores
    .map((row) => {
      const targetLevel = target.mapping[row.questionId] ?? 0;
      return {
        questionId: row.questionId,
        current: row.finalLevel,
        target: targetLevel,
        gap: targetLevel - row.finalLevel
      };
    })
    .filter((row) => row.gap > 0)
    .sort((a, b) => b.gap - a.gap || a.questionId.localeCompare(b.questionId))
    .slice(0, 12);
}

export function learnQuestion(params: {
  workspace: string;
  questionId: string;
  agentId?: string;
}): {
  agentId: string;
  questionId: string;
  output: string;
  auditEventId: string;
} {
  const agentId = resolveAgentId(params.workspace, params.agentId);
  const question = questionBank.find((item) => item.id === params.questionId);
  if (!question) {
    throw new Error(`Unknown question ID: ${params.questionId}`);
  }

  const levelBlocks = question.options
    .sort((a, b) => a.level - b.level)
    .map((option) => {
      return [
        `Level ${option.level} — ${option.label}`,
        option.meaning,
        `Signals: ${option.observableSignals.slice(0, 3).join("; ")}`,
        `Evidence: ${option.typicalEvidence.slice(0, 3).join("; ")}`
      ].join("\n");
    })
    .join("\n\n");

  const nextSteps = [
    `1) Apply this upgrade hint: ${question.upgradeHints}`,
    `2) Collect evidence gate coverage: ${question.evidenceGateHints}`,
    `3) Tune these knobs: ${question.tuningKnobs.join(", ")}`
  ].join("\n");

  const output = [
    `# Learn ${question.id} — ${question.title}`,
    "",
    question.promptTemplate,
    "",
    levelBlocks,
    "",
    "## Move Up One Level",
    nextSteps,
    ""
  ].join("\n");

  const auditEventId = logEocAudit({
    workspace: params.workspace,
    agentId,
    auditType: "EDUCATION_VIEWED",
    payload: {
      questionId: question.id
    }
  });

  return {
    agentId,
    questionId: question.id,
    output,
    auditEventId
  };
}

export function assignOwnership(params: {
  workspace: string;
  targetName: string;
  agentId?: string;
}): {
  agentId: string;
  outputFile: string;
  output: string;
  auditEventId: string;
} {
  const agentId = resolveAgentId(params.workspace, params.agentId);
  const paths = getAgentPaths(params.workspace, agentId);
  const target = loadTargetProfile(params.workspace, params.targetName, agentId);
  const gaps = topGapRows(params.workspace, agentId, params.targetName);

  const ownerResponsibilities = [
    "Maintain signed targets, fleet/agent config signatures, and gateway signatures.",
    "Enforce CI gate policy thresholds and review downgrade alerts.",
    "Run sandboxed high-risk workflows and keep key isolation intact."
  ];

  const agentResponsibilities = [
    "Emit Truth Protocol sections on high-risk outputs.",
    "Attach [ev:<eventId>] evidence links for factual claims.",
    "Request approvals for irreversible actions and avoid bypass attempts."
  ];

  const systemResponsibilities = [
    "Capture llm_request/llm_response via gateway with signed receipts.",
    "Verify ledger/signatures on every run and enforce correlation checks.",
    "Track assurance failures and apply deterministic patch kits."
  ];

  const topGapLines = gaps.length
    ? gaps.map((gap) => `- ${gap.questionId}: current ${gap.current}, target ${gap.target}, gap ${gap.gap}`).join("\n")
    : "- No positive gaps detected for this target.";

  const output = [
    `# Ownership Map (${agentId})`,
    "",
    `Target: ${target.id}`,
    "",
    "## Top Gaps",
    topGapLines,
    "",
    "## Owner Responsibilities",
    ...ownerResponsibilities.map((line) => `- ${line}`),
    "",
    "## Agent Responsibilities",
    ...agentResponsibilities.map((line) => `- ${line}`),
    "",
    "## System Responsibilities",
    ...systemResponsibilities.map((line) => `- ${line}`),
    ""
  ].join("\n");

  const outputFile = join(paths.reportsDir, `ownership-${params.targetName}.md`);
  ensureDir(paths.reportsDir);
  writeFileAtomic(outputFile, output, 0o644);

  const auditEventId = logEocAudit({
    workspace: params.workspace,
    agentId,
    auditType: "OWNERSHIP_ASSIGNED",
    payload: {
      targetId: target.id,
      fileHashes: [{
        path: outputFile,
        sha256: sha256Hex(readUtf8(outputFile))
      }]
    }
  });

  return {
    agentId,
    outputFile,
    output,
    auditEventId
  };
}

export function createCommitmentPlan(params: {
  workspace: string;
  targetName: string;
  days: number;
  outFile: string;
  agentId?: string;
}): {
  agentId: string;
  commitmentId: string;
  outFile: string;
  output: string;
  auditEventId: string;
} {
  const agentId = resolveAgentId(params.workspace, params.agentId);
  const commitmentId = randomUUID();
  const gaps = topGapRows(params.workspace, agentId, params.targetName);

  const checkboxes = gaps.length
    ? gaps.map((gap) => `- [ ] ${gap.questionId}: collect evidence to move ${gap.current} -> ${Math.min(gap.current + 1, gap.target)}.`)
    : ["- [ ] Maintain current posture and collect sustaining evidence."];

  const output = [
    `# Commitment Plan (${commitmentId})`,
    "",
    `Agent: ${agentId}`,
    `Target: ${params.targetName}`,
    `Duration: ${params.days} days`,
    "",
    "## Checklist",
    ...checkboxes,
    "",
    "## Cadence",
    "- Weekly: amc verify",
    "- Weekly: amc run --window 14d --target default",
    "- Weekly: amc assurance run --all --mode sandbox",
    "",
    "## Evidence Commands",
    `- amc supervise --agent ${agentId} --route http://127.0.0.1:3210/openai -- <your-agent-command>`,
    `- amc run --agent ${agentId} --window 14d --target ${params.targetName}`,
    `- amc upgrade --to target:${params.targetName}`,
    ""
  ].join("\n");

  const outFile = resolve(params.workspace, params.outFile);
  ensureDir(dirname(outFile));
  writeFileAtomic(outFile, output, 0o644);

  const auditEventId = logEocAudit({
    workspace: params.workspace,
    agentId,
    auditType: "COMMITMENT_CREATED",
    payload: {
      commitmentId,
      targetName: params.targetName,
      fileHashes: [{
        path: outFile,
        sha256: sha256Hex(readUtf8(outFile))
      }]
    }
  });

  return {
    agentId,
    commitmentId,
    outFile,
    output,
    auditEventId
  };
}
