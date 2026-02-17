import { auditMapSchema, type AuditMapFile } from "./auditMapSchema.js";

function control(params: {
  controlId: string;
  title: string;
  requiredKinds: string[];
  checks: Array<{ source: string; check: string }>;
  remediation?: Array<{ kind: "MECHANIC_ACTION" | "DOC_LINK"; id: string }>;
}) {
  return {
    controlId: params.controlId,
    title: params.title,
    evidenceRequirements: {
      requiredKinds: params.requiredKinds,
      strongClaimGates: {
        minIntegrityIndex: 0.9,
        minCorrelationRatio: 0.9
      }
    },
    satisfiedBy: params.checks,
    remediationActions: params.remediation ?? []
  };
}

export function defaultAuditMapBuiltin(): AuditMapFile {
  return auditMapSchema.parse({
    auditMap: {
      version: 1,
      id: "amc.audit.map.builtin.v1",
      name: "AMC Control Families v1",
      controlFamilies: [
        {
          familyId: "ACCESS_CONTROL",
          title: "Access Control & Identity",
          frameworks: {
            soc2Like: ["CC6"],
            iso27001Like: ["A.5", "A.6", "A.8"],
            nistLike: ["AC"]
          },
          controls: [
            control({
              controlId: "ACCESS_CONTROL.SSO_SCIM",
              title: "SSO/SCIM configured and enforced",
              requiredKinds: ["IDENTITY_CONFIG_SIGNED", "SSO_LOGIN_EVENT", "SCIM_USER_PROVISIONED"],
              checks: [
                { source: "identity", check: "identityYamlSignedAndValid" },
                { source: "events", check: "hasSsoLoginsLast30d" },
                { source: "events", check: "hasScimWritesLast30d" }
              ],
              remediation: [
                { kind: "MECHANIC_ACTION", id: "enable_sso_scim" },
                { kind: "DOC_LINK", id: "docs/SSO_OIDC.md" }
              ]
            }),
            control({
              controlId: "ACCESS_CONTROL.WORKSPACE_MEMBERSHIP",
              title: "Workspace membership and RBAC enforced",
              requiredKinds: ["RBAC_MEMBERSHIP_EVENT", "SESSION_AUTH"],
              checks: [
                { source: "host", check: "workspaceMembershipsConfigured" },
                { source: "events", check: "hasApprovalDecisionsLast30d" }
              ],
              remediation: [{ kind: "DOC_LINK", id: "docs/MULTI_TENANCY.md" }]
            }),
            control({
              controlId: "ACCESS_CONTROL.LEASE_SCOPING",
              title: "Leases are workspace-scoped and least-privilege",
              requiredKinds: ["LEASE_ISSUED", "LEASE_SCOPE_ENFORCED"],
              checks: [
                { source: "leases", check: "leasesIncludeWorkspaceClaim" },
                { source: "events", check: "leaseScopeDenialsTracked" }
              ],
              remediation: [{ kind: "MECHANIC_ACTION", id: "tighten_lease_scopes" }]
            }),
            control({
              controlId: "ACCESS_CONTROL.APPROVALS",
              title: "Dual-control approvals protect high-risk actions",
              requiredKinds: ["APPROVAL_POLICY_SIGNED", "APPROVAL_DECIDED"],
              checks: [
                { source: "approvals", check: "approvalPolicySigned" },
                { source: "events", check: "hasApprovalDecisionsLast30d" }
              ],
              remediation: [{ kind: "DOC_LINK", id: "docs/MECHANIC_WORKBENCH.md" }]
            })
          ]
        },
        {
          familyId: "CHANGE_MANAGEMENT",
          title: "Change Management",
          frameworks: {
            soc2Like: ["CC8"],
            iso27001Like: ["A.8", "A.12"],
            nistLike: ["CM"]
          },
          controls: [
            control({
              controlId: "CHANGE_MANAGEMENT.POLICY_SIGNING",
              title: "Policy changes are signed and auditable",
              requiredKinds: ["POLICY_APPLIED", "SIGNED_CONFIG"],
              checks: [
                { source: "ops", check: "opsPolicySigned" },
                { source: "events", check: "policyChangesSigned" }
              ]
            }),
            control({
              controlId: "CHANGE_MANAGEMENT.APPROVAL_GATES",
              title: "High-risk changes require approvals",
              requiredKinds: ["APPROVAL_DECIDED", "WORK_ORDER"],
              checks: [
                { source: "events", check: "hasApprovalDecisionsLast30d" },
                { source: "approvals", check: "approvalPolicySigned" }
              ]
            }),
            control({
              controlId: "CHANGE_MANAGEMENT.TRANSFORM_PLANS",
              title: "Transformation plans are signed and tracked",
              requiredKinds: ["TRANSFORM_PLAN_CREATED", "TRANSFORM_TASK_ATTESTED"],
              checks: [
                { source: "transform", check: "transformPlansSigned" },
                { source: "events", check: "changeEventsObserved" }
              ]
            }),
            control({
              controlId: "CHANGE_MANAGEMENT.RELEASE_MANIFESTS",
              title: "Release manifests are signed and verified",
              requiredKinds: ["RELEASE_MANIFEST", "RELEASE_BUNDLE_VERIFIED"],
              checks: [
                { source: "release", check: "releaseManifestSigned" },
                { source: "events", check: "changeEventsObserved" }
              ]
            })
          ]
        },
        {
          familyId: "LOGGING_MONITORING",
          title: "Logging & Monitoring",
          frameworks: {
            soc2Like: ["CC7"],
            iso27001Like: ["A.12", "A.16"],
            nistLike: ["AU"]
          },
          controls: [
            control({
              controlId: "LOGGING_MONITORING.TRANSPARENCY_SEAL",
              title: "Transparency log seal verifies",
              requiredKinds: ["TRANSPARENCY_ROOT"],
              checks: [{ source: "transparency", check: "transparencySealValid" }]
            }),
            control({
              controlId: "LOGGING_MONITORING.MERKLE_ROOT",
              title: "Merkle root and proofs verify",
              requiredKinds: ["MERKLE_ROOT"],
              checks: [{ source: "transparency", check: "merkleRootValid" }]
            }),
            control({
              controlId: "LOGGING_MONITORING.LEDGER_CHAIN",
              title: "Evidence ledger hash-chain continuity",
              requiredKinds: ["EVIDENCE_HASH_CHAIN"],
              checks: [{ source: "ledger", check: "ledgerHashChainValid" }]
            }),
            control({
              controlId: "LOGGING_MONITORING.SSE_ACTIVITY",
              title: "Realtime telemetry stream is active",
              requiredKinds: ["SSE_EVENT"],
              checks: [{ source: "events", check: "sseOrgEventsObserved" }]
            })
          ]
        },
        {
          familyId: "SECURE_CONFIGURATION",
          title: "Secure Configuration",
          frameworks: {
            soc2Like: ["CC6", "CC8"],
            iso27001Like: ["A.5", "A.8", "A.12"],
            nistLike: ["CM", "SC"]
          },
          controls: [
            control({
              controlId: "SECURE_CONFIGURATION.OPS_POLICY",
              title: "Ops policy is signed",
              requiredKinds: ["OPS_POLICY"],
              checks: [{ source: "ops", check: "opsPolicySigned" }]
            }),
            control({
              controlId: "SECURE_CONFIGURATION.TRUST_CONFIG",
              title: "Trust config is signed",
              requiredKinds: ["TRUST_CONFIG"],
              checks: [{ source: "trust", check: "trustConfigSigned" }]
            }),
            control({
              controlId: "SECURE_CONFIGURATION.TOOLS_POLICY",
              title: "Tools policy is signed",
              requiredKinds: ["TOOLS_POLICY_SIGNED"],
              checks: [{ source: "tools", check: "toolsPolicySigned" }]
            }),
            control({
              controlId: "SECURE_CONFIGURATION.BUDGETS_POLICY",
              title: "Budgets policy is signed",
              requiredKinds: ["BUDGETS_POLICY_SIGNED"],
              checks: [{ source: "budgets", check: "budgetsPolicySigned" }]
            })
          ]
        },
        {
          familyId: "SUPPLY_CHAIN_INTEGRITY",
          title: "Supply Chain Integrity",
          frameworks: {
            soc2Like: ["CC8"],
            iso27001Like: ["A.15"],
            nistLike: ["SR"]
          },
          controls: [
            control({
              controlId: "SUPPLY_CHAIN_INTEGRITY.PLUGINS",
              title: "Plugin signatures and lock integrity verified",
              requiredKinds: ["PLUGIN_INSTALLED", "INSTALLED_LOCK"],
              checks: [{ source: "plugins", check: "pluginsIntegrityValid" }]
            }),
            control({
              controlId: "SUPPLY_CHAIN_INTEGRITY.RELEASES",
              title: "Release bundles verify successfully",
              requiredKinds: ["RELEASE_MANIFEST", "RELEASE_BUNDLE_VERIFIED"],
              checks: [{ source: "release", check: "releaseBundlesVerified" }]
            }),
            control({
              controlId: "SUPPLY_CHAIN_INTEGRITY.BACKUPS",
              title: "Backup manifests are signed",
              requiredKinds: ["BACKUP_MANIFEST"],
              checks: [{ source: "backup", check: "backupManifestSigned" }]
            }),
            control({
              controlId: "SUPPLY_CHAIN_INTEGRITY.REGISTRY_ALLOWLIST",
              title: "Registry allowlists are signed",
              requiredKinds: ["REGISTRY_ALLOWLIST"],
              checks: [{ source: "registry", check: "registryAllowlistSigned" }]
            })
          ]
        },
        {
          familyId: "INCIDENT_RESPONSE_PREPAREDNESS",
          title: "Incident Response Preparedness",
          frameworks: {
            soc2Like: ["CC7"],
            iso27001Like: ["A.16"],
            nistLike: ["IR"]
          },
          controls: [
            control({
              controlId: "INCIDENT_RESPONSE_PREPAREDNESS.ASSURANCE_RUNS",
              title: "Assurance runs execute on recurrence",
              requiredKinds: ["ASSURANCE_RUN_COMPLETED"],
              checks: [{ source: "assurance", check: "assuranceRecentRun" }]
            }),
            control({
              controlId: "INCIDENT_RESPONSE_PREPAREDNESS.ADVISORIES",
              title: "Advisory workflow is active",
              requiredKinds: ["ADVISORY_CREATED", "ADVISORY_ACKNOWLEDGED"],
              checks: [{ source: "forecast", check: "advisoryFlowActive" }]
            }),
            control({
              controlId: "INCIDENT_RESPONSE_PREPAREDNESS.FREEZE_CONTROLS",
              title: "Freeze controls are tracked",
              requiredKinds: ["FREEZE_CHANGED"],
              checks: [{ source: "events", check: "freezeEventsTracked" }]
            }),
            control({
              controlId: "INCIDENT_RESPONSE_PREPAREDNESS.RETENTION",
              title: "Retention lifecycle is operational",
              requiredKinds: ["RETENTION_RUN"],
              checks: [{ source: "ops", check: "retentionStatusHealthy" }]
            })
          ]
        },
        {
          familyId: "RISK_ASSURANCE_AND_TESTING",
          title: "Risk Assurance & Testing",
          frameworks: {
            soc2Like: ["CC7"],
            iso27001Like: ["A.12", "A.14"],
            nistLike: ["RA"]
          },
          controls: [
            control({
              controlId: "RISK_ASSURANCE_AND_TESTING.POLICY",
              title: "Assurance policy is signed",
              requiredKinds: ["ASSURANCE_POLICY_APPLIED"],
              checks: [{ source: "assurance", check: "assurancePolicySigned" }]
            }),
            control({
              controlId: "RISK_ASSURANCE_AND_TESTING.CERTIFICATE",
              title: "Assurance certificate is present and current",
              requiredKinds: ["ASSURANCE_CERT_ISSUED"],
              checks: [{ source: "assurance", check: "assuranceCertificateFresh" }]
            }),
            control({
              controlId: "RISK_ASSURANCE_AND_TESTING.SCORE_THRESHOLD",
              title: "Risk assurance score meets threshold",
              requiredKinds: ["ASSURANCE_SCORE"],
              checks: [{ source: "assurance", check: "assuranceScoreAboveThreshold" }]
            }),
            control({
              controlId: "RISK_ASSURANCE_AND_TESTING.BREACH_HANDLING",
              title: "Assurance threshold breach is absent or waived",
              requiredKinds: ["ASSURANCE_THRESHOLD_BREACH"],
              checks: [{ source: "assurance", check: "assuranceThresholdBreachAbsent" }]
            })
          ]
        },
        {
          familyId: "DATA_PROTECTION_AND_PRIVACY",
          title: "Data Protection & Privacy",
          frameworks: {
            soc2Like: ["CC6", "CC8"],
            iso27001Like: ["A.5", "A.8", "A.18"],
            nistLike: ["PR", "IP"]
          },
          controls: [
            control({
              controlId: "DATA_PROTECTION_AND_PRIVACY.REDACTION",
              title: "Redaction defaults are active",
              requiredKinds: ["REDACTION_POLICY"],
              checks: [{ source: "policy", check: "promptPolicySigned" }]
            }),
            control({
              controlId: "DATA_PROTECTION_AND_PRIVACY.TRUTHGUARD",
              title: "Truthguard validations are recorded",
              requiredKinds: ["OUTPUT_VALIDATED"],
              checks: [{ source: "events", check: "truthguardValidationObserved" }]
            }),
            control({
              controlId: "DATA_PROTECTION_AND_PRIVACY.NO_SECRET_LEAKS",
              title: "No secret leakage findings are recorded",
              requiredKinds: ["SECRET_SCAN"],
              checks: [{ source: "events", check: "noSecretLeakAudit" }]
            }),
            control({
              controlId: "DATA_PROTECTION_AND_PRIVACY.ENCRYPTED_STORAGE",
              title: "Encrypted blob storage is enabled",
              requiredKinds: ["BLOB_ENCRYPTION"],
              checks: [{ source: "ops", check: "blobEncryptionEnabled" }]
            })
          ]
        },
        {
          familyId: "MODEL_TOOL_GOVERNANCE",
          title: "Model & Tool Governance",
          frameworks: {
            soc2Like: ["CC6"],
            iso27001Like: ["A.8", "A.12"],
            nistLike: ["GV", "MS"]
          },
          controls: [
            control({
              controlId: "MODEL_TOOL_GOVERNANCE.BRIDGE_CONFIG",
              title: "Bridge policy/enforcement is configured",
              requiredKinds: ["BRIDGE_POLICY"],
              checks: [{ source: "bridge", check: "bridgeConfigSigned" }]
            }),
            control({
              controlId: "MODEL_TOOL_GOVERNANCE.ADAPTER_ALLOWLIST",
              title: "Provider/model allowlists are configured",
              requiredKinds: ["ADAPTERS_CONFIG_SIGNED"],
              checks: [
                { source: "adapters", check: "adapterConfigSigned" },
                { source: "events", check: "providerAllowlistEnforced" }
              ]
            }),
            control({
              controlId: "MODEL_TOOL_GOVERNANCE.TOOL_BOUNDARY",
              title: "Denied tools are blocked and audited",
              requiredKinds: ["TOOL_DENIED"],
              checks: [{ source: "events", check: "toolDenialsObserved" }]
            }),
            control({
              controlId: "MODEL_TOOL_GOVERNANCE.HIGH_RISK_APPROVALS",
              title: "High-risk tool actions require approvals",
              requiredKinds: ["APPROVAL_DECIDED", "TOOL_ACTION"],
              checks: [
                { source: "approvals", check: "approvalPolicySigned" },
                { source: "events", check: "hasApprovalDecisionsLast30d" }
              ]
            })
          ]
        }
      ]
    }
  });
}
