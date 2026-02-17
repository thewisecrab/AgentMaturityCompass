import { createBackup, printBackup, restoreBackup, verifyBackup } from "./backupEngine.js";

export function backupCreateCli(workspace: string, outFile: string): ReturnType<typeof createBackup> {
  return createBackup({
    workspace,
    outFile
  });
}

export function backupVerifyCli(params: { backupFile: string; pubkeyPath?: string; passphrase?: string }): ReturnType<typeof verifyBackup> {
  return verifyBackup(params);
}

export function backupPrintCli(backupFile: string): ReturnType<typeof printBackup> {
  return printBackup(backupFile);
}

export async function backupRestoreCli(params: {
  backupFile: string;
  toDir: string;
  force?: boolean;
  passphrase?: string;
}): Promise<Awaited<ReturnType<typeof restoreBackup>>> {
  return restoreBackup(params);
}

