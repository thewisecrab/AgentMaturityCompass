import { z } from "zod";

export const auditPolicyEventSchema = z.enum([
  "DIAGNOSTIC_COMPLETED",
  "FORECAST_CREATED",
  "ASSURANCE_CERT_ISSUED",
  "BENCH_CREATED",
  "PLUGIN_INSTALLED",
  "POLICY_APPLIED",
  "APPROVAL_DECIDED",
  "NOTARY_ATTESTATION_OBSERVED"
]);

export const auditPolicySchema = z.object({
  auditPolicy: z.object({
    version: z.literal(1),
    privacy: z.object({
      exportAllowlistOnly: z.literal(true),
      redactAllFreeText: z.literal(true),
      allowFreeTextFields: z.array(z.string().min(1)).default([]),
      exportAgentIdsHashed: z.boolean(),
      hashTruncBytes: z.number().int().min(4).max(32),
      anonymizeWorkspaceIdDefault: z.boolean(),
      forbidPromptAndRawIO: z.literal(true),
      forbidPII: z.literal(true),
      forbidSecrets: z.literal(true)
    }),
    gates: z.object({
      minRunsForStrongClaims: z.number().int().min(1),
      minIntegrityIndexForStrongClaims: z.number().min(0).max(1),
      minCorrelationRatioForStrongClaims: z.number().min(0).max(1),
      honestMode: z.literal("STRICT")
    }),
    export: z.object({
      requireOwnerRole: z.boolean(),
      requireDualControlForExternalSharing: z.boolean(),
      approvalActionClass: z.literal("GOVERNANCE"),
      defaultFormat: z.literal("AMCAUDIT"),
      allowPdfSummary: z.boolean(),
      pdfSummaryNoChartsIfUntrusted: z.boolean()
    }),
    retention: z.object({
      keepExportsDays: z.number().int().min(1),
      keepCachesDays: z.number().int().min(1)
    }),
    recurrence: z.object({
      refreshCadenceHours: z.number().int().min(1),
      refreshOnEvents: z.array(auditPolicyEventSchema).default([])
    })
  })
});

export type AuditPolicy = z.infer<typeof auditPolicySchema>;

export const auditSchedulerStateSchema = z.object({
  enabled: z.boolean(),
  lastRefreshTs: z.number().int().nullable(),
  nextRefreshTs: z.number().int().nullable(),
  lastOutcome: z.object({
    status: z.enum(["OK", "ERROR"]),
    reason: z.string()
  })
});

export type AuditSchedulerState = z.infer<typeof auditSchedulerStateSchema>;

export function defaultAuditPolicy(): AuditPolicy {
  return auditPolicySchema.parse({
    auditPolicy: {
      version: 1,
      privacy: {
        exportAllowlistOnly: true,
        redactAllFreeText: true,
        allowFreeTextFields: [],
        exportAgentIdsHashed: true,
        hashTruncBytes: 8,
        anonymizeWorkspaceIdDefault: true,
        forbidPromptAndRawIO: true,
        forbidPII: true,
        forbidSecrets: true
      },
      gates: {
        minRunsForStrongClaims: 4,
        minIntegrityIndexForStrongClaims: 0.9,
        minCorrelationRatioForStrongClaims: 0.9,
        honestMode: "STRICT"
      },
      export: {
        requireOwnerRole: true,
        requireDualControlForExternalSharing: true,
        approvalActionClass: "GOVERNANCE",
        defaultFormat: "AMCAUDIT",
        allowPdfSummary: true,
        pdfSummaryNoChartsIfUntrusted: true
      },
      retention: {
        keepExportsDays: 180,
        keepCachesDays: 30
      },
      recurrence: {
        refreshCadenceHours: 24,
        refreshOnEvents: [
          "DIAGNOSTIC_COMPLETED",
          "FORECAST_CREATED",
          "ASSURANCE_CERT_ISSUED",
          "BENCH_CREATED",
          "PLUGIN_INSTALLED",
          "POLICY_APPLIED",
          "APPROVAL_DECIDED",
          "NOTARY_ATTESTATION_OBSERVED"
        ]
      }
    }
  });
}

export function defaultAuditSchedulerState(nowTs = Date.now()): AuditSchedulerState {
  return auditSchedulerStateSchema.parse({
    enabled: true,
    lastRefreshTs: null,
    nextRefreshTs: nowTs + 24 * 60 * 60_000,
    lastOutcome: {
      status: "OK",
      reason: ""
    }
  });
}
