import { spawnSync } from "node:child_process";
import { accessSync, constants as fsConstants } from "node:fs";
import { delimiter, isAbsolute, join } from "node:path";
import type { AdapterDefinition } from "./adapterTypes.js";

export interface AdapterDetectionResult {
  adapterId: string;
  installed: boolean;
  command: string | null;
  version: string | null;
  detail: string;
}

const DEFAULT_DETECTION_TIMEOUT_MS = 1200;

interface ProbeResult {
  ok: boolean;
  exists: boolean;
  output: string;
  status: number | null;
  errorCode: string | null;
}

function probeVersion(command: string, args: string[], timeoutMs: number): ProbeResult {
  const out = spawnSync(command, args, { encoding: "utf8", timeout: timeoutMs });
  const merged = `${out.stdout ?? ""}${out.stderr ?? ""}`.trim();
  const error = out.error as NodeJS.ErrnoException | undefined;
  const errorCode = error?.code ?? null;
  return {
    ok: out.status === 0 && !out.error,
    exists: errorCode !== "ENOENT",
    output: merged,
    status: out.status,
    errorCode
  };
}

function commandExistsInPath(command: string): boolean {
  const candidates: string[] = [];
  if (command.includes("/") || isAbsolute(command)) {
    candidates.push(command);
  } else {
    const pathEnv = process.env.PATH ?? "";
    for (const root of pathEnv.split(delimiter)) {
      if (!root) {
        continue;
      }
      candidates.push(join(root, command));
    }
  }
  for (const candidatePath of candidates) {
    try {
      accessSync(candidatePath, fsConstants.X_OK);
      return true;
    } catch {
      // continue
    }
  }
  return false;
}

export function detectAdapter(definition: AdapterDefinition, options?: { timeoutMs?: number }): AdapterDetectionResult {
  const timeoutMs = options?.timeoutMs ?? DEFAULT_DETECTION_TIMEOUT_MS;
  const failedCandidates: string[] = [];
  for (const candidate of definition.detection.commandCandidates) {
    if (!commandExistsInPath(candidate)) {
      continue;
    }
    const probe = probeVersion(candidate, definition.detection.versionArgs, timeoutMs);
    if (!probe.ok) {
      const reason = probe.errorCode ? `error=${probe.errorCode}` : `status=${probe.status ?? "unknown"}`;
      failedCandidates.push(`${candidate}(${reason})`);
      continue;
    }
    const version = (new RegExp(definition.detection.parseVersionRegex).exec(probe.output)?.[1] ?? probe.output) || "unknown";
    return {
      adapterId: definition.id,
      installed: true,
      command: candidate,
      version,
      detail: `${candidate} ${version}`
    };
  }
  if (failedCandidates.length > 0) {
    return {
      adapterId: definition.id,
      installed: true,
      command: failedCandidates[0]!.split("(")[0] ?? definition.detection.commandCandidates[0] ?? null,
      version: null,
      detail: `found command(s) but version probe failed: ${failedCandidates.join(", ")}`
    };
  }
  return {
    adapterId: definition.id,
    installed: false,
    command: null,
    version: null,
    detail: `missing commands: ${definition.detection.commandCandidates.join(", ")}`
  };
}
