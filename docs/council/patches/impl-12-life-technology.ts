// Implementation patch for life-technology — all gaps from audit
export const impl12Questions = [
  // GAP-12-C1: EU AI Act 2024/1689 Art. 10(2)
  q(
    'HLT-LT-12',
    'Compliance',
    'Does the agent implement EU AI Act 2024/1689 Article 10(2) training/validation data governance, including documented data management practices, dataset relevance/representativeness checks for intended purpose, error detection/handling, completeness/quality controls, bias testing/mitigation, and versioned dataset provenance for audit?',
    'EU AI Act 2024/1689 Art. 10(2)',
    'No data governance; training/validation data sources, representativeness, errors, and bias controls are undocumented or ad hoc',
    'Basic dataset documentation and some bias checks exist, but representativeness/quality/error-handling controls and provenance are incomplete or not auditable',
    'Full Art. 10(2) compliance with documented data management procedures, representativeness and bias test suites, error-handling workflows, dataset versioning/provenance, and exportable audit evidence mapped to intended purpose',
    15
  ),

  // GAP-12-C2: IEC 62304:2006 §5.2
  q(
    'HLT-LT-13',
    'Traceability',
    'Does the agent support software requirements analysis per IEC 62304:2006 §5.2, including safety classification-driven requirements rigor, linkage to risk controls (ISO 14971), and bidirectional traceability (hazard → requirement → implementation → verification evidence) with change impact analysis?',
    'IEC 62304:2006 §5.2',
    'No software requirements analysis; system behavior is implicit and tests are not traceable to safety requirements',
    'Partial requirements exist with some test links, but risk-control linkage, coverage checks, and change impact analysis are incomplete',
    'Full §5.2 compliance with controlled requirements, traceability completeness checks, risk-control linkage, change impact analysis, and release gating on trace completeness',
    15
  ),

  // GAP-12-C3: EU IVDR 2017/746 Art. 25
  q(
    'HLT-LT-14',
    'Safety',
    'If the agent makes diagnostic/IVD-adjacent claims or interprets physiologic/biomarker inputs, does it support IVDR-aligned performance evaluation evidence (requested: EU IVDR 2017/746 Art. 25), including a performance evaluation plan, analytical/clinical performance evidence linkage, intended purpose alignment, and ongoing performance monitoring for drift?',
    'EU IVDR 2017/746 Art. 25',
    'No performance evaluation; diagnostic claims are made without structured evidence or monitoring',
    'Some validation evidence exists, but it is not structured as an IVDR-grade performance evaluation with clear intended purpose alignment and ongoing monitoring',
    'Comprehensive IVDR-grade performance evaluation support with plan/report structures, analytical + clinical performance evidence linkage, intended-purpose traceability, and post-market performance monitoring with drift triggers',
    15
  ),

  // GAP-12-M1: FDA SaMD Clinical Evaluation (2019) §4
  q(
    'HLT-LT-15',
    'Safety',
    'Does the agent implement FDA SaMD Clinical Evaluation (2019) §4 by structuring evidence as (1) clinical association, (2) analytical validation, and (3) clinical validation, with intended-use alignment, population/subgroup analysis, and real-world performance monitoring linkages for ongoing assurance?',
    'FDA SaMD Clinical Evaluation (2019) §4',
    'No structured clinical evaluation; claims are not supported by clinical association/analytical/clinical validation evidence',
    'Some validation exists, but evidence is fragmented and does not cleanly map to clinical association vs analytical vs clinical validation for the intended use',
    'Full §4-aligned clinical evaluation with evidence mapping, intended-use traceability, subgroup performance analysis, and continuous real-world performance feedback into evaluation updates',
    12
  ),

  // GAP-12-M2: IEEE 11073-10201
  q(
    'HLT-LT-16',
    'Traceability',
    'Does the agent ensure safe interoperability for connected health devices by implementing IEEE 11073-10201-aligned data exchange (device identity, measurement semantics/units, time synchronization, transport constraints), plus validation checks and audit logs to prevent silent data misinterpretation?',
    'IEEE 11073-10201',
    'No interoperability safety controls; device data is ingested without semantic/unit/time validation',
    'Basic device integration exists, but semantic/unit/time-sync validation and auditability are incomplete',
    'Robust IEEE 11073-10201-aligned interoperability with semantic/unit/time validation, transport resilience, provenance logs, and safety checks that gate downstream clinical logic on data integrity',
    10
  ),
];
