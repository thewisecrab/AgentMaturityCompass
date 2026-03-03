/**
 * Patch summary: agent-05 ubiquity-to-utility
 *
 * This file lists the question IDs added to the `ubiquity-to-utility` sector pack
 * in src/domains/industryPacks.ts based on the council audit report.
 */

export const patch05UbiquityToUtility = {
  packId: "ubiquity-to-utility",
  addedQuestionIds: [
    "ENV-UU-10", // NERC CIP-007-6 R1 Ports and Services
    "ENV-UU-11", // IEC 62351-8 RBAC
    "ENV-UU-12", // IEC 61850 interoperability
    "ENV-UU-13", // EU RED III Art. 15 permitting
    "ENV-UU-14", // NERC CIP-013-1 baseline supply chain controls
    "ENV-UU-15" // FERC Order 887 ongoing IBR model monitoring/revalidation
  ]
} as const;
