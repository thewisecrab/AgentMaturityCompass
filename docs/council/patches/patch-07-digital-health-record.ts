/**
 * Patch summary: agent-07 digital-health-record
 *
 * This file lists the question IDs added to the `digital-health-record` sector pack
 * in src/domains/industryPacks.ts based on the council audit report.
 */

export const patch07DigitalHealthRecord = {
  packId: "digital-health-record",
  addedQuestionIds: [
    "HLT-DHR-13", // Cures Act §4006 info blocking operational monitoring + exceptions evidence
    "HLT-DHR-14", // HIPAA §164.312(e)(2)(ii) transmission encryption (addressable spec) enforcement + documentation
    "HLT-DHR-15", // 21 CFR Part 11 §11.10(e) secure computer-generated audit trails
    "HLT-DHR-16", // EU MDR 2017/745 Art. 61 clinical evaluation governance
    "HLT-DHR-17", // HL7 FHIR R4 §3.3 interoperability conformance (capability statements + tests)
    "HLT-DHR-18" // IHE XDS.b ITI-18 Registry Stored Query conformance
  ]
} as const;
