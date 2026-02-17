import { z } from "zod";

const hashesSchema = z
  .object({
    input_sha256: z.string().length(64).optional(),
    output_sha256: z.string().length(64).optional()
  })
  .optional();

export const amcTraceSchema = z.object({
  amc_trace_v: z.literal(1),
  ts: z.number().int().nonnegative(),
  agentId: z.string().min(1),
  event: z.enum(["llm_call", "llm_result", "tool_intent", "tool_result", "verification_step"]),
  request_id: z.string().optional(),
  receipt: z.string().optional(),
  providerId: z.string().optional(),
  model: z.string().optional(),
  note: z.string().optional(),
  hashes: hashesSchema
});

export type AMCTraceV1 = z.infer<typeof amcTraceSchema>;

export function parseTraceLine(line: string): AMCTraceV1 | null {
  const trimmed = line.trim();
  if (!trimmed.startsWith("{") || !trimmed.endsWith("}")) {
    return null;
  }
  try {
    const parsed = JSON.parse(trimmed) as unknown;
    const validated = amcTraceSchema.safeParse(parsed);
    if (!validated.success) {
      return null;
    }
    return validated.data;
  } catch {
    return null;
  }
}

export function parseTraceLines(text: string): AMCTraceV1[] {
  const traces: AMCTraceV1[] = [];
  for (const line of text.split(/\r?\n/)) {
    const parsed = parseTraceLine(line);
    if (parsed) {
      traces.push(parsed);
    }
  }
  return traces;
}
