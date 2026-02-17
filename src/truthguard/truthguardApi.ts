import { loadBridgeConfig } from "../bridge/bridgeConfigStore.js";
import { openLedger } from "../ledger/ledger.js";
import { listToolhubTools } from "../toolhub/toolhubCli.js";
import { validateTruthguardOutput } from "./truthguardEngine.js";
import type { TruthguardResult } from "./truthguardSchema.js";

function collectAllowedModels(workspace: string): string[] {
  const config = loadBridgeConfig(workspace);
  const rows: string[] = [];
  for (const provider of Object.values(config.bridge.providers)) {
    if (!provider.enabled) {
      continue;
    }
    rows.push(...provider.modelAllowlist);
  }
  return [...new Set(rows)].sort((a, b) => a.localeCompare(b));
}

function collectAllowedTools(workspace: string): string[] {
  return listToolhubTools(workspace).map((row) => row.name).sort((a, b) => a.localeCompare(b));
}

function collectKnownEvidenceRefs(workspace: string): Set<string> {
  const ledger = openLedger(workspace);
  try {
    const refs = new Set<string>();
    for (const row of ledger.getAllEvents()) {
      refs.add(row.id);
      refs.add(row.event_hash);
    }
    return refs;
  } finally {
    ledger.close();
  }
}

export function validateTruthguardForWorkspace(params: {
  workspace: string;
  output: unknown;
}): {
  result: TruthguardResult;
  context: {
    allowedTools: string[];
    allowedModels: string[];
    evidenceBound: boolean;
  };
} {
  const allowedTools = collectAllowedTools(params.workspace);
  const allowedModels = collectAllowedModels(params.workspace);
  const knownEvidenceRefs = collectKnownEvidenceRefs(params.workspace);
  const result = validateTruthguardOutput({
    output: params.output,
    allowedTools,
    allowedModels,
    knownEvidenceRefs
  });

  const evidenceBound = result.status === "PASS" && result.missingEvidenceRefs.length === 0;
  return {
    result,
    context: {
      allowedTools,
      allowedModels,
      evidenceBound
    }
  };
}
