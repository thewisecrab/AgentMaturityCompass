export type Domain =
  | "health"
  | "education"
  | "environment"
  | "mobility"
  | "governance"
  | "technology"
  | "wealth";

export interface DomainMetadata {
  id: Domain;
  name: string;
  description: string;
  regulatoryBasis: string[];
  riskLevel: "high" | "very-high" | "critical";
  euAIActCategory: "prohibited" | "high-risk" | "limited-risk" | "general-purpose";
  questionCount: number;
  assurancePacks: string[];
  primaryModules: string[];
  complianceFrameworks: string[];
}

export const DOMAIN_REGISTRY: Record<Domain, DomainMetadata> = {
  health: {
    id: "health",
    name: "Health",
    description: "Clinical and care-delivery agents operating under medical safety, PHI constraints, and functional safety requirements.",
    regulatoryBasis: ["FDA 510(k)", "HIPAA", "FDA AI/ML Action Plan", "EU MDR", "IEC 62304"],
    riskLevel: "critical",
    euAIActCategory: "high-risk",
    questionCount: 9,
    assurancePacks: ["healthcarePHI", "safetyCriticalSIL"],
    primaryModules: ["V4", "S10", "E19", "W3", "E5", "E2"],
    complianceFrameworks: ["FDA 510(k)", "HIPAA", "EU MDR", "HL7 FHIR", "IEC 62304"]
  },
  education: {
    id: "education",
    name: "Education",
    description: "Learner-facing agents with FERPA/COPPA protections and educator oversight requirements.",
    regulatoryBasis: ["FERPA", "COPPA", "EU AI Act", "GDPR"],
    riskLevel: "very-high",
    euAIActCategory: "high-risk",
    questionCount: 6,
    assurancePacks: ["educationFERPA"],
    primaryModules: ["V4", "S9", "E22", "W5"],
    complianceFrameworks: ["FERPA", "COPPA", "EU AI Act", "GDPR"]
  },
  environment: {
    id: "environment",
    name: "Environment / Critical Infrastructure",
    description: "Infrastructure and environmental operations with resilience, isolation, and safety-stop requirements.",
    regulatoryBasis: ["EU AI Act", "NERC CIP", "EPA Regulations", "ISO 14001", "NIST CSF"],
    riskLevel: "critical",
    euAIActCategory: "high-risk",
    questionCount: 6,
    assurancePacks: ["environmentalInfra"],
    primaryModules: ["E5", "E28", "E19", "S2", "W6"],
    complianceFrameworks: ["EU AI Act", "NERC CIP", "ISO 14001", "NIST CSF", "IEC 62443"]
  },
  mobility: {
    id: "mobility",
    name: "Mobility",
    description: "Transportation agents with ASIL/SOTIF/SIL safety obligations, OTA cybersecurity constraints, and deterministic fail-safe requirements.",
    regulatoryBasis: ["NHTSA AV Guidelines", "ISO 26262", "UNECE WP.29", "ISO 21448", "IEC 61508", "EU AI Act"],
    riskLevel: "critical",
    euAIActCategory: "high-risk",
    questionCount: 14,
    assurancePacks: ["mobilityFunctionalSafety", "safetyCriticalSIL"],
    primaryModules: ["E2", "E5", "E17", "S3", "W4"],
    complianceFrameworks: ["ISO 26262", "UNECE R155", "UNECE R156", "ISO 21448", "IEC 61508", "SAE J3016", "DO-178C"]
  },
  governance: {
    id: "governance",
    name: "Governance / Public Sector",
    description: "Public-impact systems requiring accountability, contestability, and democratic safeguards.",
    regulatoryBasis: ["NIST AI RMF", "EU AI Act", "FedRAMP", "FISMA", "OMB M-24-10", "GDPR"],
    riskLevel: "very-high",
    euAIActCategory: "high-risk",
    questionCount: 6,
    assurancePacks: ["governanceNISTRMF"],
    primaryModules: ["W3", "E15", "W1", "W7", "E34"],
    complianceFrameworks: ["NIST AI RMF", "FedRAMP", "FISMA", "OMB M-24-10", "GDPR", "EU AI Act"]
  },
  technology: {
    id: "technology",
    name: "Technology / General AI Services",
    description: "General-purpose AI services with privacy, incident response, and supply-chain security expectations.",
    regulatoryBasis: ["GDPR", "CCPA", "SOC 2 Type II", "ISO 27001", "OWASP AI Security", "EU AI Act"],
    riskLevel: "high",
    euAIActCategory: "general-purpose",
    questionCount: 6,
    assurancePacks: ["technologyGDPRSOC"],
    primaryModules: ["S1", "S10", "E1", "E5", "V2", "W3"],
    complianceFrameworks: ["GDPR", "CCPA", "SOC 2 Type II", "ISO 27001", "OWASP AI Top 10"]
  },
  wealth: {
    id: "wealth",
    name: "Wealth",
    description: "Financial services and investment agents covering model risk, AML, explainability, fiduciary duty, and market-abuse controls.",
    regulatoryBasis: ["SR 11-7", "BSA/AML", "SEC Rule 17a-4", "UDAAP/ECOA", "MiFID II", "CFTC", "FINRA", "Dodd-Frank", "FCA SYSC", "GDPR"],
    riskLevel: "very-high",
    euAIActCategory: "high-risk",
    questionCount: 14,
    assurancePacks: ["wealthManagementMiFID", "financialModelRisk"],
    primaryModules: ["E20", "E23", "E5", "V8", "S15", "W3"],
    complianceFrameworks: ["SR 11-7", "BSA/AML", "SEC 17a-4", "ECOA", "MiFID II", "FINRA 2111", "SEC Reg BI", "CFTC 1.73", "GDPR", "CCPA"]
  }
};

const DOMAIN_IDS: Domain[] = Object.keys(DOMAIN_REGISTRY) as Domain[];

export function listDomainMetadata(): DomainMetadata[] {
  return DOMAIN_IDS.map((id) => ({ ...DOMAIN_REGISTRY[id], regulatoryBasis: [...DOMAIN_REGISTRY[id].regulatoryBasis], assurancePacks: [...DOMAIN_REGISTRY[id].assurancePacks], primaryModules: [...DOMAIN_REGISTRY[id].primaryModules], complianceFrameworks: [...DOMAIN_REGISTRY[id].complianceFrameworks] }));
}

export function getDomainMetadata(domain: Domain): DomainMetadata {
  const metadata = DOMAIN_REGISTRY[domain];
  return {
    ...metadata,
    regulatoryBasis: [...metadata.regulatoryBasis],
    assurancePacks: [...metadata.assurancePacks],
    primaryModules: [...metadata.primaryModules],
    complianceFrameworks: [...metadata.complianceFrameworks]
  };
}

export function isDomain(value: string): value is Domain {
  return (DOMAIN_IDS as string[]).includes(value);
}

export function parseDomain(value: string): Domain {
  if (!isDomain(value)) {
    throw new Error(`Unknown domain: ${value}. Expected one of: ${DOMAIN_IDS.join(", ")}`);
  }
  return value;
}

export function listDomainIds(): Domain[] {
  return [...DOMAIN_IDS];
}
