import type { OrgSseHub } from "../org/orgSse.js";

export type BenchEventType =
  | "BENCH_CREATED"
  | "BENCH_PUBLISHED"
  | "BENCH_IMPORTED"
  | "BENCH_COMPARISON_UPDATED"
  | "BENCH_REGISTRY_UPDATED";

export function emitBenchSse(params: {
  hub: OrgSseHub;
  type: BenchEventType;
  nodeIds?: string[];
}): void {
  params.hub.emit({
    type: params.type,
    nodeIds: params.nodeIds ?? [],
    ts: Date.now(),
    version: 1
  });
}

