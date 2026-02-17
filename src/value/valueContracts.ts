import { z } from "zod";

export const valueScopeTypeSchema = z.enum(["WORKSPACE", "NODE", "AGENT"]);
export const valueAgentTypeSchema = z.enum([
  "code-agent",
  "support-agent",
  "ops-agent",
  "research-agent",
  "sales-agent",
  "other"
]);

export const valueContractSchema = z.object({
  valueContract: z.object({
    version: z.literal(1),
    scope: z.object({
      type: valueScopeTypeSchema,
      id: z.string().min(1)
    }),
    agentProfile: z.object({
      agentType: valueAgentTypeSchema,
      domain: z.enum(["devtools", "customer-support", "it-ops", "research", "sales", "general"]),
      deployment: z.enum(["single", "host", "k8s", "compose"])
    }),
    kpis: z.array(
      z.object({
        kpiId: z.string().min(1),
        label: z.string().min(1),
        direction: z.enum(["LOWER_IS_BETTER", "HIGHER_IS_BETTER"]),
        unit: z.string().min(1),
        normalization: z.object({
          minGood: z.number(),
          maxBad: z.number()
        }),
        valueDimensionImpacts: z.object({
          emotional: z.number().min(0).max(1).default(0),
          functional: z.number().min(0).max(1).default(0),
          economic: z.number().min(0).max(1).default(0),
          brand: z.number().min(0).max(1).default(0),
          lifetime: z.number().min(0).max(1).default(0)
        })
      })
    ).min(1),
    evidenceSources: z.array(
      z.object({
        sourceId: z.string().min(1),
        kind: z.enum(["OBSERVED", "ATTESTED", "SELF_REPORTED", "ATTESTED|SELF_REPORTED"]),
        required: z.boolean()
      })
    ),
    baselines: z.object({
      baselineWindowDays: z.number().int().min(1).max(365)
    }),
    constraints: z.object({
      requireEvidenceGatesForStrongClaims: z.boolean(),
      requireAssuranceCertPassForRiskSensitiveDomains: z.boolean(),
      forbidSelfReportedToAffectEconomicValue: z.boolean(),
      attributionWindowHours: z.number().int().min(1).max(24 * 30).default(24),
      attributionMethod: z.enum(["LAST_TOUCH", "PROPORTIONAL_RUN_COUNT"]).default("LAST_TOUCH")
    })
  })
});

export type ValueContract = z.infer<typeof valueContractSchema>;

function sharedEvidenceSources(): ValueContract["valueContract"]["evidenceSources"] {
  return [
    {
      sourceId: "bridge.receipts",
      kind: "OBSERVED",
      required: true
    },
    {
      sourceId: "toolhub.receipts",
      kind: "OBSERVED",
      required: true
    },
    {
      sourceId: "owner.webhook",
      kind: "ATTESTED|SELF_REPORTED",
      required: false
    }
  ];
}

function sharedConstraints(): ValueContract["valueContract"]["constraints"] {
  return {
    requireEvidenceGatesForStrongClaims: true,
    requireAssuranceCertPassForRiskSensitiveDomains: false,
    forbidSelfReportedToAffectEconomicValue: true,
    attributionWindowHours: 24,
    attributionMethod: "LAST_TOUCH"
  };
}

function createTemplate(params: {
  scopeType: "WORKSPACE" | "NODE" | "AGENT";
  scopeId: string;
  agentType: z.infer<typeof valueAgentTypeSchema>;
  domain: "devtools" | "customer-support" | "it-ops" | "research" | "sales" | "general";
  deployment?: "single" | "host" | "k8s" | "compose";
  kpis: ValueContract["valueContract"]["kpis"];
}): ValueContract {
  return valueContractSchema.parse({
    valueContract: {
      version: 1,
      scope: {
        type: params.scopeType,
        id: params.scopeId
      },
      agentProfile: {
        agentType: params.agentType,
        domain: params.domain,
        deployment: params.deployment ?? "single"
      },
      kpis: params.kpis,
      evidenceSources: sharedEvidenceSources(),
      baselines: {
        baselineWindowDays: 30
      },
      constraints: sharedConstraints()
    }
  });
}

export function valueContractTemplate(params: {
  scopeType: "WORKSPACE" | "NODE" | "AGENT";
  scopeId: string;
  type: z.infer<typeof valueAgentTypeSchema>;
  deployment?: "single" | "host" | "k8s" | "compose";
}): ValueContract {
  const base = {
    scopeType: params.scopeType,
    scopeId: params.scopeId,
    deployment: params.deployment
  };
  if (params.type === "code-agent") {
    return createTemplate({
      ...base,
      agentType: "code-agent",
      domain: "devtools",
      kpis: [
        {
          kpiId: "cycle_time_hours",
          label: "PR cycle time (hours)",
          direction: "LOWER_IS_BETTER",
          unit: "hours",
          normalization: { minGood: 2, maxBad: 168 },
          valueDimensionImpacts: { emotional: 0.05, functional: 0.4, economic: 0.2, brand: 0.1, lifetime: 0.1 }
        },
        {
          kpiId: "build_success_rate",
          label: "Build success rate",
          direction: "HIGHER_IS_BETTER",
          unit: "ratio",
          normalization: { minGood: 1, maxBad: 0.6 },
          valueDimensionImpacts: { emotional: 0.05, functional: 0.35, economic: 0.15, brand: 0.1, lifetime: 0.1 }
        },
        {
          kpiId: "defects_escaped",
          label: "Defects escaped",
          direction: "LOWER_IS_BETTER",
          unit: "count",
          normalization: { minGood: 0, maxBad: 20 },
          valueDimensionImpacts: { emotional: 0.1, functional: 0.2, economic: 0.2, brand: 0.2, lifetime: 0.2 }
        },
        {
          kpiId: "security_findings_count",
          label: "Security findings",
          direction: "LOWER_IS_BETTER",
          unit: "count",
          normalization: { minGood: 0, maxBad: 25 },
          valueDimensionImpacts: { emotional: 0, functional: 0.15, economic: 0.2, brand: 0.2, lifetime: 0.1 }
        },
        {
          kpiId: "cost_usd",
          label: "Operating cost",
          direction: "LOWER_IS_BETTER",
          unit: "usd",
          normalization: { minGood: 0, maxBad: 5000 },
          valueDimensionImpacts: { emotional: 0, functional: 0.05, economic: 0.6, brand: 0.05, lifetime: 0.1 }
        }
      ]
    });
  }
  if (params.type === "support-agent") {
    return createTemplate({
      ...base,
      agentType: "support-agent",
      domain: "customer-support",
      kpis: [
        {
          kpiId: "first_response_time_minutes",
          label: "First response time",
          direction: "LOWER_IS_BETTER",
          unit: "minutes",
          normalization: { minGood: 1, maxBad: 240 },
          valueDimensionImpacts: { emotional: 0.3, functional: 0.3, economic: 0.1, brand: 0.2, lifetime: 0.2 }
        },
        {
          kpiId: "resolution_time_hours",
          label: "Resolution time",
          direction: "LOWER_IS_BETTER",
          unit: "hours",
          normalization: { minGood: 1, maxBad: 72 },
          valueDimensionImpacts: { emotional: 0.2, functional: 0.35, economic: 0.15, brand: 0.15, lifetime: 0.2 }
        },
        {
          kpiId: "csat_score",
          label: "CSAT",
          direction: "HIGHER_IS_BETTER",
          unit: "1-5",
          normalization: { minGood: 5, maxBad: 2.5 },
          valueDimensionImpacts: { emotional: 0.35, functional: 0.1, economic: 0.05, brand: 0.25, lifetime: 0.25 }
        },
        {
          kpiId: "escalation_rate",
          label: "Escalation rate",
          direction: "LOWER_IS_BETTER",
          unit: "ratio",
          normalization: { minGood: 0.01, maxBad: 0.5 },
          valueDimensionImpacts: { emotional: 0.1, functional: 0.2, economic: 0.2, brand: 0.2, lifetime: 0.2 }
        },
        {
          kpiId: "repeat_contact_rate",
          label: "Repeat contact rate",
          direction: "LOWER_IS_BETTER",
          unit: "ratio",
          normalization: { minGood: 0.05, maxBad: 0.7 },
          valueDimensionImpacts: { emotional: 0.2, functional: 0.2, economic: 0.1, brand: 0.15, lifetime: 0.3 }
        }
      ]
    });
  }
  if (params.type === "ops-agent") {
    return createTemplate({
      ...base,
      agentType: "ops-agent",
      domain: "it-ops",
      kpis: [
        {
          kpiId: "incident_mttr_minutes",
          label: "Incident MTTR",
          direction: "LOWER_IS_BETTER",
          unit: "minutes",
          normalization: { minGood: 5, maxBad: 1440 },
          valueDimensionImpacts: { emotional: 0.1, functional: 0.4, economic: 0.25, brand: 0.1, lifetime: 0.15 }
        },
        {
          kpiId: "change_failure_rate",
          label: "Change failure rate",
          direction: "LOWER_IS_BETTER",
          unit: "ratio",
          normalization: { minGood: 0.01, maxBad: 0.5 },
          valueDimensionImpacts: { emotional: 0.05, functional: 0.3, economic: 0.25, brand: 0.1, lifetime: 0.15 }
        },
        {
          kpiId: "alert_noise_ratio",
          label: "Alert noise",
          direction: "LOWER_IS_BETTER",
          unit: "ratio",
          normalization: { minGood: 0.05, maxBad: 0.9 },
          valueDimensionImpacts: { emotional: 0.05, functional: 0.25, economic: 0.2, brand: 0.05, lifetime: 0.15 }
        },
        {
          kpiId: "slo_burn_rate",
          label: "SLO burn rate",
          direction: "LOWER_IS_BETTER",
          unit: "ratio",
          normalization: { minGood: 0.2, maxBad: 5 },
          valueDimensionImpacts: { emotional: 0.05, functional: 0.25, economic: 0.25, brand: 0.15, lifetime: 0.2 }
        },
        {
          kpiId: "patch_latency_hours",
          label: "Patch latency",
          direction: "LOWER_IS_BETTER",
          unit: "hours",
          normalization: { minGood: 4, maxBad: 720 },
          valueDimensionImpacts: { emotional: 0.05, functional: 0.2, economic: 0.2, brand: 0.2, lifetime: 0.15 }
        }
      ]
    });
  }
  if (params.type === "research-agent") {
    return createTemplate({
      ...base,
      agentType: "research-agent",
      domain: "research",
      kpis: [
        {
          kpiId: "citation_count_allowlisted",
          label: "Citations from allowlisted sources",
          direction: "HIGHER_IS_BETTER",
          unit: "count",
          normalization: { minGood: 30, maxBad: 0 },
          valueDimensionImpacts: { emotional: 0.05, functional: 0.35, economic: 0.05, brand: 0.2, lifetime: 0.2 }
        },
        {
          kpiId: "experiment_throughput",
          label: "Experiment throughput",
          direction: "HIGHER_IS_BETTER",
          unit: "count",
          normalization: { minGood: 20, maxBad: 0 },
          valueDimensionImpacts: { emotional: 0, functional: 0.35, economic: 0.2, brand: 0.1, lifetime: 0.15 }
        },
        {
          kpiId: "reproducibility_score",
          label: "Reproducibility score",
          direction: "HIGHER_IS_BETTER",
          unit: "0-100",
          normalization: { minGood: 95, maxBad: 40 },
          valueDimensionImpacts: { emotional: 0.05, functional: 0.3, economic: 0.1, brand: 0.2, lifetime: 0.2 }
        },
        {
          kpiId: "artifact_reuse_rate",
          label: "Knowledge artifact reuse",
          direction: "HIGHER_IS_BETTER",
          unit: "ratio",
          normalization: { minGood: 0.8, maxBad: 0.1 },
          valueDimensionImpacts: { emotional: 0.05, functional: 0.2, economic: 0.15, brand: 0.1, lifetime: 0.3 }
        },
        {
          kpiId: "cost_usd",
          label: "Operating cost",
          direction: "LOWER_IS_BETTER",
          unit: "usd",
          normalization: { minGood: 0, maxBad: 5000 },
          valueDimensionImpacts: { emotional: 0, functional: 0.05, economic: 0.6, brand: 0.05, lifetime: 0.1 }
        }
      ]
    });
  }
  if (params.type === "sales-agent") {
    return createTemplate({
      ...base,
      agentType: "sales-agent",
      domain: "sales",
      kpis: [
        {
          kpiId: "pipeline_velocity",
          label: "Pipeline velocity",
          direction: "HIGHER_IS_BETTER",
          unit: "score",
          normalization: { minGood: 100, maxBad: 20 },
          valueDimensionImpacts: { emotional: 0.1, functional: 0.25, economic: 0.3, brand: 0.15, lifetime: 0.2 }
        },
        {
          kpiId: "conversion_rate",
          label: "Conversion rate",
          direction: "HIGHER_IS_BETTER",
          unit: "ratio",
          normalization: { minGood: 0.45, maxBad: 0.02 },
          valueDimensionImpacts: { emotional: 0.05, functional: 0.2, economic: 0.35, brand: 0.2, lifetime: 0.2 }
        },
        {
          kpiId: "revenue_influenced_usd",
          label: "Revenue influenced",
          direction: "HIGHER_IS_BETTER",
          unit: "usd",
          normalization: { minGood: 50000, maxBad: 0 },
          valueDimensionImpacts: { emotional: 0, functional: 0.05, economic: 0.6, brand: 0.15, lifetime: 0.1 }
        },
        {
          kpiId: "churn_risk_reduction",
          label: "Churn risk reduction",
          direction: "HIGHER_IS_BETTER",
          unit: "ratio",
          normalization: { minGood: 0.5, maxBad: 0 },
          valueDimensionImpacts: { emotional: 0.15, functional: 0.15, economic: 0.2, brand: 0.2, lifetime: 0.3 }
        },
        {
          kpiId: "cost_usd",
          label: "Operating cost",
          direction: "LOWER_IS_BETTER",
          unit: "usd",
          normalization: { minGood: 0, maxBad: 5000 },
          valueDimensionImpacts: { emotional: 0, functional: 0.05, economic: 0.6, brand: 0.05, lifetime: 0.1 }
        }
      ]
    });
  }
  return createTemplate({
    ...base,
    agentType: "other",
    domain: "general",
    kpis: [
      {
        kpiId: "cycle_time_hours",
        label: "Cycle time",
        direction: "LOWER_IS_BETTER",
        unit: "hours",
        normalization: { minGood: 2, maxBad: 168 },
        valueDimensionImpacts: { emotional: 0.1, functional: 0.3, economic: 0.2, brand: 0.1, lifetime: 0.2 }
      },
      {
        kpiId: "quality_score",
        label: "Quality score",
        direction: "HIGHER_IS_BETTER",
        unit: "0-100",
        normalization: { minGood: 95, maxBad: 40 },
        valueDimensionImpacts: { emotional: 0.1, functional: 0.3, economic: 0.15, brand: 0.15, lifetime: 0.2 }
      },
      {
        kpiId: "cost_usd",
        label: "Operating cost",
        direction: "LOWER_IS_BETTER",
        unit: "usd",
        normalization: { minGood: 0, maxBad: 5000 },
        valueDimensionImpacts: { emotional: 0, functional: 0.05, economic: 0.6, brand: 0.05, lifetime: 0.1 }
      }
    ]
  });
}
