import {
  currentTransparencyMerkleRoot,
  ensureTransparencyMerkleInitialized,
  listTransparencyMerkleRoots,
  verifyTransparencyMerkle
} from "./merkleIndexStore.js";

export function transparencyMerkleStatus(workspace: string, historyLimit = 20): {
  verify: ReturnType<typeof verifyTransparencyMerkle>;
  current: ReturnType<typeof currentTransparencyMerkleRoot>;
  history: ReturnType<typeof listTransparencyMerkleRoots>;
} {
  ensureTransparencyMerkleInitialized(workspace);
  return {
    verify: verifyTransparencyMerkle(workspace),
    current: currentTransparencyMerkleRoot(workspace),
    history: listTransparencyMerkleRoots(workspace, historyLimit)
  };
}
