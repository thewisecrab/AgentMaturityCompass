import { z } from "zod";

export const benchPolicySchema = z.object({
  benchPolicy: z.object({
    version: z.literal(1),
    privacy: z.object({
      exportAllowlistOnly: z.literal(true),
      redactAllFreeText: z.literal(true),
      allowFreeTextFields: z.array(z.never()).default([]),
      exportAgentIdsHashed: z.boolean(),
      hashTruncBytes: z.number().int().min(4).max(32),
      anonymizeWorkspaceIdDefault: z.boolean(),
      minKAnonymityForAgentBench: z.number().int().min(1),
      minRunsForAnyExport: z.number().int().min(1),
      minDaysCoverage: z.number().int().min(1)
    }),
    integrityGates: z.object({
      minIntegrityIndexForPublish: z.number().min(0).max(1),
      minCorrelationRatioForPublish: z.number().min(0).max(1),
      requireTrustLevelForPublish: z.enum(["HIGH", "MEDIUM", "LOW"]),
      allowExportWhenInsufficientEvidence: z.boolean()
    }),
    publishing: z.object({
      requireDualControlApprovals: z.boolean(),
      approvalActionClass: z.literal("SECURITY"),
      requireExplicitOwnerAck: z.boolean()
    }),
    includedMetrics: z.object({
      maturity: z.object({
        includeOverall: z.boolean(),
        includeByFiveLayers: z.boolean(),
        includeByFiveDimensions: z.boolean(),
        includeBy42Questions: z.boolean()
      }),
      strategyFailureRisks: z.object({
        includeAllFive: z.boolean()
      }),
      valueDimensions: z.object({
        includeAllFive: z.boolean()
      }),
      operatingHealth: z.object({
        includeApprovals: z.boolean(),
        includeBudgets: z.boolean(),
        includeToolhubDenials: z.boolean(),
        includeFreezeEvents: z.boolean(),
        includeAssuranceScores: z.boolean(),
        includeNotaryStatus: z.boolean(),
        includePluginIntegrity: z.boolean()
      }),
      forecasting: z.object({
        includeForecastSummary: z.boolean()
      })
    }),
    weights: z.object({
      ecosystemAlignment: z.object({
        ecosystemFocusRisk: z.number().min(0).max(1),
        emotionalValue: z.number().min(0).max(1),
        brandValue: z.number().min(0).max(1)
      }),
      riskAssurance: z.object({
        riskAssuranceRisk: z.number().min(0).max(1),
        integrityIndex: z.number().min(0).max(1),
        correlationRatio: z.number().min(0).max(1)
      }),
      digitalDuality: z.object({
        digitalDualityRisk: z.number().min(0).max(1),
        toolGovernanceMaturity: z.number().min(0).max(1)
      })
    })
  })
});

export type BenchPolicy = z.infer<typeof benchPolicySchema>;

export function defaultBenchPolicy(): BenchPolicy {
  return benchPolicySchema.parse({
    benchPolicy: {
      version: 1,
      privacy: {
        exportAllowlistOnly: true,
        redactAllFreeText: true,
        allowFreeTextFields: [],
        exportAgentIdsHashed: true,
        hashTruncBytes: 8,
        anonymizeWorkspaceIdDefault: true,
        minKAnonymityForAgentBench: 10,
        minRunsForAnyExport: 4,
        minDaysCoverage: 7
      },
      integrityGates: {
        minIntegrityIndexForPublish: 0.9,
        minCorrelationRatioForPublish: 0.9,
        requireTrustLevelForPublish: "HIGH",
        allowExportWhenInsufficientEvidence: true
      },
      publishing: {
        requireDualControlApprovals: true,
        approvalActionClass: "SECURITY",
        requireExplicitOwnerAck: true
      },
      includedMetrics: {
        maturity: {
          includeOverall: true,
          includeByFiveLayers: true,
          includeByFiveDimensions: true,
          includeBy42Questions: false
        },
        strategyFailureRisks: {
          includeAllFive: true
        },
        valueDimensions: {
          includeAllFive: true
        },
        operatingHealth: {
          includeApprovals: true,
          includeBudgets: true,
          includeToolhubDenials: true,
          includeFreezeEvents: true,
          includeAssuranceScores: true,
          includeNotaryStatus: true,
          includePluginIntegrity: true
        },
        forecasting: {
          includeForecastSummary: true
        }
      },
      weights: {
        ecosystemAlignment: {
          ecosystemFocusRisk: 0.4,
          emotionalValue: 0.3,
          brandValue: 0.3
        },
        riskAssurance: {
          riskAssuranceRisk: 0.4,
          integrityIndex: 0.3,
          correlationRatio: 0.3
        },
        digitalDuality: {
          digitalDualityRisk: 0.5,
          toolGovernanceMaturity: 0.5
        }
      }
    }
  });
}

