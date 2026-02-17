import { join, resolve } from "node:path";
import { ensureDir } from "../utils/fs.js";

export interface ReleasePaths {
  rootDir: string;
  keyDir: string;
  publicKeyPath: string;
  defaultPrivateKeyPath: string;
  workingDir: string;
}

export function releasePaths(workspace: string): ReleasePaths {
  const rootDir = join(resolve(workspace), ".amc", "release");
  const keyDir = join(rootDir, "keys");
  return {
    rootDir,
    keyDir,
    publicKeyPath: join(keyDir, "release-signing.pub"),
    defaultPrivateKeyPath: join(keyDir, "release-signing"),
    workingDir: join(rootDir, "working")
  };
}

export function ensureReleaseDirs(workspace: string): ReleasePaths {
  const paths = releasePaths(workspace);
  ensureDir(paths.rootDir);
  ensureDir(paths.keyDir);
  ensureDir(paths.workingDir);
  return paths;
}
