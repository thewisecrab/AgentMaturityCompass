import { runRetention, retentionStatus, verifyRetention } from "./retentionEngine.js";

export function retentionStatusCli(workspace: string): ReturnType<typeof retentionStatus> {
  return retentionStatus(workspace);
}

export function retentionRunCli(workspace: string, dryRun: boolean): ReturnType<typeof runRetention> {
  return runRetention({
    workspace,
    dryRun
  });
}

export async function retentionVerifyCli(workspace: string): Promise<Awaited<ReturnType<typeof verifyRetention>>> {
  return verifyRetention(workspace);
}

