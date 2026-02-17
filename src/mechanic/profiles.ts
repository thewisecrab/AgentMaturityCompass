import { join } from "node:path";
import YAML from "yaml";
import { questionBank } from "../diagnostic/questionBank.js";
import { signFileWithAuditor, verifySignedFileWithAuditor } from "../org/orgSigner.js";
import { ensureDir, pathExists, readUtf8, writeFileAtomic } from "../utils/fs.js";
import type { MechanicTargets } from "./targetSchema.js";
import { loadMechanicTargets, saveMechanicTargets, mechanicRoot } from "./targetsStore.js";
import { mechanicProfilesSchema, type MechanicProfile, type MechanicProfiles } from "./profileSchema.js";

function qids(): string[] {
  return [...questionBank].map((q) => q.id).sort((a, b) => a.localeCompare(b));
}

function targetsForProfile(levels: {
  dim1: number;
  dim2: number;
  dim3: number;
  dim4: number;
  dim5: number;
}): Record<string, number> {
  const out: Record<string, number> = {};
  for (const q of qids()) {
    if (q.startsWith("AMC-1.")) out[q] = levels.dim1;
    else if (q.startsWith("AMC-2.")) out[q] = levels.dim2;
    else if (q.startsWith("AMC-3.")) out[q] = levels.dim3;
    else if (q.startsWith("AMC-4.")) out[q] = levels.dim4;
    else out[q] = levels.dim5;
  }
  return out;
}

function builtInProfiles(): MechanicProfiles {
  const profiles: MechanicProfile[] = [
    {
      id: "safety-first-governor",
      name: "Safety-First Governor",
      description: "Prioritizes risk assurance, approvals discipline, and truthguard rigor.",
      targets: targetsForProfile({ dim1: 4, dim2: 4, dim3: 5, dim4: 5, dim5: 4 }),
      recommended: {
        policyPacks: ["code-agent.high"],
        budgetsBaseline: "conservative",
        toolAllowlistHints: ["fs.read", "git.status", "http.fetch"]
      },
      riskNotes: ["Lower autonomy for faster mitigation of high-impact mistakes.", "Increases approval load for security-sensitive changes."]
    },
    {
      id: "high-autonomy-builder",
      name: "High-Autonomy Builder",
      description: "Balances autonomy with strict budgets, lease scopes, and evidence gates.",
      targets: targetsForProfile({ dim1: 5, dim2: 4, dim3: 4, dim4: 4, dim5: 5 }),
      recommended: {
        policyPacks: ["code-agent.high"],
        budgetsBaseline: "balanced",
        toolAllowlistHints: ["fs.read", "fs.write", "git.status", "git.commit"]
      },
      riskNotes: ["Requires stronger monitoring and rapid freeze pathways.", "Execution freedom is conditional on observed evidence growth."]
    },
    {
      id: "support-cx-agent",
      name: "Support & CX Agent",
      description: "Optimizes support quality, empathy delivery, and safe escalation pathways.",
      targets: targetsForProfile({ dim1: 4, dim2: 4, dim3: 5, dim4: 4, dim5: 4 }),
      recommended: {
        policyPacks: ["support-agent.high"],
        budgetsBaseline: "support",
        toolAllowlistHints: ["fs.read", "http.fetch"]
      },
      riskNotes: ["Strong guardrails against over-claiming in customer communication.", "May reduce aggressive automation for edge cases."]
    },
    {
      id: "code-agent-excellence",
      name: "Code Agent Excellence",
      description: "Focuses on secure engineering velocity, reproducibility, and compliance-ready output.",
      targets: targetsForProfile({ dim1: 5, dim2: 4, dim3: 4, dim4: 5, dim5: 5 }),
      recommended: {
        policyPacks: ["code-agent.high"],
        budgetsBaseline: "engineering",
        toolAllowlistHints: ["fs.read", "fs.write", "git.status", "git.commit", "git.push"]
      },
      riskNotes: ["Requires frequent assurance runs to prevent silent regressions.", "High bar for deployment governance and evidence integrity."]
    },
    {
      id: "research-agent",
      name: "Research Agent",
      description: "Optimizes inquiry rigor, source traceability, and uncertainty discipline.",
      targets: targetsForProfile({ dim1: 4, dim2: 4, dim3: 5, dim4: 4, dim5: 5 }),
      recommended: {
        policyPacks: ["research-agent.high"],
        budgetsBaseline: "research",
        toolAllowlistHints: ["fs.read", "http.fetch"]
      },
      riskNotes: ["Stricter citation and uncertainty controls may slow response speed.", "Higher instrumentation burden to preserve trust in findings."]
    },
    {
      id: "sales-rev-agent",
      name: "Sales/Rev Agent",
      description: "Optimizes economic and brand value outcomes with strict claim governance.",
      targets: targetsForProfile({ dim1: 4, dim2: 5, dim3: 4, dim4: 4, dim5: 4 }),
      recommended: {
        policyPacks: ["sales-agent.high"],
        budgetsBaseline: "revenue",
        toolAllowlistHints: ["fs.read", "http.fetch"]
      },
      riskNotes: ["Hard limits on unsupported claims and outbound data handling.", "Requires approval rigor for customer-impacting automations."]
    }
  ];

  return mechanicProfilesSchema.parse({
    mechanicProfiles: {
      version: 1,
      profiles
    }
  });
}

export function mechanicProfilesPath(workspace: string): string {
  return join(mechanicRoot(workspace), "profiles.yaml");
}

export function mechanicProfilesSigPath(workspace: string): string {
  return `${mechanicProfilesPath(workspace)}.sig`;
}

export function initMechanicProfiles(workspace: string): { path: string; sigPath: string; profiles: MechanicProfiles } {
  const profiles = builtInProfiles();
  const path = mechanicProfilesPath(workspace);
  ensureDir(mechanicRoot(workspace));
  writeFileAtomic(path, YAML.stringify(profiles), 0o644);
  const sigPath = signFileWithAuditor(workspace, path);
  return { path, sigPath, profiles };
}

export function loadMechanicProfiles(workspace: string): MechanicProfiles {
  const path = mechanicProfilesPath(workspace);
  if (!pathExists(path)) {
    return initMechanicProfiles(workspace).profiles;
  }
  return mechanicProfilesSchema.parse(YAML.parse(readUtf8(path)) as unknown);
}

export function verifyMechanicProfilesSignature(workspace: string) {
  const path = mechanicProfilesPath(workspace);
  if (!pathExists(path)) {
    return {
      valid: false,
      signatureExists: false,
      reason: "mechanic profiles missing",
      path,
      sigPath: `${path}.sig`
    };
  }
  return verifySignedFileWithAuditor(workspace, path);
}

export function listMechanicProfiles(workspace: string): MechanicProfile[] {
  return [...loadMechanicProfiles(workspace).mechanicProfiles.profiles].sort((a, b) => a.id.localeCompare(b.id));
}

export function applyMechanicProfile(params: {
  workspace: string;
  profileId: string;
  mode: "DESIRED" | "EXCELLENCE";
  scopeType: "WORKSPACE" | "NODE" | "AGENT";
  scopeId: string;
  reason: string;
}): {
  profile: MechanicProfile;
  targets: MechanicTargets;
  path: string;
  sigPath: string;
} {
  const profiles = loadMechanicProfiles(params.workspace);
  const profile = profiles.mechanicProfiles.profiles.find((row) => row.id === params.profileId);
  if (!profile) {
    throw new Error(`unknown mechanic profile: ${params.profileId}`);
  }
  const current = loadMechanicTargets(params.workspace);
  const next: MechanicTargets = {
    mechanicTargets: {
      ...current.mechanicTargets,
      scope: {
        type: params.scopeType,
        id: params.scopeId
      },
      mode: params.mode,
      targets: Object.fromEntries(
        Object.entries(profile.targets).map(([key, value]) => [key, params.mode === "EXCELLENCE" ? 5 : value])
      ),
      updatedTs: Date.now()
    }
  };
  const saved = saveMechanicTargets({
    workspace: params.workspace,
    targets: next,
    reason: params.reason
  });
  return {
    profile,
    targets: next,
    ...saved
  };
}
