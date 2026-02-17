import { z } from "zod";

export const smokeModeSchema = z.enum(["local", "docker", "helm-template"]);
export type SmokeMode = z.infer<typeof smokeModeSchema>;

export const smokeStepSchema = z.object({
  id: z.string().min(1),
  status: z.enum(["PASS", "FAIL", "SKIP"]),
  ms: z.number().int().nonnegative(),
  details: z.array(z.string()).default([])
});
export type SmokeStep = z.infer<typeof smokeStepSchema>;

export const smokeReportSchema = z.object({
  status: z.enum(["PASS", "FAIL"]),
  mode: smokeModeSchema,
  generatedTs: z.number().int(),
  steps: z.array(smokeStepSchema),
  artifacts: z.record(z.string(), z.string()),
  warnings: z.array(z.string())
});
export type SmokeReport = z.infer<typeof smokeReportSchema>;
