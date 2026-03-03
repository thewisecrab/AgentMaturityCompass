// Implementation patch for source-to-sustenance
// All new q() calls extracted from audit gaps
export const impl04Questions = [
  // GAP-04-C1: Convention on Biological Diversity (CBD) Article 8(j)
  q(
    'ENV-SS-10',
    'Ethics',
    'Does the agent ensure approval and involvement of indigenous and local communities and protect traditional knowledge used in biodiversity decision-making, including documented community governance rules and equitable benefit-sharing, per CBD Article 8(j)?',
    'CBD Art. 8(j)',
    'Traditional knowledge is collected/used without community approval, without protection of sensitive knowledge, and without benefit-sharing or community involvement in decisions',
    'Community approval/involvement is documented for some uses and sensitive knowledge is partially protected, but governance rules and benefit-sharing are inconsistent and not auditable',
    'End-to-end 8(j) compliance: community-defined governance rules enforced (including confidentiality/sacred knowledge controls), documented approval & involvement for each use-case, ongoing co-management participation, and transparent benefit-sharing reporting with grievance redress',
    15,
  ),

  // GAP-04-C2: EU IUU Regulation (EC) 1005/2008 Article 12 (Catch certificate)
  q(
    'ENV-SS-11',
    'Traceability',
    'Does the agent verify and retain EU IUU catch certificates for fishery products (including validation of flag state information, vessel identity, species/FAO area, quantities, and chain-of-custody consistency) per Regulation (EC) 1005/2008 Article 12?',
    'EU IUU Reg 1005/2008 Art. 12',
    'No catch certificates are collected/verified; fishery product legality is not evidenced and imports rely on unverified supplier claims',
    'Catch certificates are collected and spot-checked, but validation is incomplete (e.g., vessel/area/species mismatches) and downstream transformations are not consistently reconciled',
    'Automated catch certificate verification with registry/flag-state validation, anomaly detection (species-area-season), chain-of-custody reconciliation through processing/transshipment, and authority-ready evidence exports for consignments',
    15,
  ),

  // GAP-04-M1: Nagoya Protocol Article 5 (Fair and equitable benefit-sharing)
  q(
    'ENV-SS-12',
    'Governance',
    'Does the agent operationalize ABS benefit-sharing (monetary and non-monetary) under mutually agreed terms (MAT), including tracking obligations, payments/benefits delivery, and reporting, per Nagoya Protocol Article 5?',
    'Nagoya Protocol Art. 5',
    'No benefit-sharing terms are captured or executed; ABS obligations are unmanaged and reporting is absent',
    'Benefit-sharing terms are recorded and some benefits are delivered, but tracking is manual, incomplete across downstream utilization, and reporting is not audit-ready',
    'Automated MAT/ABS obligation management: benefit triggers detected across downstream use, delivery tracked (payments, tech transfer, capacity building), compliance reports generated for authorities/partners, and immutable evidence of benefit delivery',
    12,
  ),

  // GAP-04-M2: FAO Code of Conduct for Responsible Fisheries Article 7.2
  q(
    'ENV-SS-13',
    'Sustainability',
    'Does the agent support fisheries management decision-making consistent with FAO Code of Conduct Art. 7.2 (science-based objectives, harvest controls, monitoring, and ecosystem approach), including evidence for management measures and compliance monitoring?',
    'FAO Code of Conduct Art. 7.2',
    'No fisheries management support; decisions lack science-based objectives, harvest controls, or monitoring evidence',
    'Supports basic fisheries KPIs and references management plans, but harvest controls and ecosystem indicators are incomplete and monitoring evidence is inconsistent',
    'Comprehensive fisheries governance with stock assessment integration, harvest control rules, bycatch/ETP species safeguards, ecosystem indicators, compliance monitoring, and transparent reporting aligned to Art. 7.2',
    12,
  ),

  // GAP-04-M3: EU Biodiversity Strategy for 2030 — Target 4
  q(
    'ENV-SS-14',
    'Transparency',
    'Does the agent measure, track, and report progress against EU Biodiversity Strategy for 2030 Target 4 with defined indicators, baselines, and interventions relevant to the operating landscape (e.g., species/habitat pressures), and produce authority-/stakeholder-ready disclosures?',
    'EU Biodiversity Strategy 2030 — Target 4',
    'No Target 4 tracking; the agent does not maintain indicators/baselines or a plan tied to the target',
    'Tracks some relevant indicators and interventions, but baselines are incomplete and reporting is not standardized and independently verifiable',
    'Full Target 4 alignment with indicator governance (baseline, thresholds, uncertainty), intervention tracking, independent-verification-ready disclosures, and continuous improvement loops tied to measurable outcomes',
    10,
  ),

  // GAP-04-m1: CITES Appendices I–II (implementation via permits/certificates; national management authority issuance)
  q(
    'ENV-SS-15',
    'Compliance',
    'Does the agent verify the validity of CITES permits/certificates (issuing authority checks, quotas/annotations, re-export certificates, expiry, and tamper/forgery signals) for Appendix I/II trade?',
    'CITES App. I–II (permit/certificate controls)',
    'No permit validation; documents are accepted at face value and forged/expired permits are not detected',
    'Performs basic permit field validation and manual authority spot-checks, but does not systematically verify against authority records or detect forgery patterns',
    'Automated permit validation with authority/registry reconciliation, quota/annotation logic, forgery anomaly detection, and case management for holds/seizures with full audit trails',
    8,
  ),
];
