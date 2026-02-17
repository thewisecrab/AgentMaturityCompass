import { randomBytes } from "node:crypto";
import { readFileSync, readdirSync, rmSync } from "node:fs";
import { join } from "node:path";
import { ensureDir, pathExists, writeFileAtomic } from "../utils/fs.js";

export interface StudioState {
  pid: number;
  startedTs: number;
  apiPort: number;
  gatewayPort: number;
  proxyPort: number;
  dashboardPort: number;
  metricsPort?: number;
  metricsHost?: string;
  host: string;
  lanEnabled?: boolean;
  pairingRequired?: boolean;
  currentAgent: string;
  vaultUnlocked: boolean;
  untrustedConfig: boolean;
  logFile: string;
  lastLease?: {
    agentId: string;
    leaseId: string;
    issuedTs: number;
    expiresTs: number;
  };
}

export function studioDir(workspace: string): string {
  return join(workspace, ".amc", "studio");
}

export function studioLogsDir(workspace: string): string {
  return join(studioDir(workspace), "logs");
}

export function studioSessionsDir(workspace: string): string {
  return join(studioDir(workspace), "sessions");
}

export function studioHumanAuditPath(workspace: string): string {
  return join(studioDir(workspace), "audit", "human.log");
}

export function studioStatePath(workspace: string): string {
  return join(studioDir(workspace), "state.json");
}

export function studioTokenPath(workspace: string): string {
  return join(studioDir(workspace), "admin.token");
}

export function studioAgentTokenDir(workspace: string): string {
  return join(studioDir(workspace), "agent.tokens");
}

function studioAgentTokenPath(workspace: string, agentId: string): string {
  return join(studioAgentTokenDir(workspace), `${agentId}.token`);
}

function studioAgentTokenMetaPath(workspace: string, agentId: string): string {
  return join(studioAgentTokenDir(workspace), `${agentId}.token.meta.json`);
}

export function writeStudioState(workspace: string, state: StudioState): void {
  ensureDir(studioDir(workspace));
  writeFileAtomic(studioStatePath(workspace), JSON.stringify(state, null, 2), 0o644);
}

export function readStudioState(workspace: string): StudioState | null {
  const file = studioStatePath(workspace);
  if (!pathExists(file)) {
    return null;
  }
  return JSON.parse(readFileSync(file, "utf8")) as StudioState;
}

export function updateStudioLastLease(workspace: string, lease: {
  agentId: string;
  leaseId: string;
  issuedTs: number;
  expiresTs: number;
}): void {
  const current = readStudioState(workspace);
  if (!current) {
    return;
  }
  writeStudioState(workspace, {
    ...current,
    lastLease: lease
  });
}

export function clearStudioState(workspace: string): void {
  const file = studioStatePath(workspace);
  if (pathExists(file)) {
    rmSync(file, { force: true });
  }
}

export function ensureAdminToken(workspace: string): string {
  const tokenFile = studioTokenPath(workspace);
  ensureDir(studioDir(workspace));
  if (pathExists(tokenFile)) {
    return readFileSync(tokenFile, "utf8").trim();
  }
  const token = randomBytes(32).toString("hex");
  writeFileAtomic(tokenFile, `${token}\n`, 0o600);
  return token;
}

export function readAdminToken(workspace: string): string {
  const file = studioTokenPath(workspace);
  if (!pathExists(file)) {
    throw new Error("Studio admin token not found. Start studio with `amc up` first.");
  }
  return readFileSync(file, "utf8").trim();
}

export function ensureAgentToken(workspace: string, agentId: string): {
  token: string;
  tokenPath: string;
  scopes: string[];
} {
  const dir = studioAgentTokenDir(workspace);
  ensureDir(dir);
  const tokenPath = studioAgentTokenPath(workspace, agentId);
  const metaPath = studioAgentTokenMetaPath(workspace, agentId);
  const scopes = ["toolhub:intent", "toolhub:execute", "governor:check", "receipt:verify"];
  if (pathExists(tokenPath)) {
    if (!pathExists(metaPath)) {
      writeFileAtomic(
        metaPath,
        JSON.stringify(
          {
            agentId,
            scopes
          },
          null,
          2
        ),
        0o600
      );
    }
    return {
      token: readFileSync(tokenPath, "utf8").trim(),
      tokenPath,
      scopes
    };
  }
  const token = randomBytes(32).toString("hex");
  writeFileAtomic(tokenPath, `${token}\n`, 0o600);
  writeFileAtomic(
    metaPath,
    JSON.stringify(
      {
        agentId,
        scopes
      },
      null,
      2
    ),
    0o600
  );
  return {
    token,
    tokenPath,
    scopes
  };
}

export function readAgentToken(workspace: string, agentId: string): {
  token: string;
  scopes: string[];
} {
  const tokenPath = studioAgentTokenPath(workspace, agentId);
  const metaPath = studioAgentTokenMetaPath(workspace, agentId);
  if (!pathExists(tokenPath) || !pathExists(metaPath)) {
    throw new Error(`Agent token not found for ${agentId}.`);
  }
  const meta = JSON.parse(readFileSync(metaPath, "utf8")) as { scopes?: unknown };
  return {
    token: readFileSync(tokenPath, "utf8").trim(),
    scopes: Array.isArray(meta.scopes) ? meta.scopes.filter((item): item is string => typeof item === "string") : []
  };
}

export function findAgentByToken(workspace: string, token: string): {
  agentId: string;
  scopes: string[];
} | null {
  const dir = studioAgentTokenDir(workspace);
  if (!pathExists(dir)) {
    return null;
  }
  const files = readdirSync(dir).filter((name) => name.endsWith(".token"));
  for (const file of files) {
    const agentId = file.slice(0, -".token".length);
    try {
      const record = readAgentToken(workspace, agentId);
      if (record.token === token) {
        return {
          agentId,
          scopes: record.scopes
        };
      }
    } catch {
      continue;
    }
  }
  return null;
}

export function processRunning(pid: number): boolean {
  try {
    process.kill(pid, 0);
    return true;
  } catch {
    return false;
  }
}
