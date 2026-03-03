/**
 * Patch 06 — sip-to-sanitation
 *
 * Added missing questions identified in audit report:
 * - ENV-STS-11 (EU DWD 2020/2184 Art. 10 risk-based approach)
 * - ENV-STS-12 (HELCOM BSAP monitoring/controls/reporting)
 * - ENV-STS-13 (WHO GDWQ 4th ed. §4.1 explicit WSP components)
 * - ENV-STS-14 (MARPOL Annex IV equipment conformity/readiness + Reg. 11)
 */

export const patch06SipToSanitation = {
  packId: "sip-to-sanitation",
  questionIdsAdded: ["ENV-STS-11", "ENV-STS-12", "ENV-STS-13", "ENV-STS-14"],
};
