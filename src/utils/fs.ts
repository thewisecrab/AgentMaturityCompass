import { chmodSync, existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname } from "node:path";

export function ensureDir(path: string): void {
  mkdirSync(path, { recursive: true });
}

export function writeFileAtomic(path: string, data: string | Buffer, mode?: number): void {
  ensureDir(dirname(path));
  writeFileSync(path, data);
  if (mode !== undefined) {
    chmodSync(path, mode);
  }
}

export function readUtf8(path: string): string {
  return readFileSync(path, "utf8");
}

export function pathExists(path: string): boolean {
  return existsSync(path);
}
