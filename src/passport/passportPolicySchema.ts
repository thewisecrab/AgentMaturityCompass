import { z } from "zod";

export const passportPolicySchema = z.object({
  passportPolicy: z.object({
    version: z.literal(1),
    governance: z.object({
      requireOwnerForCreate: z.boolean().default(true),
      requireDualControlForExternalSharing: z.boolean().default(true),
      approvalActionClass: z.literal("GOVERNANCE").default("GOVERNANCE"),
      allowAgentReadOnlyBadge: z.boolean().default(true)
    }),
    privacy: z.object({
      exportAllowlistOnly: z.boolean().default(true),
      redactAllFreeText: z.boolean().default(true),
      allowFreeTextFields: z.array(z.string()).default([]),
      exportAgentIdsHashed: z.boolean().default(true),
      hashTruncBytes: z.number().int().min(4).max(32).default(8),
      anonymizeWorkspaceIdDefault: z.boolean().default(true),
      forbidPromptsAndRawIO: z.boolean().default(true),
      forbidPII: z.boolean().default(true),
      forbidSecrets: z.boolean().default(true),
      forbidUrlsAndPaths: z.boolean().default(true)
    }),
    integrityGates: z.object({
      minIntegrityIndexForVerified: z.number().min(0).max(1).default(0.9),
      minCorrelationRatioForVerified: z.number().min(0).max(1).default(0.9),
      requireTrustLabelForVerified: z.enum(["LOW", "MEDIUM", "HIGH"]).default("HIGH"),
      requireAssuranceCertPassForVerified: z.boolean().default(true),
      requireNotaryWhenEnabled: z.boolean().default(true)
    }),
    contents: z.object({
      includeMaturity: z.boolean().default(true),
      includeFiveStrategyRisks: z.boolean().default(true),
      includeFiveValueDims: z.boolean().default(true),
      includeAssuranceSummary: z.boolean().default(true),
      includeBenchSummary: z.boolean().default(true),
      includePromptEnforcementSummary: z.boolean().default(true),
      includeToolModelGovernanceSummary: z.boolean().default(true),
      includeAuditBinderSummary: z.boolean().default(true),
      includeMechanicTargetsHashOnly: z.boolean().default(true),
      includeCgxPackHash: z.boolean().default(true),
      includeEvidenceCoverage: z.boolean().default(true),
      includeQuestionLevelScores: z.boolean().default(false)
    })
  })
});

export type PassportPolicy = z.infer<typeof passportPolicySchema>;

export function defaultPassportPolicy(): PassportPolicy {
  return passportPolicySchema.parse({
    passportPolicy: {
      version: 1,
      governance: {
        requireOwnerForCreate: true,
        requireDualControlForExternalSharing: true,
        approvalActionClass: "GOVERNANCE",
        allowAgentReadOnlyBadge: true
      },
      privacy: {
        exportAllowlistOnly: true,
        redactAllFreeText: true,
        allowFreeTextFields: [],
        exportAgentIdsHashed: true,
        hashTruncBytes: 8,
        anonymizeWorkspaceIdDefault: true,
        forbidPromptsAndRawIO: true,
        forbidPII: true,
        forbidSecrets: true,
        forbidUrlsAndPaths: true
      },
      integrityGates: {
        minIntegrityIndexForVerified: 0.9,
        minCorrelationRatioForVerified: 0.9,
        requireTrustLabelForVerified: "HIGH",
        requireAssuranceCertPassForVerified: true,
        requireNotaryWhenEnabled: true
      },
      contents: {
        includeMaturity: true,
        includeFiveStrategyRisks: true,
        includeFiveValueDims: true,
        includeAssuranceSummary: true,
        includeBenchSummary: true,
        includePromptEnforcementSummary: true,
        includeToolModelGovernanceSummary: true,
        includeAuditBinderSummary: true,
        includeMechanicTargetsHashOnly: true,
        includeCgxPackHash: true,
        includeEvidenceCoverage: true,
        includeQuestionLevelScores: false
      }
    }
  });
}
