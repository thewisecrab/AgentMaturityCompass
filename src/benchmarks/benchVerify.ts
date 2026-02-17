import { spawnSync } from "node:child_process";
import { mkdtempSync, readFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { verifyHexDigestAny } from "../crypto/keys.js";
import { pathExists, readUtf8 } from "../utils/fs.js";
import { sha256Hex } from "../utils/hash.js";
import { benchmarkSchema, type BenchmarkArtifact } from "./benchSchema.js";

interface BenchSignature {
  digestSha256: string;
  signature: string;
  signedTs: number;
  signer: "auditor";
}

function runTarExtract(bundleFile: string, outputDir: string): void {
  const out = spawnSync("tar", ["-xzf", bundleFile, "-C", outputDir], {
    encoding: "utf8"
  });
  if (out.status !== 0) {
    throw new Error(`Failed to extract benchmark artifact: ${(`${out.stdout ?? ""}${out.stderr ?? ""}`).trim()}`);
  }
}

export function verifyBenchmarkArtifact(file: string): {
  ok: boolean;
  bench: BenchmarkArtifact | null;
  errors: string[];
} {
  const tmp = mkdtempSync(join(tmpdir(), "amc-bench-verify-"));
  const errors: string[] = [];
  let bench: BenchmarkArtifact | null = null;
  try {
    runTarExtract(file, tmp);
    const benchPath = join(tmp, "bench.json");
    const sigPath = join(tmp, "bench.sig");
    const pubPath = join(tmp, "public-keys", "auditor.pub");
    if (!pathExists(benchPath)) {
      errors.push("bench.json missing");
      return { ok: false, bench: null, errors };
    }
    if (!pathExists(sigPath)) {
      errors.push("bench.sig missing");
      return { ok: false, bench: null, errors };
    }
    if (!pathExists(pubPath)) {
      errors.push("public-keys/auditor.pub missing");
      return { ok: false, bench: null, errors };
    }
    bench = benchmarkSchema.parse(JSON.parse(readUtf8(benchPath)) as unknown);
    const signature = JSON.parse(readUtf8(sigPath)) as BenchSignature;
    const digest = sha256Hex(readFileSync(benchPath));
    if (digest !== signature.digestSha256) {
      errors.push("bench digest mismatch");
    }
    const pub = readUtf8(pubPath);
    const valid = verifyHexDigestAny(digest, signature.signature, [pub]);
    if (!valid) {
      errors.push("signature verification failed");
    }
    return {
      ok: errors.length === 0,
      bench,
      errors
    };
  } catch (error) {
    return {
      ok: false,
      bench,
      errors: [...errors, String(error)]
    };
  } finally {
    rmSync(tmp, { recursive: true, force: true });
  }
}

