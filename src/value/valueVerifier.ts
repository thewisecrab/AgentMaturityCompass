import { join } from "node:path";
import { readdirSync } from "node:fs";
import { pathExists } from "../utils/fs.js";
import { verifySignedFileWithAuditor } from "../org/orgSigner.js";
import {
  valueAgentContractPath,
  valueContractsDir,
  valueEventsDir,
  valuePolicyPath,
  valueSnapshotLatestPath,
  verifyValuePolicySignature,
  verifyValueSchedulerSignature
} from "./valueStore.js";

export function verifyValueWorkspace(workspace: string): {
  ok: boolean;
  errors: string[];
} {
  const errors: string[] = [];
  const policy = verifyValuePolicySignature(workspace);
  if (!policy.valid) {
    errors.push(`policy: ${policy.reason ?? "invalid"}`);
  }
  const scheduler = verifyValueSchedulerSignature(workspace);
  if (!(scheduler.valid || !scheduler.signatureExists)) {
    errors.push(`scheduler: ${scheduler.reason ?? "invalid"}`);
  }

  const workspaceContract = verifySignedFileWithAuditor(workspace, join(valueContractsDir(workspace), "workspace.yaml"));
  if (!(workspaceContract.valid || !workspaceContract.signatureExists)) {
    errors.push(`workspace contract: ${workspaceContract.reason ?? "invalid"}`);
  }

  const agentsDir = join(valueContractsDir(workspace), "agents");
  if (pathExists(agentsDir)) {
    for (const name of readdirSync(agentsDir)) {
      if (!name.endsWith(".yaml")) {
        continue;
      }
      const agentId = name.slice(0, -5);
      const verify = verifySignedFileWithAuditor(workspace, valueAgentContractPath(workspace, agentId));
      if (!verify.valid) {
        errors.push(`agent contract ${agentId}: ${verify.reason ?? "invalid"}`);
      }
    }
  }

  const snapshotDir = join(workspace, ".amc", "value", "snapshots");
  if (pathExists(snapshotDir)) {
    const workspaceLatest = valueSnapshotLatestPath(workspace, { type: "WORKSPACE", id: "workspace" });
    if (pathExists(workspaceLatest)) {
      const verify = verifySignedFileWithAuditor(workspace, workspaceLatest);
      if (!verify.valid) {
        errors.push(`workspace snapshot: ${verify.reason ?? "invalid"}`);
      }
    }
  }

  const eventsDir = valueEventsDir(workspace);
  if (pathExists(eventsDir)) {
    for (const monthEntry of readdirSync(eventsDir, { withFileTypes: true })) {
      if (!monthEntry.isDirectory()) {
        continue;
      }
      const file = join(eventsDir, monthEntry.name, "events.ndjson");
      const sha = `${file}.sha256`;
      if (!pathExists(file) || !pathExists(sha)) {
        errors.push(`events file missing hash for ${monthEntry.name}`);
      }
    }
  }

  return {
    ok: errors.length === 0,
    errors
  };
}

export function valuePolicyFilePath(workspace: string): string {
  return valuePolicyPath(workspace);
}
