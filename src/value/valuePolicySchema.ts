import { z } from "zod";

export const valuePolicyEventSchema = z.enum([
  "DIAGNOSTIC_COMPLETED",
  "PROMPT_PACK_CREATED",
  "ASSURANCE_CERT_ISSUED",
  "PLUGIN_INSTALLED",
  "RELEASE_BUNDLE_VERIFIED",
  "APPROVAL_DECIDED"
]);

export const valuePolicySchema = z.object({
  valuePolicy: z.object({
    version: z.literal(1),
    cadence: z.object({
      snapshotEveryHours: z.number().int().min(1),
      reportEveryHours: z.number().int().min(1),
      refreshOnEvents: z.array(valuePolicyEventSchema).default([])
    }),
    evidenceGates: z.object({
      minIntegrityIndexForStrongClaims: z.number().min(0).max(1),
      minCorrelationRatioForStrongClaims: z.number().min(0).max(1),
      minObservedShareForStrongClaims: z.number().min(0).max(1),
      maxSelfReportedShare: z.number().min(0).max(1),
      requireNotaryForStrongClaimsWhenEnabled: z.boolean()
    }),
    privacy: z.object({
      exportAllowlistOnly: z.boolean(),
      redactAllFreeText: z.boolean(),
      allowFreeTextFields: z.array(z.string()).default([]),
      forbidPII: z.boolean(),
      forbidSecrets: z.boolean(),
      forbidRawPromptsAndModelIO: z.boolean(),
      hashTruncBytes: z.number().int().min(4).max(32)
    }),
    enforceSignedInputs: z.boolean(),
    allowSelfReportedInputs: z.boolean(),
    formulas: z.object({
      dimensionWeights: z.object({
        emotional: z.number().min(0).max(1),
        functional: z.number().min(0).max(1),
        economic: z.number().min(0).max(1),
        brand: z.number().min(0).max(1),
        lifetime: z.number().min(0).max(1)
      }),
      economicSignificance: z.object({
        benefitWeight: z.number().min(0).max(1),
        costWeight: z.number().min(0).max(1),
        riskWeight: z.number().min(0).max(1)
      }),
      riskIndices: z.object({
        economicSignificanceRisk: z.object({
          base: z.number().min(0).max(100),
          penaltyIfNoValueEventsLast30d: z.number().min(0).max(100),
          penaltyIfValueRegressing: z.number().min(0).max(100),
          penaltyIfCostRising: z.number().min(0).max(100),
          penaltyIfEvidenceInsufficient: z.number().min(0).max(100)
        })
      })
    })
  })
});

export type ValuePolicy = z.infer<typeof valuePolicySchema>;

export const valueSchedulerStateSchema = z.object({
  enabled: z.boolean(),
  lastSnapshotTs: z.number().int().nullable(),
  nextSnapshotTs: z.number().int().nullable(),
  lastReportTs: z.number().int().nullable(),
  nextReportTs: z.number().int().nullable(),
  lastOutcome: z.object({
    status: z.enum(["OK", "ERROR", "SKIPPED"]),
    reason: z.string()
  })
});

export type ValueSchedulerState = z.infer<typeof valueSchedulerStateSchema>;

export function defaultValuePolicy(): ValuePolicy {
  return valuePolicySchema.parse({
    valuePolicy: {
      version: 1,
      cadence: {
        snapshotEveryHours: 24,
        reportEveryHours: 24,
        refreshOnEvents: [
          "DIAGNOSTIC_COMPLETED",
          "PROMPT_PACK_CREATED",
          "ASSURANCE_CERT_ISSUED",
          "PLUGIN_INSTALLED",
          "RELEASE_BUNDLE_VERIFIED",
          "APPROVAL_DECIDED"
        ]
      },
      evidenceGates: {
        minIntegrityIndexForStrongClaims: 0.9,
        minCorrelationRatioForStrongClaims: 0.9,
        minObservedShareForStrongClaims: 0.7,
        maxSelfReportedShare: 0.2,
        requireNotaryForStrongClaimsWhenEnabled: true
      },
      privacy: {
        exportAllowlistOnly: true,
        redactAllFreeText: true,
        allowFreeTextFields: [],
        forbidPII: true,
        forbidSecrets: true,
        forbidRawPromptsAndModelIO: true,
        hashTruncBytes: 8
      },
      enforceSignedInputs: true,
      allowSelfReportedInputs: true,
      formulas: {
        dimensionWeights: {
          emotional: 0.15,
          functional: 0.25,
          economic: 0.3,
          brand: 0.15,
          lifetime: 0.15
        },
        economicSignificance: {
          benefitWeight: 0.55,
          costWeight: 0.25,
          riskWeight: 0.2
        },
        riskIndices: {
          economicSignificanceRisk: {
            base: 50,
            penaltyIfNoValueEventsLast30d: 20,
            penaltyIfValueRegressing: 15,
            penaltyIfCostRising: 10,
            penaltyIfEvidenceInsufficient: 25
          }
        }
      }
    }
  });
}

export function defaultValueSchedulerState(nowTs = Date.now()): ValueSchedulerState {
  return valueSchedulerStateSchema.parse({
    enabled: true,
    lastSnapshotTs: null,
    nextSnapshotTs: nowTs + 24 * 60 * 60 * 1000,
    lastReportTs: null,
    nextReportTs: nowTs + 24 * 60 * 60 * 1000,
    lastOutcome: {
      status: "OK",
      reason: ""
    }
  });
}
