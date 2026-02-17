import { spawnSync } from "node:child_process";

export function executeGit(params: {
  subcommand: "status" | "commit" | "push";
  args: string[];
  cwd: string;
  simulate: boolean;
}): { code: number; stdout: string; stderr: string } {
  if (params.simulate) {
    return {
      code: 0,
      stdout: `SIMULATE git ${params.subcommand} ${params.args.join(" ")}`.trim(),
      stderr: ""
    };
  }
  const cmdArgs = [params.subcommand, ...params.args];
  const out = spawnSync("git", cmdArgs, { cwd: params.cwd, encoding: "utf8" });
  return {
    code: out.status ?? 1,
    stdout: out.stdout ?? "",
    stderr: out.stderr ?? ""
  };
}
