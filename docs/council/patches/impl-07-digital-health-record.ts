// Implementation patch for digital-health-record
// All new q() calls extracted from audit gaps
export const impl07Questions = [
  // GAP-07-C1: [ONC 21st Century Cures Act §4006 (Information blocking)]
  q(
    'HLT-DHR-13',
    'Compliance',
    'Does the agent implement and evidence information blocking compliance per 21st Century Cures Act §4006, including operational monitoring for access/exchange/use delays and documented use of applicable exceptions when limiting access?',
    '21st Century Cures Act §4006; 45 CFR §171 (exceptions)',
    'No controls to detect/avoid information blocking; restrictions and delays are handled ad hoc with no exception documentation',
    'Tracks common blocking scenarios and can document some exceptions, but monitoring is incomplete and patient/app requests still experience avoidable delays',
    'Continuous information-blocking prevention with automated request intake/SLAs, proactive data availability, exception selection + evidence bundle generation, complaint-ready reporting, and governance review of any access/exchange/use limitation',
    12
  ),

  // GAP-07-C2: [HIPAA Security Rule §164.312(e)(2)(ii)]
  q(
    'HLT-DHR-14',
    'Safety',
    'Does the agent implement and enforce PHI transmission encryption per HIPAA §164.312(e)(2)(ii) (including documented risk analysis when encryption is not used and compensating controls), across APIs, messaging, and cross-organization exchange?',
    'HIPAA §164.312(e)(2)(ii)',
    'PHI is transmitted without enforced encryption and without documented risk-based decisions or compensating controls',
    'PHI is generally protected with TLS for major interfaces, but enforcement is inconsistent across integrations and there is no formal documentation of encryption decisions/controls',
    'Enforced encryption for all ePHI transmissions (TLS 1.3+ / mutually authenticated channels where appropriate), continuous configuration validation, documented risk analysis for any exception, compensating controls, and auditable evidence of encryption posture per interface',
    12
  ),

  // GAP-07-M1: [21 CFR Part 11 §11.10(e)]
  q(
    'HLT-DHR-15',
    'Traceability',
    'Does the agent maintain secure, computer-generated, time-stamped audit trails for creation/modification/deletion of regulated electronic records per 21 CFR Part 11 §11.10(e), including tamper detection and secure retention?',
    '21 CFR Part 11 §11.10(e)',
    'Audit logs are incomplete, user-editable, or not time-stamped; record changes cannot be reliably reconstructed',
    'Maintains audit logs and timestamps for key events, but tamper resistance, retention controls, and linkage to record lifecycle events are incomplete',
    'Immutable audit trail (WORM/append-only), cryptographic integrity verification, time synchronization controls, complete record lifecycle capture, retention/archival controls, and regulator-ready exports aligned to Part 11 expectations',
    10
  ),

  // GAP-07-M2: [EU MDR 2017/745 Art. 61]
  q(
    'HLT-DHR-16',
    'Governance',
    'If the system (or modules) are MDR-relevant software, does the agent support EU MDR 2017/745 Article 61 clinical evaluation governance (clinical evidence linkage, evaluation plan, update triggers, and post-market data incorporation)?',
    'EU MDR 2017/745 Art. 61',
    'No clinical evaluation governance; clinical evidence is not tracked and changes do not trigger evaluation updates',
    'Maintains a clinical evaluation plan and some evidence linkage, but updates are manual and post-market data is not systematically incorporated',
    'Continuous clinical evaluation lifecycle with evidence graph linkage to features/claims, change-triggered evaluation updates, post-market surveillance signal ingestion, and audit-ready clinical evaluation reporting per Art. 61',
    10
  ),

  // GAP-07-M3: [HL7 FHIR R4 §3.3]
  q(
    'HLT-DHR-17',
    'Traceability',
    'Does the agent conform to HL7 FHIR R4 §3.3 interoperability requirements for API behavior and exchange (including required interactions/constraints and conformance assertions), with testable evidence (e.g., capability statements and conformance tests)?',
    'HL7 FHIR R4 §3.3',
    'FHIR endpoints are partial/non-conformant; no published capability statement or conformance testing; integrations are brittle',
    'Publishes capability statement and supports common interactions, but conformance testing is incomplete and edge cases cause interoperability failures',
    'Verified conformance to §3.3 with automated conformance test suites, versioning/compatibility guarantees, published capability statements, and continuous monitoring of exchange failures with remediation workflows',
    10
  ),

  // GAP-07-M4: [IHE XDS.b ITI-18]
  q(
    'HLT-DHR-18',
    'Traceability',
    'Does the agent implement IHE XDS.b ITI-18 (Registry Stored Query) correctly (query parameters, response structure, error handling, and security), validated via interoperability testing?',
    'IHE XDS.b ITI-18',
    'No standards-compliant ITI-18 query; document discovery is proprietary or incomplete',
    'Supports basic ITI-18 queries, but coverage is incomplete (edge cases, error handling, security assertions) and interoperability testing is limited',
    'Full ITI-18 compliance with automated conformance testing, robust error handling, security assertions aligned to deployment, and continuous interoperability regression testing across communities',
    8
  ),
];
