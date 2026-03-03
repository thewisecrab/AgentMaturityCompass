/**
 * Patch summary: agent-04 source-to-sustenance
 *
 * This file lists the question IDs added to the `source-to-sustenance` sector pack
 * in src/domains/industryPacks.ts based on the council audit report.
 */

export const patch04SourceToSustenance = {
  packId: "source-to-sustenance",
  addedQuestionIds: [
    "ENV-SS-10", // CBD Art. 8(j) traditional knowledge governance
    "ENV-SS-11", // EU IUU Reg 1005/2008 Art. 12 catch certificates
    "ENV-SS-12", // Nagoya Protocol Art. 5 benefit-sharing (MAT execution)
    "ENV-SS-13", // FAO Code of Conduct Art. 7.2 fisheries governance
    "ENV-SS-14", // EU Biodiversity Strategy 2030 — Target 4 progress tracking
    "ENV-SS-15" // CITES permit/certificate validity checks
  ]
} as const;
