import { randomUUID } from "node:crypto";
import { join } from "node:path";
import YAML from "yaml";
import { ensureDir, pathExists, readUtf8, writeFileAtomic } from "../utils/fs.js";
import { signFileWithAuditor, verifySignedFileWithAuditor, type SignedFileVerification } from "./orgSigner.js";
import { orgSchema, type OrgConfig, type OrgNodeType } from "./orgSchema.js";
import { assertValidOrgGraph } from "./orgValidator.js";

export function orgConfigPath(workspace: string): string {
  return join(workspace, ".amc", "org.yaml");
}

export function orgConfigSigPath(workspace: string): string {
  return `${orgConfigPath(workspace)}.sig`;
}

export function orgRootDir(workspace: string): string {
  return join(workspace, ".amc", "org");
}

export function orgScorecardsDir(workspace: string): string {
  return join(orgRootDir(workspace), "scorecards");
}

export function orgScorecardHistoryDir(workspace: string): string {
  return join(orgScorecardsDir(workspace), "history");
}

export function orgCommitmentsDir(workspace: string): string {
  return join(orgRootDir(workspace), "commitments");
}

export function defaultOrgConfig(enterpriseName = "AMC Enterprise"): OrgConfig {
  return {
    version: 1,
    enterpriseId: `ent_${randomUUID()}`,
    enterpriseName,
    nodes: [
      {
        id: "enterprise",
        type: "ENTERPRISE",
        name: enterpriseName,
        parentId: null
      },
      {
        id: "ecosystem",
        type: "ECOSYSTEM",
        name: "Partner Ecosystem",
        parentId: null
      }
    ],
    memberships: [],
    policies: {
      inheritance: {
        enabled: true
      },
      defaultsByNode: {}
    }
  };
}

export function initOrgConfig(workspace: string, config?: OrgConfig): {
  path: string;
  sigPath: string;
  config: OrgConfig;
} {
  ensureDir(join(workspace, ".amc"));
  ensureDir(orgRootDir(workspace));
  ensureDir(orgScorecardsDir(workspace));
  ensureDir(orgScorecardHistoryDir(workspace));
  ensureDir(orgCommitmentsDir(workspace));
  const resolved = orgSchema.parse(config ?? defaultOrgConfig());
  assertValidOrgGraph(resolved);
  const path = orgConfigPath(workspace);
  writeFileAtomic(path, YAML.stringify(resolved), 0o644);
  const sigPath = signFileWithAuditor(workspace, path);
  return {
    path,
    sigPath,
    config: resolved
  };
}

export function loadOrgConfig(workspace: string): OrgConfig {
  const path = orgConfigPath(workspace);
  if (!pathExists(path)) {
    return defaultOrgConfig();
  }
  const parsed = YAML.parse(readUtf8(path)) as unknown;
  const config = orgSchema.parse(parsed);
  assertValidOrgGraph(config);
  return config;
}

export function verifyOrgConfigSignature(workspace: string): SignedFileVerification {
  return verifySignedFileWithAuditor(workspace, orgConfigPath(workspace));
}

export function saveOrgConfig(workspace: string, config: OrgConfig): {
  path: string;
  sigPath: string;
  config: OrgConfig;
} {
  const normalized = orgSchema.parse(config);
  assertValidOrgGraph(normalized);
  const path = orgConfigPath(workspace);
  writeFileAtomic(path, YAML.stringify(normalized), 0o644);
  const sigPath = signFileWithAuditor(workspace, path);
  return {
    path,
    sigPath,
    config: normalized
  };
}

export function addOrgNode(params: {
  workspace: string;
  id: string;
  type: OrgNodeType;
  name: string;
  parentId: string | null;
}): {
  path: string;
  sigPath: string;
  config: OrgConfig;
} {
  const config = loadOrgConfig(params.workspace);
  if (config.nodes.some((node) => node.id === params.id)) {
    throw new Error(`Node already exists: ${params.id}`);
  }
  const next: OrgConfig = {
    ...config,
    nodes: [
      ...config.nodes,
      {
        id: params.id,
        type: params.type,
        name: params.name,
        parentId: params.parentId
      }
    ]
  };
  return saveOrgConfig(params.workspace, next);
}

export function assignAgentToNode(params: {
  workspace: string;
  agentId: string;
  nodeId: string;
  weight?: number;
}): {
  path: string;
  sigPath: string;
  config: OrgConfig;
} {
  const config = loadOrgConfig(params.workspace);
  if (!config.nodes.some((node) => node.id === params.nodeId)) {
    throw new Error(`Node not found: ${params.nodeId}`);
  }
  const weight = params.weight ?? 1;
  const memberships = [...config.memberships];
  const existingIndex = memberships.findIndex((row) => row.agentId === params.agentId);
  if (existingIndex >= 0) {
    const row = memberships[existingIndex]!;
    memberships[existingIndex] = {
      ...row,
      nodeIds: [...new Set([...row.nodeIds, params.nodeId])],
      weight
    };
  } else {
    memberships.push({
      agentId: params.agentId,
      nodeIds: [params.nodeId],
      weight
    });
  }
  return saveOrgConfig(params.workspace, {
    ...config,
    memberships
  });
}

export function unassignAgentFromNode(params: {
  workspace: string;
  agentId: string;
  nodeId: string;
}): {
  path: string;
  sigPath: string;
  config: OrgConfig;
} {
  const config = loadOrgConfig(params.workspace);
  const memberships = config.memberships
    .map((row) => {
      if (row.agentId !== params.agentId) {
        return row;
      }
      return {
        ...row,
        nodeIds: row.nodeIds.filter((id) => id !== params.nodeId)
      };
    })
    .filter((row) => row.nodeIds.length > 0);
  return saveOrgConfig(params.workspace, {
    ...config,
    memberships
  });
}

export function memberWeightForNode(config: OrgConfig, agentId: string, nodeId: string): number {
  for (const membership of config.memberships) {
    if (membership.agentId === agentId && membership.nodeIds.includes(nodeId)) {
      return membership.weight;
    }
  }
  return 0;
}

export function nodeAgentIds(config: OrgConfig, nodeId: string): string[] {
  return config.memberships
    .filter((membership) => membership.nodeIds.includes(nodeId))
    .map((membership) => membership.agentId)
    .sort((a, b) => a.localeCompare(b));
}
