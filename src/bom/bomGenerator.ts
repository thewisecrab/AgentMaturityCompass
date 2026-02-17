import { spawnSync } from "node:child_process";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { latestAssuranceByPack } from "../assurance/assuranceRunner.js";
import { computeFailureRiskIndices } from "../assurance/indices.js";
import { getAgentPaths, resolveAgentId } from "../fleet/paths.js";
import { loadAgentConfig } from "../fleet/registry.js";
import { loadRunReport } from "../diagnostic/runner.js";
import { activeFreezeStatus } from "../drift/freezeEngine.js";
import { writeFileAtomic } from "../utils/fs.js";
import { sha256Hex } from "../utils/hash.js";
import { maturityBomSchema, type MaturityBom } from "./bomSchema.js";

function overall(layerScores: MaturityBom["layerScores"]): number {
  if (layerScores.length === 0) {
    return 0;
  }
  return layerScores.reduce((sum, row) => sum + row.avgFinalLevel, 0) / layerScores.length;
}

function gitMetadata(workspace: string): { commit: string | null; branch: string | null } {
  const commit = spawnSync("git", ["rev-parse", "HEAD"], {
    cwd: workspace,
    encoding: "utf8"
  });
  const branch = spawnSync("git", ["rev-parse", "--abbrev-ref", "HEAD"], {
    cwd: workspace,
    encoding: "utf8"
  });
  return {
    commit: commit.status === 0 ? commit.stdout.trim() : null,
    branch: branch.status === 0 ? branch.stdout.trim() : null
  };
}

export function generateBom(params: {
  workspace: string;
  agentId?: string;
  runId: string;
  outFile: string;
  bundleId?: string | null;
  certId?: string | null;
}): { bom: MaturityBom; outFile: string } {
  const agentId = resolveAgentId(params.workspace, params.agentId);
  const run = loadRunReport(params.workspace, params.runId, agentId);
  const config = loadAgentConfig(params.workspace, agentId);
  const assurance = latestAssuranceByPack({
    workspace: params.workspace,
    agentId,
    windowStartTs: run.windowStartTs,
    windowEndTs: run.windowEndTs
  });
  const riskReport = computeFailureRiskIndices({
    run,
    assuranceByPack: assurance
  });
  const freeze = activeFreezeStatus(params.workspace, agentId);

  const assurancePackScores = Object.fromEntries(
    [...assurance.entries()].map(([packId, pack]) => [packId, pack.score0to100])
  );
  const indexMap = Object.fromEntries(
    riskReport.indices.map((index) => [index.id, Number(index.score0to100.toFixed(2))])
  );
  const reportPath = resolve(getAgentPaths(params.workspace, agentId).runsDir, `${run.runId}.json`);
  const reportSha256 = sha256Hex(readFileSync(reportPath));
  const bom = maturityBomSchema.parse({
    v: 1,
    generatedTs: Date.now(),
    agentId,
    agentName: config.agentName,
    role: config.role,
    domain: config.domain,
    riskTier: config.riskTier,
    runId: run.runId,
    reportSha256,
    integrityIndex: run.integrityIndex,
    trustLabel: run.trustLabel,
    overall: Number(overall(run.layerScores).toFixed(4)),
    layerScores: run.layerScores,
    assurancePackScores,
    indices: indexMap,
    activeFreezeActionClasses: freeze.actionClasses,
    git: gitMetadata(params.workspace),
    references: {
      bundleId: params.bundleId ?? null,
      certId: params.certId ?? null
    }
  });
  const outFile = resolve(params.workspace, params.outFile);
  writeFileAtomic(outFile, JSON.stringify(bom, null, 2), 0o644);
  return {
    bom,
    outFile
  };
}
