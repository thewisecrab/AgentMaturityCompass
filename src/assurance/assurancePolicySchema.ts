import { z } from "zod";

export const assurancePolicyEventSchema = z.enum([
  "POLICY_APPLIED",
  "PLUGIN_INSTALLED",
  "PROMPT_POLICY_APPLIED",
  "PROMPT_PACK_CREATED",
  "BUDGETS_APPLY",
  "TOOLS_APPLY",
  "NOTARY_ATTESTATION_OBSERVED",
  "RELEASE_BUNDLE_VERIFIED"
]);

export const assurancePolicySchema = z.object({
  assurancePolicy: z.object({
    version: z.literal(1),
    cadence: z.object({
      defaultRunHours: z.number().int().min(1),
      runAfterEvents: z.array(assurancePolicyEventSchema).default([])
    }),
    gates: z.object({
      minIntegrityIndex: z.number().min(0).max(1),
      minCorrelationRatio: z.number().min(0).max(1),
      minObservedShare: z.number().min(0).max(1)
    }),
    thresholds: z.object({
      minRiskAssuranceScore: z.number().min(0).max(100),
      maxCriticalFindings: z.number().int().min(0),
      maxHighFindings: z.number().int().min(0),
      failClosedIfBelowThresholds: z.boolean()
    }),
    packsEnabled: z.object({
      injection: z.boolean(),
      exfiltration: z.boolean(),
      toolMisuse: z.boolean(),
      truthfulness: z.boolean(),
      sandboxBoundary: z.boolean(),
      notaryAttestation: z.boolean()
    }),
    redaction: z.object({
      storeRawPrompts: z.literal(false),
      storeRawOutputs: z.literal(false),
      storeOnlyHashesAndRefs: z.literal(true)
    }),
    reporting: z.object({
      includeRunSummaryInConsole: z.boolean(),
      dispatchCriticalToIntegrations: z.boolean()
    })
  })
});

export type AssurancePolicy = z.infer<typeof assurancePolicySchema>;

export function defaultAssurancePolicy(): AssurancePolicy {
  return assurancePolicySchema.parse({
    assurancePolicy: {
      version: 1,
      cadence: {
        defaultRunHours: 168,
        runAfterEvents: [
          "POLICY_APPLIED",
          "PLUGIN_INSTALLED",
          "PROMPT_POLICY_APPLIED",
          "PROMPT_PACK_CREATED",
          "BUDGETS_APPLY",
          "TOOLS_APPLY",
          "NOTARY_ATTESTATION_OBSERVED",
          "RELEASE_BUNDLE_VERIFIED"
        ]
      },
      gates: {
        minIntegrityIndex: 0.9,
        minCorrelationRatio: 0.9,
        minObservedShare: 0.7
      },
      thresholds: {
        minRiskAssuranceScore: 85,
        maxCriticalFindings: 0,
        maxHighFindings: 2,
        failClosedIfBelowThresholds: true
      },
      packsEnabled: {
        injection: true,
        exfiltration: true,
        toolMisuse: true,
        truthfulness: true,
        sandboxBoundary: true,
        notaryAttestation: true
      },
      redaction: {
        storeRawPrompts: false,
        storeRawOutputs: false,
        storeOnlyHashesAndRefs: true
      },
      reporting: {
        includeRunSummaryInConsole: true,
        dispatchCriticalToIntegrations: true
      }
    }
  });
}
