import {
  buildBenchProofs,
  verifyBenchProofBundle,
  writeBenchProofFiles,
  type BenchProofBundle
} from "../bench/benchProofs.js";

export function buildBinderProofs(params: {
  workspace: string;
  includeEventKinds: string[];
  maxProofs?: number;
}): BenchProofBundle {
  return buildBenchProofs({
    workspace: params.workspace,
    includeEventKinds: params.includeEventKinds,
    maxProofs: params.maxProofs ?? 40
  });
}

export function writeBinderProofFiles(params: {
  outDir: string;
  bundle: BenchProofBundle;
}): {
  proofIds: string[];
  transparencyRootSha256: string;
  merkleRootSha256: string;
} {
  return writeBenchProofFiles(params);
}

export function verifyBinderProofs(bundle: BenchProofBundle): {
  ok: boolean;
  errors: string[];
} {
  return verifyBenchProofBundle(bundle);
}
