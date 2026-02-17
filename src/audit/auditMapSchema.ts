import { z } from "zod";

export const auditControlStatusSchema = z.enum(["PASS", "FAIL", "INSUFFICIENT_EVIDENCE"]);

export const auditControlEvidenceRequirementSchema = z.object({
  requiredKinds: z.array(z.string().min(1)).min(1),
  strongClaimGates: z.object({
    minIntegrityIndex: z.number().min(0).max(1),
    minCorrelationRatio: z.number().min(0).max(1)
  })
});

export const auditControlCheckSchema = z.object({
  source: z.string().min(1),
  check: z.string().min(1)
});

export const auditRemediationActionSchema = z.object({
  kind: z.enum(["MECHANIC_ACTION", "DOC_LINK"]),
  id: z.string().min(1)
});

export const auditControlSchema = z.object({
  controlId: z.string().min(1),
  title: z.string().min(1),
  evidenceRequirements: auditControlEvidenceRequirementSchema,
  satisfiedBy: z.array(auditControlCheckSchema).min(1),
  remediationActions: z.array(auditRemediationActionSchema).default([])
});

export const auditFrameworkLinksSchema = z.object({
  soc2Like: z.array(z.string().min(1)).default([]),
  iso27001Like: z.array(z.string().min(1)).default([]),
  nistLike: z.array(z.string().min(1)).default([])
});

export const auditControlFamilySchema = z.object({
  familyId: z.string().min(1),
  title: z.string().min(1),
  frameworks: auditFrameworkLinksSchema,
  controls: z.array(auditControlSchema).min(4)
});

export const auditMapSchema = z.object({
  auditMap: z.object({
    version: z.literal(1),
    id: z.string().min(1),
    name: z.string().min(1),
    controlFamilies: z.array(auditControlFamilySchema).min(9)
  })
});

export type AuditMapFile = z.infer<typeof auditMapSchema>;

export const auditControlResultSchema = z.object({
  controlId: z.string().min(1),
  status: auditControlStatusSchema,
  reasons: z.array(z.string().min(1)).min(1),
  evidenceRefs: z.array(z.string().min(1)).default([])
});

export const auditFamilyResultSchema = z.object({
  familyId: z.string().min(1),
  title: z.string().min(1),
  statusSummary: z.object({
    pass: z.number().int().min(0),
    fail: z.number().int().min(0),
    insufficient: z.number().int().min(0)
  }),
  controls: z.array(auditControlResultSchema)
});

export type AuditFamilyResult = z.infer<typeof auditFamilyResultSchema>;
