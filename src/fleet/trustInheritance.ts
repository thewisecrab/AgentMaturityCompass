/**
 * Trust Inheritance Policy Modes
 *
 * Three modes for how trust propagates in multi-agent systems:
 * - STRICT: no trust inheritance, each agent evaluated independently
 * - WEIGHTED: trust proportional to evidence quality at each link (weighted harmonic mean)
 * - FLOOR: orchestrator trust floored at weakest verified link
 */

import { readFileSync } from "node:fs";
import { join } from "node:path";
import { z } from "zod";
import { fleetRoot } from "./paths.js";
import { ensureDir, pathExists, writeFileAtomic } from "../utils/fs.js";
import type { TrustLabel } from "../types.js";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type TrustInheritancePolicyMode = "STRICT" | "WEIGHTED" | "FLOOR";

export const trustInheritancePolicySchema = z.object({
  mode: z.enum(["STRICT", "WEIGHTED", "FLOOR"]).default("STRICT"),
  weightDecayFactor: z.number().min(0).max(1).default(0.9),
  minimumFloor: z.number().min(0).max(1).default(0.1),
});

export type TrustInheritancePolicy = z.infer<typeof trustInheritancePolicySchema>;

export interface AgentTrustInput {
  agentId: string;
  integrityIndex: number;
  confidence: number;
  evidenceQuality: number; // 0-1 based on observed/attested ratio
}

export interface InheritedTrustResult {
  mode: TrustInheritancePolicyMode;
  orchestratorId: string;
  ownTrust: number;
  compositeTrust: number;
  workerTrusts: { agentId: string; trust: number; weight: number }[];
  flooredBy: string | null;
  trustLabel: TrustLabel;
}

// ---------------------------------------------------------------------------
// Config I/O
// ---------------------------------------------------------------------------

function policyPath(workspace: string): string {
  return join(fleetRoot(workspace), "trust-inheritance-policy.yaml");
}

export function loadTrustInheritancePolicy(workspace: string): TrustInheritancePolicy {
  const file = policyPath(workspace);
  if (!pathExists(file)) {
    return trustInheritancePolicySchema.parse({});
  }
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const YAML = require("yaml") as typeof import("yaml");
  const raw = YAML.parse(readFileSync(file, "utf8")) as unknown;
  return trustInheritancePolicySchema.parse(raw);
}

export function saveTrustInheritancePolicy(workspace: string, policy: TrustInheritancePolicy): string {
  ensureDir(fleetRoot(workspace));
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const YAML = require("yaml") as typeof import("yaml");
  const file = policyPath(workspace);
  writeFileAtomic(file, YAML.stringify(policy), 0o644);
  return file;
}

export function setTrustInheritanceMode(workspace: string, mode: TrustInheritancePolicyMode): TrustInheritancePolicy {
  const policy = loadTrustInheritancePolicy(workspace);
  policy.mode = mode;
  saveTrustInheritancePolicy(workspace, policy);
  return policy;
}

// ---------------------------------------------------------------------------
// Trust computation
// ---------------------------------------------------------------------------

function trustLabelFromIndex(idx: number): TrustLabel {
  if (idx >= 0.7) return "HIGH TRUST";
  if (idx >= 0.4) return "LOW TRUST";
  return "UNRELIABLE — DO NOT USE FOR CLAIMS";
}

/**
 * Weighted harmonic mean of trust values.
 */
function weightedHarmonicMean(values: { value: number; weight: number }[]): number {
  const filtered = values.filter((v) => v.value > 0 && v.weight > 0);
  if (filtered.length === 0) return 0;
  const weightSum = filtered.reduce((s, v) => s + v.weight, 0);
  const reciprocalSum = filtered.reduce((s, v) => s + v.weight / v.value, 0);
  if (reciprocalSum === 0) return 0;
  return weightSum / reciprocalSum;
}

export function computeInheritedTrust(
  orchestrator: AgentTrustInput,
  workers: AgentTrustInput[],
  policy: TrustInheritancePolicy,
): InheritedTrustResult {
  const workerTrusts = workers.map((w) => ({
    agentId: w.agentId,
    trust: w.integrityIndex,
    weight: w.evidenceQuality * policy.weightDecayFactor,
  }));

  if (policy.mode === "STRICT") {
    return {
      mode: "STRICT",
      orchestratorId: orchestrator.agentId,
      ownTrust: orchestrator.integrityIndex,
      compositeTrust: orchestrator.integrityIndex,
      workerTrusts,
      flooredBy: null,
      trustLabel: trustLabelFromIndex(orchestrator.integrityIndex),
    };
  }

  if (policy.mode === "FLOOR") {
    const minWorker = workers.length > 0
      ? workers.reduce((min, w) => w.integrityIndex < min.integrityIndex ? w : min, workers[0]!)
      : null;
    const minWorkerTrust = minWorker?.integrityIndex ?? orchestrator.integrityIndex;
    const composite = Math.max(
      Math.min(orchestrator.integrityIndex, minWorkerTrust),
      policy.minimumFloor,
    );
    return {
      mode: "FLOOR",
      orchestratorId: orchestrator.agentId,
      ownTrust: orchestrator.integrityIndex,
      compositeTrust: composite,
      workerTrusts,
      flooredBy: minWorker && minWorkerTrust < orchestrator.integrityIndex ? minWorker.agentId : null,
      trustLabel: trustLabelFromIndex(composite),
    };
  }

  // WEIGHTED: weighted harmonic mean
  const allValues = [
    { value: orchestrator.integrityIndex, weight: 1 },
    ...workerTrusts.map((w) => ({ value: w.trust, weight: w.weight })),
  ];
  const composite = Math.max(weightedHarmonicMean(allValues), policy.minimumFloor);

  return {
    mode: "WEIGHTED",
    orchestratorId: orchestrator.agentId,
    ownTrust: orchestrator.integrityIndex,
    compositeTrust: composite,
    workerTrusts,
    flooredBy: null,
    trustLabel: trustLabelFromIndex(composite),
  };
}

// ---------------------------------------------------------------------------
// Rendering
// ---------------------------------------------------------------------------

export function renderTrustInheritanceMarkdown(result: InheritedTrustResult): string {
  const lines = [
    "# Trust Inheritance Result",
    "",
    `- Mode: ${result.mode}`,
    `- Orchestrator: ${result.orchestratorId}`,
    `- Own Trust: ${result.ownTrust.toFixed(3)}`,
    `- Composite Trust: ${result.compositeTrust.toFixed(3)}`,
    `- Trust Label: ${result.trustLabel}`,
    `- Floored By: ${result.flooredBy ?? "none"}`,
    "",
  ];

  if (result.workerTrusts.length > 0) {
    lines.push("## Worker Trusts");
    lines.push("| Agent | Trust | Weight |");
    lines.push("|---|---:|---:|");
    for (const w of result.workerTrusts) {
      lines.push(`| ${w.agentId} | ${w.trust.toFixed(3)} | ${w.weight.toFixed(3)} |`);
    }
  }

  return lines.join("\n");
}
