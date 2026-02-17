import { readFileSync } from "node:fs";
import { join } from "node:path";
import { packageMeta } from "./releaseManifest.js";
import { deterministicTimestamp } from "./releaseUtils.js";
import { writeFileAtomic } from "../utils/fs.js";
import { canonicalize } from "../utils/json.js";

interface LockPackageEntry {
  version?: string;
  resolved?: string;
  integrity?: string;
  license?: string;
}

interface PackageLockV2 {
  name?: string;
  version?: string;
  lockfileVersion?: number;
  packages?: Record<string, LockPackageEntry>;
}

function parseNameFromPath(pathKey: string): string {
  const marker = "node_modules/";
  const idx = pathKey.lastIndexOf(marker);
  if (idx < 0) {
    return pathKey;
  }
  return pathKey.slice(idx + marker.length);
}

export function generateCycloneDxSbom(workspace: string): Record<string, unknown> {
  const lockPath = join(workspace, "package-lock.json");
  const lock = JSON.parse(readFileSync(lockPath, "utf8")) as PackageLockV2;
  const pkg = packageMeta(workspace);
  const components = Object.entries(lock.packages ?? {})
    .filter(([pathKey]) => pathKey !== "")
    .map(([pathKey, entry]) => {
      const name = parseNameFromPath(pathKey);
      const version = entry.version ?? "0.0.0";
      const purlName = encodeURIComponent(name);
      return {
        type: "library",
        name,
        version,
        purl: `pkg:npm/${purlName}@${version}`,
        licenses: [
          {
            license: {
              id: entry.license ?? "UNKNOWN"
            }
          }
        ],
        hashes: entry.integrity
          ? [
              {
                alg: "SHA-512",
                content: entry.integrity.replace(/^sha512-/, "")
              }
            ]
          : []
      };
    })
    .sort((a, b) => `${a.name}@${a.version}`.localeCompare(`${b.name}@${b.version}`));

  return {
    bomFormat: "CycloneDX",
    specVersion: "1.5",
    version: 1,
    metadata: {
      timestamp: new Date(deterministicTimestamp()).toISOString(),
      component: {
        type: "application",
        name: pkg.name,
        version: pkg.version
      }
    },
    components
  };
}

export function writeSbom(workspace: string, outPath: string): { path: string; json: Record<string, unknown> } {
  const sbom = generateCycloneDxSbom(workspace);
  writeFileAtomic(outPath, `${canonicalize(sbom)}\n`, 0o644);
  return { path: outPath, json: sbom };
}
