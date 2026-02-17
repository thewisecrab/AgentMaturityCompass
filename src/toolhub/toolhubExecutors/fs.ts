import { readFileSync, writeFileSync } from "node:fs";

export function executeFsRead(params: {
  path: string;
  maxBytes: number;
  simulate: boolean;
}): { output: string; bytes: number } {
  if (params.simulate) {
    return {
      output: `SIMULATE fs.read ${params.path} (maxBytes=${params.maxBytes})`,
      bytes: 0
    };
  }
  const raw = readFileSync(params.path);
  const slice = raw.subarray(0, Math.min(raw.length, params.maxBytes));
  return {
    output: slice.toString("utf8"),
    bytes: slice.length
  };
}

export function executeFsWrite(params: {
  path: string;
  content: string;
  simulate: boolean;
}): { output: string; bytes: number } {
  if (params.simulate) {
    return {
      output: `SIMULATE fs.write ${params.path} (${Buffer.byteLength(params.content, "utf8")} bytes)`,
      bytes: 0
    };
  }
  writeFileSync(params.path, params.content, "utf8");
  return {
    output: `WROTE ${params.path}`,
    bytes: Buffer.byteLength(params.content, "utf8")
  };
}
