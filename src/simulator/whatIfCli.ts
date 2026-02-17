import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { questionBank } from "../diagnostic/questionBank.js";

export function parseTargetMappingFile(workspace: string, file: string): Record<string, number> {
  const parsed = JSON.parse(readFileSync(resolve(workspace, file), "utf8")) as Record<string, unknown>;
  const out: Record<string, number> = {};
  for (const question of questionBank) {
    const value = parsed[question.id];
    if (typeof value === "number" && Number.isFinite(value)) {
      out[question.id] = Math.max(0, Math.min(5, Math.round(value)));
    }
  }
  return out;
}

export function parseSetPairs(pairs: string[]): Record<string, number> {
  const out: Record<string, number> = {};
  for (const pair of pairs) {
    const idx = pair.indexOf("=");
    if (idx <= 0 || idx >= pair.length - 1) {
      throw new Error(`Invalid --set pair '${pair}', expected AMC-x.y=n`);
    }
    const key = pair.slice(0, idx).trim();
    const raw = Number(pair.slice(idx + 1).trim());
    if (!Number.isFinite(raw)) {
      throw new Error(`Invalid numeric level in --set '${pair}'`);
    }
    out[key] = Math.max(0, Math.min(5, Math.round(raw)));
  }
  return out;
}

