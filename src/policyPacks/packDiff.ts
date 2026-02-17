import { join } from "node:path";
import YAML from "yaml";
import { getPolicyPack } from "./builtInPacks.js";
import { pathExists, readUtf8 } from "../utils/fs.js";
import { resolveAgentId } from "../fleet/paths.js";
import { loadTargetProfile } from "../targets/targetProfile.js";
import { questionIds } from "../diagnostic/questionBank.js";

export interface PolicyPackDiffResult {
  packId: string;
  files: Array<{
    path: string;
    changed: boolean;
    beforeSha: string;
    afterSha: string;
  }>;
  targetDiff: Array<{
    questionId: string;
    before: number;
    after: number;
    delta: number;
  }>;
}

function simpleHash(text: string): string {
  let hash = 0;
  for (let i = 0; i < text.length; i += 1) {
    hash = (hash * 31 + text.charCodeAt(i)) >>> 0;
  }
  return hash.toString(16).padStart(8, "0");
}

function readOrEmpty(path: string): string {
  return pathExists(path) ? readUtf8(path) : "";
}

export function diffPolicyPack(params: {
  workspace: string;
  agentId?: string;
  packId: string;
}): PolicyPackDiffResult {
  const pack = getPolicyPack(params.packId);
  if (!pack) {
    throw new Error(`unknown policy pack: ${params.packId}`);
  }
  const agentId = resolveAgentId(params.workspace, params.agentId);
  const files = [
    { path: join(params.workspace, ".amc", "action-policy.yaml"), content: YAML.stringify(pack.actionPolicy) },
    { path: join(params.workspace, ".amc", "tools.yaml"), content: YAML.stringify(pack.tools) },
    { path: join(params.workspace, ".amc", "budgets.yaml"), content: YAML.stringify(pack.budgets) },
    { path: join(params.workspace, ".amc", "alerts.yaml"), content: YAML.stringify(pack.alerts) },
    { path: join(params.workspace, ".amc", "approval-policy.yaml"), content: YAML.stringify(pack.approvalPolicy) },
    { path: join(params.workspace, ".amc", "agents", agentId, "gatePolicy.json"), content: JSON.stringify(pack.gatePolicy, null, 2) }
  ];
  const fileDiff = files.map((row) => {
    const before = readOrEmpty(row.path);
    const after = row.content;
    return {
      path: row.path,
      changed: before !== after,
      beforeSha: simpleHash(before),
      afterSha: simpleHash(after)
    };
  });
  const target = (() => {
    try {
      return loadTargetProfile(params.workspace, "default", agentId);
    } catch {
      return null;
    }
  })();
  const targetDiff = questionIds.map((id) => {
    const before = target?.mapping[id] ?? 0;
    const after = pack.targetAdjustments[id] ?? before;
    return {
      questionId: id,
      before,
      after,
      delta: after - before
    };
  });
  return {
    packId: pack.id,
    files: fileDiff,
    targetDiff
  };
}
