import { randomUUID } from "node:crypto";

export interface AMCSpanRecord {
  spanId: string;
  name: string;
  startedTs: number;
  endedTs: number;
  durationMs: number;
  ok: boolean;
}

export async function runSpan<T>(name: string, fn: () => Promise<T> | T): Promise<{ result: T; span: AMCSpanRecord }> {
  const spanId = `span_${randomUUID().replace(/-/g, "")}`;
  const startedTs = Date.now();
  try {
    const result = await fn();
    const endedTs = Date.now();
    return {
      result,
      span: {
        spanId,
        name,
        startedTs,
        endedTs,
        durationMs: endedTs - startedTs,
        ok: true
      }
    };
  } catch (error) {
    const endedTs = Date.now();
    throw Object.assign(error instanceof Error ? error : new Error(String(error)), {
      amcSpan: {
        spanId,
        name,
        startedTs,
        endedTs,
        durationMs: endedTs - startedTs,
        ok: false
      } satisfies AMCSpanRecord
    });
  }
}
