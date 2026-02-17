import { listAgents } from "../fleet/registry.js";
import {
  verifyCgxPolicySignature,
  verifyLatestCgxContextPack,
  verifyLatestCgxGraph
} from "./cgxStore.js";

export function verifyCgxWorkspace(workspace: string): {
  policy: ReturnType<typeof verifyCgxPolicySignature>;
  workspaceGraph: ReturnType<typeof verifyLatestCgxGraph>;
  agentGraphs: Array<{ agentId: string; verify: ReturnType<typeof verifyLatestCgxGraph> }>;
  agentPacks: Array<{ agentId: string; verify: ReturnType<typeof verifyLatestCgxContextPack> }>;
} {
  const policy = verifyCgxPolicySignature(workspace);
  const workspaceGraph = verifyLatestCgxGraph(workspace, {
    type: "workspace",
    id: "workspace"
  });
  const agents = listAgents(workspace).map((row) => row.id).sort((a, b) => a.localeCompare(b));
  const agentGraphs = agents.map((agentId) => ({
    agentId,
    verify: verifyLatestCgxGraph(workspace, {
      type: "agent",
      id: agentId
    })
  }));
  const agentPacks = agents.map((agentId) => ({
    agentId,
    verify: verifyLatestCgxContextPack(workspace, agentId)
  }));
  return {
    policy,
    workspaceGraph,
    agentGraphs,
    agentPacks
  };
}
