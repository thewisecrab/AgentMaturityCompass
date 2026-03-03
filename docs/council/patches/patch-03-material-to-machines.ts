/**
 * patch-03-material-to-machines.ts
 *
 * Council audit remediation for: docs/council/agent-03-material-to-machines.yaml
 *
 * Question IDs added to the `material-to-machines` sector pack:
 * - ENV-MM-10 (EU Machinery Regulation (EU) 2023/1230 Art. 10; Annex III EHSR)
 * - ENV-MM-11 (IEC 62443-3-3 SR 1.1 Identification and Authentication Control)
 * - ENV-MM-12 (ISO 45001:2018 §8.1.3 Management of change)
 * - ENV-MM-13 (EU Ecodesign Regulation (EU) 2024/1781 Art. 7 Repairability)
 * - ENV-MM-14 (RoHS Directive 2011/65/EU Art. 4 placing-on-the-market gate)
 */

export const patch03MaterialToMachines = {
  packId: "material-to-machines",
  addedQuestionIds: [
    "ENV-MM-10",
    "ENV-MM-11",
    "ENV-MM-12",
    "ENV-MM-13",
    "ENV-MM-14",
  ],
};
