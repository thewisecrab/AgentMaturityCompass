"""Pre-built Policy Packs for Compliance Frameworks

Provides ready-to-use policy packs for NIST AI RMF, SOC 2, ISO 42001, and GDPR.
"""
from __future__ import annotations

from amc.watch.w10_policy_packs import PolicyPack


def nist_ai_rmf_policy_pack() -> PolicyPack:
    """NIST AI RMF 1.0 policy pack with Govern/Map/Measure/Manage controls."""
    return PolicyPack(
        name="NIST AI RMF 1.0",
        version="1.0",
        description="NIST AI Risk Management Framework policy pack covering Govern, Map, Measure, and Manage functions.",
        modules=[
            "e1_policy",
            "e4_egress_proxy",
            "e5_circuit_breaker",
            "e7_sandbox_orchestrator",
            "w1_receipts",
            "w2_assurance",
            "w4_safety_testkit",
        ],
        rules=[
            {
                "id": "NIST_GOVERN_1",
                "action": "deny",
                "target": "tool_execution",
                "condition": "governance_bypass_detected",
                "remediation": "Enforce approval gates for high-risk actions",
            },
            {
                "id": "NIST_MAP_1",
                "action": "audit",
                "target": "context_boundary",
                "condition": "role_boundary_crossed",
                "remediation": "Document context mapping and role boundaries",
            },
            {
                "id": "NIST_MEASURE_1",
                "action": "require",
                "target": "evidence_event",
                "condition": "metric_test_audit_ratio_below_0.6",
                "remediation": "Increase measurement coverage for quality assurance",
            },
            {
                "id": "NIST_MANAGE_1",
                "action": "deny",
                "target": "execution",
                "condition": "budget_exceeded_or_frozen",
                "remediation": "Implement active risk response and remediation loops",
            },
        ],
        tags=["compliance", "nist", "ai-rmf", "governance"],
    ).with_digest()


def soc2_policy_pack() -> PolicyPack:
    """SOC 2 Type II policy pack with Trust Services Criteria controls."""
    return PolicyPack(
        name="SOC 2 Type II",
        version="1.0",
        description="SOC 2 Type II policy pack covering Security, Availability, Confidentiality, Processing Integrity, and Privacy.",
        modules=[
            "e1_policy",
            "e4_egress_proxy",
            "e10_gateway_scanner",
            "s1_analyzer",
            "s3_signing",
            "s9_sanitizer",
            "w1_receipts",
            "w2_assurance",
        ],
        rules=[
            {
                "id": "SOC2_SECURITY_1",
                "action": "deny",
                "target": "tool_execution",
                "condition": "governance_bypass_succeeded",
                "remediation": "Block unauthorized actions and policy bypass attempts",
            },
            {
                "id": "SOC2_AVAILABILITY_1",
                "action": "audit",
                "target": "service_continuity",
                "condition": "trace_correlation_low",
                "remediation": "Ensure operational reliability and service continuity",
            },
            {
                "id": "SOC2_CONFIDENTIALITY_1",
                "action": "deny",
                "target": "data_exfiltration",
                "condition": "secret_exfiltration_succeeded",
                "remediation": "Enforce secret handling and data boundary controls",
            },
            {
                "id": "SOC2_PROCESSING_INTEGRITY_1",
                "action": "require",
                "target": "verification",
                "condition": "hallucination_detected",
                "remediation": "Implement verification discipline and correctness controls",
            },
            {
                "id": "SOC2_PRIVACY_1",
                "action": "audit",
                "target": "consent",
                "condition": "missing_consent_or_policy_violation",
                "remediation": "Ensure consent-aware operations and data minimization",
            },
        ],
        tags=["compliance", "soc2", "trust-services", "security"],
    ).with_digest()


def iso42001_policy_pack() -> PolicyPack:
    """ISO/IEC 42001:2023 AI Management System policy pack."""
    return PolicyPack(
        name="ISO/IEC 42001:2023",
        version="1.0",
        description="ISO/IEC 42001:2023 AI Management System policy pack with ISO 42005 Impact Assessment and ISO 42006 Conformity Evidence.",
        modules=[
            "e1_policy",
            "e5_circuit_breaker",
            "e7_sandbox_orchestrator",
            "w1_receipts",
            "w2_assurance",
            "w4_safety_testkit",
            "w6_output_attestation",
        ],
        rules=[
            {
                "id": "ISO42001_CLAUSE4_1",
                "action": "require",
                "target": "documentation",
                "condition": "context_stakeholder_boundary_missing",
                "remediation": "Document AIMS context and stakeholder expectations",
            },
            {
                "id": "ISO42001_CLAUSE5_1",
                "action": "deny",
                "target": "tool_execution",
                "condition": "governance_bypass_detected",
                "remediation": "Evidence leadership commitment and accountability",
            },
            {
                "id": "ISO42001_CLAUSE8_1",
                "action": "deny",
                "target": "execution",
                "condition": "execute_without_ticket_or_provider_bypass",
                "remediation": "Enforce operational lifecycle controls and risk treatment",
            },
            {
                "id": "ISO42001_CLAUSE9_1",
                "action": "require",
                "target": "evaluation",
                "condition": "metric_test_audit_ratio_below_0.6",
                "remediation": "Produce continuous monitoring and measurement evidence",
            },
            {
                "id": "ISO42005_IMPACT_1",
                "action": "require",
                "target": "impact_assessment",
                "condition": "severity_likelihood_uncertainty_missing",
                "remediation": "Quantify impact severity, likelihood, and uncertainty",
            },
            {
                "id": "ISO42006_CONFORMITY_1",
                "action": "require",
                "target": "evidence_package",
                "condition": "trace_receipt_invalid_or_hash_missing",
                "remediation": "Generate certification-ready audit evidence packages",
            },
        ],
        tags=["compliance", "iso42001", "ai-management", "certification"],
    ).with_digest()


def gdpr_policy_pack() -> PolicyPack:
    """GDPR (Regulation (EU) 2016/679) data protection policy pack."""
    return PolicyPack(
        name="GDPR Data Protection",
        version="1.0",
        description="GDPR (Regulation (EU) 2016/679) policy pack covering data protection principles and data subject rights.",
        modules=[
            "e1_policy",
            "e4_egress_proxy",
            "s9_sanitizer",
            "v5_memory_ttl",
            "w1_receipts",
            "w2_assurance",
        ],
        rules=[
            {
                "id": "GDPR_ART5_LAWFULNESS_1",
                "action": "require",
                "target": "documentation",
                "condition": "lawful_basis_missing",
                "remediation": "Document lawful basis for personal data processing",
            },
            {
                "id": "GDPR_ART5_PURPOSE_LIMITATION_1",
                "action": "deny",
                "target": "data_processing",
                "condition": "policy_violation_or_scope_exceeded",
                "remediation": "Enforce purpose limitation for data collection",
            },
            {
                "id": "GDPR_ART5_DATA_MINIMISATION_1",
                "action": "deny",
                "target": "data_collection",
                "condition": "secret_exfiltration_or_excessive_collection",
                "remediation": "Limit data collection to necessary minimum",
            },
            {
                "id": "GDPR_ART5_ACCURACY_1",
                "action": "require",
                "target": "data_quality",
                "condition": "hallucination_detected",
                "remediation": "Ensure personal data accuracy and currency",
            },
            {
                "id": "GDPR_ART5_STORAGE_LIMITATION_1",
                "action": "audit",
                "target": "data_retention",
                "condition": "retention_period_exceeded",
                "remediation": "Implement data retention and deletion policies",
            },
            {
                "id": "GDPR_ART5_INTEGRITY_CONFIDENTIALITY_1",
                "action": "deny",
                "target": "data_exfiltration",
                "condition": "secret_exfiltration_or_unsafe_provider",
                "remediation": "Enforce security measures for data protection",
            },
            {
                "id": "GDPR_ART6_LAWFUL_BASIS_1",
                "action": "deny",
                "target": "processing",
                "condition": "missing_consent_or_policy_violation",
                "remediation": "Verify lawful basis before processing personal data",
            },
            {
                "id": "GDPR_ART15_22_RIGHTS_1",
                "action": "require",
                "target": "data_subject_rights",
                "condition": "rights_mechanism_missing",
                "remediation": "Support data subject rights (access, erasure, portability)",
            },
            {
                "id": "GDPR_ART25_BY_DESIGN_1",
                "action": "require",
                "target": "design",
                "condition": "protection_by_design_missing",
                "remediation": "Implement data protection by design and by default",
            },
            {
                "id": "GDPR_ART32_SECURITY_1",
                "action": "deny",
                "target": "insecure_processing",
                "condition": "governance_bypass_or_injection_detected",
                "remediation": "Apply appropriate technical and organizational security measures",
            },
            {
                "id": "GDPR_ART33_34_BREACH_1",
                "action": "require",
                "target": "breach_notification",
                "condition": "breach_detected",
                "remediation": "Notify supervisory authority and data subjects of breaches",
            },
            {
                "id": "GDPR_ART35_DPIA_1",
                "action": "require",
                "target": "impact_assessment",
                "condition": "high_risk_processing_without_dpia",
                "remediation": "Conduct Data Protection Impact Assessment for high-risk processing",
            },
        ],
        tags=["compliance", "gdpr", "data-protection", "privacy"],
    ).with_digest()


def get_all_prebuilt_packs() -> list[PolicyPack]:
    """Return all pre-built compliance policy packs."""
    return [
        nist_ai_rmf_policy_pack(),
        soc2_policy_pack(),
        iso42001_policy_pack(),
        gdpr_policy_pack(),
    ]
