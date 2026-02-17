import { dirname, resolve } from "node:path";
import { ensureDir, writeFileAtomic } from "../utils/fs.js";
import { parseWindowToMs } from "../utils/time.js";
import { computeOrgScorecard, recomputeAndPersistOrgScorecard, scorecardNodeComparison } from "./orgEngine.js";
import { generateOrgCommitmentPlan, generateOrgEducationBrief, generateOrgOwnershipPlan } from "./orgCommitments.js";
import { renderOrgCompareMarkdown, renderOrgNodeReportMarkdown } from "./orgReports.js";
import {
  addOrgNode,
  assignAgentToNode,
  initOrgConfig,
  loadOrgConfig,
  unassignAgentFromNode,
  verifyOrgConfigSignature
} from "./orgStore.js";
import type { OrgNodeType } from "./orgSchema.js";

export function orgInitCli(params: {
  workspace: string;
  enterpriseName?: string;
}): {
  path: string;
  sigPath: string;
} {
  return initOrgConfig(params.workspace, params.enterpriseName ? {
    ...loadOrgConfig(params.workspace),
    enterpriseName: params.enterpriseName
  } : undefined);
}

export function orgVerifyCli(workspace: string): ReturnType<typeof verifyOrgConfigSignature> {
  return verifyOrgConfigSignature(workspace);
}

export function orgAddNodeCli(params: {
  workspace: string;
  id: string;
  type: OrgNodeType;
  name: string;
  parentId: string | null;
}): {
  path: string;
  sigPath: string;
} {
  const out = addOrgNode(params);
  return {
    path: out.path,
    sigPath: out.sigPath
  };
}

export function orgAssignCli(params: {
  workspace: string;
  agentId: string;
  nodeId: string;
  weight?: number;
}): {
  path: string;
  sigPath: string;
} {
  const out = assignAgentToNode(params);
  return {
    path: out.path,
    sigPath: out.sigPath
  };
}

export function orgUnassignCli(params: {
  workspace: string;
  agentId: string;
  nodeId: string;
}): {
  path: string;
  sigPath: string;
} {
  const out = unassignAgentFromNode(params);
  return {
    path: out.path,
    sigPath: out.sigPath
  };
}

export function orgScoreCli(params: {
  workspace: string;
  window: string;
}): ReturnType<typeof recomputeAndPersistOrgScorecard> {
  return recomputeAndPersistOrgScorecard(params);
}

export function orgReportCli(params: {
  workspace: string;
  nodeId: string;
  outFile: string;
  window?: string;
}): {
  outFile: string;
  markdown: string;
} {
  const scorecard = computeOrgScorecard({
    workspace: params.workspace,
    window: params.window ?? "14d"
  });
  const markdown = renderOrgNodeReportMarkdown(scorecard, params.nodeId);
  const outFile = resolve(params.workspace, params.outFile);
  ensureDir(dirname(outFile));
  writeFileAtomic(outFile, markdown, 0o644);
  return {
    outFile,
    markdown
  };
}

export function orgCompareCli(params: {
  workspace: string;
  nodeA: string;
  nodeB: string;
  outFile: string;
  format: "md" | "json";
  window?: string;
}): {
  outFile: string;
  payload: string | ReturnType<typeof scorecardNodeComparison>;
} {
  const scorecard = computeOrgScorecard({
    workspace: params.workspace,
    window: params.window ?? "14d"
  });
  const outFile = resolve(params.workspace, params.outFile);
  ensureDir(dirname(outFile));

  if (params.format === "json") {
    const payload = scorecardNodeComparison(scorecard, params.nodeA, params.nodeB);
    writeFileAtomic(outFile, JSON.stringify(payload, null, 2), 0o644);
    return { outFile, payload };
  }

  const payload = renderOrgCompareMarkdown(scorecard, params.nodeA, params.nodeB);
  writeFileAtomic(outFile, payload, 0o644);
  return {
    outFile,
    payload
  };
}

export function orgLearnCli(params: {
  workspace: string;
  nodeId: string;
  outFile?: string;
}): ReturnType<typeof generateOrgEducationBrief> {
  const scorecard = computeOrgScorecard({
    workspace: params.workspace,
    window: "14d"
  });
  const out = generateOrgEducationBrief({
    workspace: params.workspace,
    nodeId: params.nodeId,
    scorecard
  });
  if (params.outFile) {
    const outFile = resolve(params.workspace, params.outFile);
    ensureDir(dirname(outFile));
    writeFileAtomic(outFile, out.markdown, 0o644);
  }
  return out;
}

export function orgOwnCli(params: {
  workspace: string;
  nodeId: string;
  outFile?: string;
}): ReturnType<typeof generateOrgOwnershipPlan> {
  const scorecard = computeOrgScorecard({
    workspace: params.workspace,
    window: "14d"
  });
  const out = generateOrgOwnershipPlan({
    workspace: params.workspace,
    nodeId: params.nodeId,
    scorecard
  });
  if (params.outFile) {
    const outFile = resolve(params.workspace, params.outFile);
    ensureDir(dirname(outFile));
    writeFileAtomic(outFile, out.markdown, 0o644);
  }
  return out;
}

export function orgCommitCli(params: {
  workspace: string;
  nodeId: string;
  days: number;
  outFile?: string;
}): ReturnType<typeof generateOrgCommitmentPlan> {
  const normalizedDays = params.days <= 14 ? 14 : params.days <= 30 ? 30 : 90;
  const scorecard = computeOrgScorecard({
    workspace: params.workspace,
    window: `${Math.max(14, normalizedDays)}d`
  });
  const out = generateOrgCommitmentPlan({
    workspace: params.workspace,
    nodeId: params.nodeId,
    scorecard,
    days: normalizedDays as 14 | 30 | 90
  });
  if (params.outFile) {
    const outFile = resolve(params.workspace, params.outFile);
    ensureDir(dirname(outFile));
    writeFileAtomic(outFile, out.markdown, 0o644);
  }
  return out;
}

export function orgWindowForDays(days: number): string {
  const ms = parseWindowToMs(`${days}d`);
  return `${Math.max(1, Math.round(ms / (24 * 60 * 60 * 1000)))}d`;
}
