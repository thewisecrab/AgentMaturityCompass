import { spawnSync } from "node:child_process";

export function executeProcessSpawn(params: {
  binary: string;
  argv: string[];
  cwd: string;
  env?: Record<string, string>;
  simulate: boolean;
}): { code: number; stdout: string; stderr: string } {
  if (params.simulate) {
    return {
      code: 0,
      stdout: `SIMULATE ${params.binary} ${params.argv.join(" ")}`.trim(),
      stderr: ""
    };
  }

  const out = spawnSync(params.binary, params.argv, {
    cwd: params.cwd,
    env: {
      ...process.env,
      ...(params.env ?? {})
    },
    encoding: "utf8"
  });
  return {
    code: out.status ?? 1,
    stdout: out.stdout ?? "",
    stderr: out.stderr ?? ""
  };
}
