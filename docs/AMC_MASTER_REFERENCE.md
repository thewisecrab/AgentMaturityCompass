# AMC Master Reference

This document is the complete product and technical reference for **Agent Maturity Compass (AMC)** across architecture, trust model, runtime behavior, governance, evidence, forecasting, benchmarking, assurance, audit, value, and credentialing.

Audience:
- Developers and platform engineers
- PMs and product owners
- Security/compliance/audit stakeholders
- Operators and workspace owners
- Agent creators and internal users

This is the single "what AMC is, what it does, and how it works" document.

## 1) What AMC Is

AMC is an evidence-first control plane for AI agents that:
- observes and governs agent behavior through signed policies and lease-scoped access,
- computes maturity and operating posture from **observed/attested** evidence (not self-reported claims),
- enforces risk boundaries (budgets, approvals, freezes, allowlists),
- supports continuous recurrence through schedulers and signed checkpoints,
- provides unified clarity from workspace to host portfolio to ecosystem comparison.

AMC is designed as a deterministic system:
- no LLM scoring/planning for governance math,
- reproducible artifacts,
- signed configurations and outputs,
- tamper-evident logs and proof chains.

## 2) Core Principles Implemented

- Continuous recurrence: periodic diagnostic/forecast/assurance/value/binder refresh.
- Realtime unified clarity: console + SSE + signed status surfaces.
- Compass over maps: guidance is iterative and evidence-updated, not static roadmap promises.
- 4Cs framing: Concept, Culture, Capabilities, Configuration are reflected in transformation flows.
- Strategy-failure risk handling: ecosystem focus, clarity path, economic significance, risk assurance, digital duality.
- Five value dimensions: emotional, functional, economic, brand, lifetime.
- Anti-cheat posture: agents cannot submit scores; self-report is labeled and capped.

## 3) System Architecture

AMC is implemented as layered subsystems.

### 3.1 Interface Layer

- CLI: `amc` top-level control surface.
- Console/PWA: device-first operational UI.
- Studio API: workspace and host control APIs.
- Bridge compat APIs: OpenAI/Anthropic/Gemini/xAI/OpenRouter/local-compatible fronts.
- SDK/wrapper surfaces: integration for external agent runtimes.

### 3.2 Control Layer

- RBAC + sessions + host/workspace isolation.
- Governance engine: approvals, tickets, work orders, policy gates.
- Scheduler engines: loop, forecast, prompt packs, assurance, value, audit cache.
- Mechanic workbench: targets, plans, simulations, execution orchestration.

### 3.3 Evidence Layer

- Ledger hash chain + receipts + correlation engine.
- Transparency log + Merkle roots/proofs.
- Trust tier composition: OBSERVED, ATTESTED, SELF_REPORTED weighting.
- Signature verification and fail-closed readiness gating.

### 3.4 Distribution/Interop Layer

- Bench artifacts + registry.
- Audit binder exports.
- Passport credentials.
- Open schema bundle for ecosystem validation.

## 4) Source Map (Major Implemented Modules)

Top-level implementation directories under `/Users/thewisecrab/AMC/src`:

`adapters`, `approvals`, `archetypes`, `assurance`, `audit`, `auth`, `bench`, `benchmarks`, `bom`, `bootstrap`, `bridge`, `budgets`, `bundles`, `canon`, `casebooks`, `cgx`, `ci`, `claims`, `cli`, `compliance`, `config`, `console`, `context`, `corrections`, `correlation`, `crypto`, `dashboard`, `diagnostic`, `doctor`, `drift`, `e2e`, `eoc`, `experiments`, `exports`, `federation`, `fleet`, `forecast`, `gateway`, `governor`, `guardrails`, `identity`, `incidents`, `ingest`, `integrations`, `lab`, `learning`, `leases`, `ledger`, `loop`, `mechanic`, `mode`, `notary`, `ops`, `org`, `outcomes`, `pairing`, `passport`, `plugins`, `policyPacks`, `prompt`, `providers`, `receipts`, `release`, `runtime`, `runtimes`, `sandbox`, `sdk`, `setup`, `simulator`, `snapshot`, `standard`, `storage`, `studio`, `targets`, `tickets`, `toolhub`, `transformation`, `transparency`, `trust`, `truthguard`, `tuning`, `utils`, `value`, `vault`, `verify`, `workorders`, `workspaces`.

## 5) Identity, Access, and Isolation

### 5.1 Roles and Auth Modes

- Session/RBAC roles: `OWNER`, `OPERATOR`, `AUDITOR`, `APPROVER`, `VIEWER`, `AGENT`.
- Lease auth: short-lived, scoped tokens for agents.
- Host identity: OIDC + SAML SSO and SCIM provisioning.

### 5.2 Hard Boundaries

- Agents cannot perform owner-governed operations.
- Lease-auth is denied on identity/admin/audit/passport and other protected APIs.
- Host and workspace isolation is enforced in routing + membership checks.
- In host mode, workspace claim from lease overrides URL workspace on agent paths.

### 5.3 Fail-Closed Rules

- Invalid signatures for trust-critical config/policy produce readiness failures (`/readyz` 503).
- Untrusted identity/prompt/policy/audit/passport states surface explicit reasons.
- Notary-required operations fail closed when notary attest/sign paths are unavailable.

## 6) Cryptographic Trust and Evidence Integrity

### 6.1 Signing Modes

- `LOCAL_VAULT`: local audited signer path.
- `NOTARY`: externalized attestation/signing boundary for stronger separation.

### 6.2 Signed Assets

- Policies/configs, scorecards/plans, benchmark/passport/audit/assurance/release artifacts, root records, scheduler states, caches.

### 6.3 Proof Anchors

- Transparency log roots and signatures.
- Merkle root + inclusion proofs.
- Calculation manifests bound by hash.

### 6.4 Verify-All

- `amc verify all --json` checks trust configs, policy signatures, plugins, transparency/merkle, forecast/bench/passport/binder artifacts, releases/backups where present.

## 7) Data and Artifact Inventory

Primary artifact families:

| Artifact | Purpose | Typical Extension | Verified By |
|---|---|---|---|
| Evidence bundle | Portable run evidence | `.amcbundle` | bundle verify |
| Benchmark | Ecosystem comparison unit | `.amcbench` | bench verify |
| Prompt pack | Enforced Northstar prompt package | `.amcprompt` | prompt pack verify |
| Assurance certificate | Risk-assurance checkpoint | `.amccert` | assurance cert verify |
| Audit binder | Auditor-ready crosswalk export | `.amcaudit` | audit binder verify |
| Passport | Shareable maturity credential | `.amcpass` | passport verify |
| Release bundle | Offline release verification | `.amcrelease` | release verify |
| Backup bundle | Encrypted signed backup | `.amcbackup` | backup verify |
| Federation package | Offline inter-org sync | `.amcfed` | federate import verify |
| Transparency bundle | Log export/verify | `.amctlog` | transparency verify-bundle |
| Merkle proof | Inclusion proof package | `.amcproof` | merkle verify-proof |

## 8) Operational Feature Areas (What + How)

### 8.1 Studio, Setup, Lifecycle

What:
- Guided setup, start/stop, status, doctor, and go-live smoke checks.

How:
- `amc setup` provisions signed defaults and demo mode.
- `amc up` starts Studio with trust/readiness checks.
- `amc down` gracefully stops dev runtime.
- `amc e2e smoke --mode local|docker|helm-template --json` validates end-to-end stack.

### 8.2 Vault, Notary, Trust

What:
- Secret custody and signer boundary.

How:
- Vault stores secrets and supports signing in local trust mode.
- Notary externalizes signing/attestation for protected sign kinds.
- Trust policy controls required sign kinds and fail-closed behavior.

### 8.3 Gateway + Bridge + ToolHub

What:
- Controlled model and tool execution surfaces.

How:
- Gateway enforces leases, route/model constraints, rate/budget controls.
- Bridge offers compatibility fronts:
  - `/bridge/openai/...`
  - `/bridge/anthropic/...`
  - `/bridge/gemini/...`
  - `/bridge/xai/...`
  - `/bridge/openrouter/...`
  - `/bridge/local/...`
- ToolHub performs intent/execute governance with denied/allowed audits.
- Receipts bind request/response hashes and governance decisions.

### 8.4 Pairing, Wrappers, SDK, Universal Integration

What:
- Fast integration with external agents and frameworks.

How:
- Pairing codes are single-use + TTL + audited.
- Wrappers capture process telemetry into evidence-safe hashed/encrypted records.
- SDK integrations route calls through Bridge and correlate events.
- Self-reported telemetry is labeled and cannot inflate maturity.

### 8.5 Governance: Approvals, Tickets, Work Orders, Budgets, Drift, Freeze

What:
- Runtime risk control and human-in-the-loop enforcement.

How:
- Dual-control approvals for security/governance actions.
- Tickets/work orders bind execution intents to signed approval context.
- Budgets cap usage; drift/freeze can halt execution paths.
- Alerts and incidents are logged and evidence-linked.

### 8.6 Canon + CGX + Diagnostic + Truthguard

What:
- Deterministic compass model and evidence-derived scoring.

How:
- Canon and bank are signed and verified.
- CGX builds signed context graphs and safe context packs.
- Diagnostic auto-answer computes 42-question scores from OBSERVED/ATTESTED evidence.
- Missing evidence yields `UNKNOWN` with capped scores.
- Truthguard validates claim discipline against evidence refs and policy.

### 8.7 Mechanic Workbench

What:
- Owner equalizer targets and deterministic upgrade planning.

How:
- Signed targets/profiles/tuning.
- Gap analysis compares measured vs desired.
- Planner selects supported action kinds only.
- Simulator outputs projected bands with honesty notes.
- Execution engine applies approved actions and checkpoints; no auto-fake improvement.

### 8.8 Northstar Prompt Engine

What:
- Signed prompt policy and pack enforcement across providers.

How:
- Builds signed `.amcprompt` packs from CGX/canon/policy bindings.
- Bridge strips user system messages and injects enforced system prompt when enabled.
- Override attempts are logged/rejected per policy.
- Truthguard can enforce response contract on outputs.

### 8.9 Forecasting and Advisories

What:
- Deterministic trend/risk forecasting and actionable advisories.

How:
- Signed forecast policy + evidence gates.
- Models: robust trend/smoothing/change-point/drift/anomaly detection.
- Insufficient evidence returns explicit `INSUFFICIENT_EVIDENCE`.
- Advisories are evidence-bound and tied to supported remediation actions.

### 8.10 Assurance Lab

What:
- Defensive adversarial testing of AMC boundaries.

How:
- Deterministic packs: injection, exfiltration, tool misuse, truthfulness, sandbox boundary, notary attestation.
- Stores hash/refs by default (no raw prompt/output storage).
- Produces structured findings taxonomy + risk assurance score.
- Issues signed assurance certificates when gates pass.
- Supports time-limited dual-control waivers.

### 8.11 Value Realization Engine

What:
- Evidence-bound value scoring and economic significance tracking.

How:
- Signed value policy + signed value contracts.
- Ingest pathways: observed receipts, signed webhook, controlled CSV.
- Computes value dimensions + composite + economic significance/risk.
- Self-report excluded from strong claims.
- Regression emits advisories and recurrence events.

### 8.12 Benchmarks and Registry

What:
- Privacy-safe ecosystem comparative view.

How:
- Creates signed `.amcbench` with proof bindings.
- Registry supports init/publish/verify/serve/import workflows.
- Comparer computes deterministic percentiles/clusters with trust warnings.
- Publishing is approval-gated.

### 8.13 Audit Binder and Compliance Maps

What:
- Auditor-ready evidence crosswalk export.

How:
- Signed audit policy + signed active map.
- Binder export is deterministic, privacy-scanned, and proof-anchored.
- Control families compute PASS/FAIL/INSUFFICIENT_EVIDENCE deterministically.
- Evidence requests are auditor->owner approval workflows for controlled disclosure.

### 8.14 Agent Passport + Open Standard

What:
- Shareable maturity credential + schema interoperability.

How:
- Passport collector builds evidence-bound status from signed checkpoints.
- `VERIFIED` requires gate satisfaction; otherwise `INFORMATIONAL`/`UNTRUSTED`.
- Agent lease can fetch badge only (policy-governed); cannot export/create/verify full passport.
- Standard module generates signed schema bundle and validates artifacts offline.

### 8.15 Plugins and Signed Registries

What:
- Content-only extensibility with trust controls.

How:
- Plugins are packed/signed/verified.
- Registry supports signed index + publish/browse/install.
- Install/upgrade can require approvals.
- Integrity checks feed readiness and diagnostics.

### 8.16 Release Engineering + Ops Hardening

What:
- Production integrity and operational resilience.

How:
- Signed deterministic releases with offline verify.
- Retention, encrypted blobs, backup/restore drills, maintenance, metrics.
- Ops policy signatures are enforced with fail-closed behavior where configured.

### 8.17 Federation + Integrations

What:
- Secure ecosystem synchronization and outbound notifications.

How:
- Federation packages are signed and imported with verification.
- Integrations dispatch deterministic safe payloads with ops receipts.
- No secrets or raw sensitive payloads in integration events.

## 9) CLI Surface (Top-Level Command Groups)

Top-level command families implemented in `/Users/thewisecrab/AMC/src/cli.ts`:

| Command | Purpose |
|---|---|
| `host` | Multi-workspace host mode operations |
| `config` | Inspect resolved runtime configuration |
| `studio` | Studio API helpers |
| `adapters` | Built-in adapter system for one-line agent integration |
| `plugin` | Signed content-only extension marketplace |
| `verify` | Verify integrity across AMC artifacts |
| `target` | Target profile operations |
| `policy` | Policy-as-code operations |
| `governor` | Autonomy Governor checks |
| `tools` | ToolHub tools config |
| `workorder` | Signed work order operations |
| `ticket` | Execution ticket operations |
| `gateway` | AMC universal LLM proxy gateway |
| `bundle` | Portable evidence bundle operations |
| `ci` | CI/CD release gate helpers |
| `archetype` | Archetype packs |
| `export` | Export policy packs and badges |
| `assurance` | Assurance Lab red-team packs |
| `cert` | Certificate operations |
| `dashboard` | Device-first Compass dashboard |
| `vault` | Encrypted key vault operations |
| `notary` | AMC Notary signing boundary operations |
| `trust` | Trust mode and Notary enforcement configuration |
| `canon` | Compass Canon signed content operations |
| `cgx` | Context Graph (CGX) build and verify operations |
| `diagnostic` | Diagnostic bank/render operations |
| `truthguard` | Deterministic output truth-constraint validator |
| `mode` | Switch CLI role mode |
| `loop` | Continuous self-serve maturity loop |
| `user` | Multi-user RBAC account management |
| `identity` | Enterprise identity (OIDC/SAML) configuration |
| `scim` | SCIM token management |
| `pair` | LAN pairing code operations |
| `transparency` | Append-only transparency log operations |
| `compliance` | Evidence-linked compliance map operations |
| `federate` | Offline federation sync operations |
| `integrations` | Integration hub operations |
| `outcomes` | Outcome contracts, value signals, and reports |
| `value` | Value realization engine (contracts, scoring, ROI) |
| `audit` | Audit binder and compliance maps |
| `passport` | Agent Passport (shareable maturity credential) |
| `standard` | Open Compass Standard schema bundle and validation |
| `forecast` | Deterministic evidence-gated forecasting and planning |
| `advisory` | Forecast advisories (list/show/ack) |
| `casebook` | Signed casebook operations |
| `experiment` | Deterministic baseline vs candidate experiments |
| `release` | Deterministic release engineering and offline verification |
| `ops` | Operational hardening policy controls |
| `blobs` | Encrypted evidence blob operations |
| `retention` | Retention/archive payload lifecycle operations |
| `backup` | Signed encrypted backup/restore operations |
| `maintenance` | Operational maintenance operations |
| `metrics` | Prometheus metrics endpoint helpers |
| `prompt` | Northstar prompt policy + pack operations |
| `indices` | Compute deterministic failure-risk indices |
| `fleet` | Fleet operations |
| `agent` | Agent registry operations |
| `provider` | Provider template operations |
| `sandbox` | Hardened sandbox execution |
| `lease` | Issue/verify/revoke short-lived agent leases |
| `budgets` | Signed autonomy and usage budgets |
| `drift` | Drift/regression detection and reporting |
| `freeze` | Execution freeze status and controls |
| `alerts` | Signed drift alert configuration and dispatch |
| `bom` | Maturity Bill of Materials |
| `approvals` | Signed approval inbox operations |
| `whatif` | Equalizer what-if simulator |
| `transform` | Transformation OS (4C plans, tracking, attestations) |
| `org` | Org graph and real-time comparative scorecards |
| `bench` | Public benchmark registry + ecosystem comparative view |
| `benchmark` | Signed ecosystem benchmark snapshots |
| `mechanic` | Mechanic Workbench (targets, plans, simulation) |
| `e2e` | End-to-end smoke verification |

## 10) Console Page Inventory

Implemented pages in `/Users/thewisecrab/AMC/src/console/pages`:

`advisories`, `agent`, `approvals`, `assurance`, `assuranceCert`, `assuranceRun`, `audit`, `auditBinder`, `auditRequests`, `benchCompare`, `benchPortfolio`, `benchRegistry`, `benchmarks`, `budgets`, `commitments-org`, `compare`, `compass`, `compliance`, `contextGraph`, `diagnosticView`, `drift`, `equalizer`, `experiments`, `forecast`, `forecastAgent`, `forecastNode`, `governor`, `home`, `integrations`, `leases`, `login`, `mechanic`, `northstar`, `ops`, `org`, `outcomes`, `passport`, `plugins`, `policypacks`, `portfolioForecast`, `simulator`, `standard`, `systemic`, `toolhub`, `transparency`, `trust`, `upgradeWizard`, `users`, `value`, `valueAgent`, `valueKpis`, `workorders`.

## 11) API Surface (High-Level Families)

Studio workspace API families include:
- auth/session + RBAC
- agents/fleet/provider
- gateway/bridge/toolhub/workorders/tickets
- approvals/budgets/drift/freeze/governor
- transparency/merkle/compliance/federation/integrations
- plugins/registry
- outcomes/casebooks/experiments/value gates
- canon/cgx/diagnostic/truthguard
- mechanic/targets/plan/simulation
- prompt policy/packs/scheduler
- forecast/advisories/scheduler
- assurance policy/runs/certs/waivers/scheduler
- value policy/contracts/ingestion/snapshots/reports/scheduler
- bench policy/create/import/compare/registry
- audit policy/map/binder/requests/scheduler
- passport policy/create/export/verify/badge/cache
- standard schemas generate/verify/read/validate

Host API families include:
- host/workspace management
- host portfolio views
- host identity (OIDC/SAML) and SCIM provisioning
- host-level readiness and policy checks

## 12) Storage Model

Workspace data lives under `.amc/` and includes signed policy/config/artifact stores for all modules:
- identity/trust/auth and session data
- ledger/evidence blobs/transparency/merkle
- governor/budget/tool/policy configs
- forecast/advisory state
- mechanic targets/plans/simulations
- prompt packs and lint outputs
- assurance runs/certs/waivers
- bench exports/imports/comparisons
- audit maps/binders/requests
- value contracts/events/snapshots/reports
- passport policy/exports/cache
- standard schema bundles

Host mode adds host-scoped stores under host directory and isolates workspace stores per tenant.

## 13) Eventing and Recurrence

AMC emits:
- audit events for policy/config/action decisions,
- transparency events for signed checkpoints and exports,
- SSE events for UI realtime updates.

Schedulers implemented for:
- loop recurrence,
- forecast refresh,
- prompt pack refresh,
- assurance runs,
- value snapshots/reports,
- audit binder cache refresh.

## 14) Security and Privacy Guarantees Implemented

- Zero-key agent model via leases and vault-held upstream credentials.
- Strict secret redaction in logs/responses/artifacts.
- PII scanners for benchmark/audit/passport/prompt outputs.
- Deterministic fail-closed gates on untrusted signatures or required trust failures.
- No agent self-report can directly raise maturity/assurance/value strong claims.
- Proof-bound export artifacts for offline verification.

## 15) Test Coverage (Offline)

Comprehensive offline Vitest suites validate modules end-to-end, including:

`adaptersDoctorLeaseCarriers`, `advancedAdversarial`, `agentPassportOpenStandard`, `architectureExperiment`, `assuranceLab`, `assuranceLabV2`, `auditBinderComplianceMaps`, `cgxPropagation`, `circuitBreaker`, `claimConfidence`, `cognitionLab`, `compassCanonCgxTruthguard`, `consoleApprovalsWhatifBenchmarks`, `correctionMemory`, `dataResidency`, `deploymentPack`, `enterpriseSsoScim`, `federationComplianceIntegrationMerkle`, `fleetMode`, `forecastPlanning`, `gatewayAndSupervise`, `governanceLineage`, `governorToolhubWorkorders`, `insiderRisk`, `integrationScaffold`, `ledgerAndDiagnostic`, `mechanicWorkbench`, `microCanary`, `multiWorkspaceHostMode`, `northstarPromptEngine`, `notaryTrust`, `operatorUx`, `opsHardeningPack`, `orgCompass`, `outcomesCasebooksExperimentsValueGates`, `overheadAccounting`, `pluginMarketplace`, `policyCanary`, `publicBenchmarkRegistry`, `questionBank`, `receiptsCorrelationRuntimeDashboard`, `releaseBundlesArchetypesGate`, `releaseEngineeringPack`, `studioVaultModeLoop`, `trustComposition`, `universalAgentIntegrationLayer`, `valueRealizationEngine`, `zeroKeyLeaseBudgetDriftBom`.

## 16) Role-Oriented Usage

### Developer

- Integrate agents via adapters/wrappers/SDK.
- Route provider calls through Bridge/Gateway.
- Use receipts, diagnostics, and verify-all during CI.

### PM / Product Owner

- Track maturity, advisories, value dimensions, and recurrence cadence.
- Use mechanic workbench for target setting and upgrade planning.
- Review comparative scorecards and benchmark positioning.

### Creator / Builder

- Pair and connect agents quickly.
- Apply signed policies/profiles.
- Run assurance and inspect truthguard outcomes.

### Operator

- Manage budgets, approvals, freezes, tickets/workorders.
- Run recurrence schedules and readiness checks.
- Maintain backups/retention/metrics.

### Security / Auditor

- Validate trust boundary and signatures.
- Review assurance findings/certs and waivers.
- Generate audit binders and fulfill evidence requests.
- Verify passports and exported artifacts offline.

### End User / Viewer

- Consume dashboard and console summaries.
- Monitor status, warnings, advisories, and recurrence outcomes.

## 17) Documentation Index (Complete)

Complete docs inventory in `/Users/thewisecrab/AMC/docs`:

`ADAPTERS.md`, `AGENT_PASSPORT.md`, `AMC_QUESTIONS_IN_DEPTH.md`, `AMC_QUESTION_BANK_FULL.json`, `ANTI_HALLUCINATION.md`, `APPROVALS.md`, `ARCHETYPES.md`, `ASSURANCE_CERTS.md`, `ASSURANCE_LAB.md`, `AUDIT_BINDER.md`, `BACKUPS.md`, `BENCHMARKING.md`, `BENCHMARKS.md`, `BENCH_REGISTRY.md`, `BOM.md`, `BRIDGE.md`, `BRIDGE_PROMPT_ENFORCEMENT.md`, `BUDGETS.md`, `BUNDLES.md`, `CANON.md`, `CASEBOOKS.md`, `CERTIFICATION.md`, `CI.md`, `CLI_WRAPPERS.md`, `COMPLIANCE.md`, `COMPLIANCE_MAPS.md`, `CONNECT.md`, `CONSOLE.md`, `CONTEXT_GRAPH.md`, `CONTINUOUS_RECURRENCE.md`, `DASHBOARD.md`, `DEPLOYMENT.md`, `DIAGNOSTIC_BANK.md`, `DOCTOR.md`, `DRIFT_ALERTS.md`, `DUAL_CONTROL_APPROVALS.md`, `ECONOMIC_SIGNIFICANCE.md`, `ECOSYSTEM.md`, `ECOSYSTEM_COMPARATIVE_VIEW.md`, `ECOSYSTEM_VIEW.md`, `ENCRYPTION_AT_REST.md`, `EQUALIZER_TARGETS.md`, `EVIDENCE_REQUESTS.md`, `EVIDENCE_TRUST.md`, `EXPERIMENTS.md`, `FEDERATION.md`, `FLEET.md`, `FORECASTING.md`, `GOVERNOR.md`, `HARDWARE_TRUST.md`, `IDENTITY.md`, `INTEGRATIONS.md`, `LAUNCH.md`, `LEASES.md`, `LOOP.md`, `MECHANIC_MODE.md`, `MECHANIC_WORKBENCH.md`, `METRICS.md`, `MODEL_GOVERNANCE.md`, `MODES.md`, `NORTHSTAR_PROMPTS.md`, `NOTARY.md`, `OPEN_STANDARD.md`, `OPERATIONS.md`, `OPS_HARDENING.md`, `ORG_COMPASS.md`, `ORG_EOC.md`, `OUTCOMES.md`, `PAIRING.md`, `PAIRING_LAN_PWA.md`, `PLUGINS.md`, `PLUGIN_SUPPLY_CHAIN.md`, `POLICY_EXPORT.md`, `POLICY_PACKS.md`, `PREDICTIVE_MAINTENANCE.md`, `PROMPT_POLICY.md`, `PROVIDERS.md`, `RBAC.md`, `REALTIME.md`, `RECEIPTS.md`, `REGISTRY.md`, `RELEASING.md`, `RUNTIMES.md`, `RUNTIME_SDK.md`, `SANDBOX.md`, `SCIM.md`, `SDK.md`, `SECURITY_DEPLOYMENT.md`, `SSO_OIDC.md`, `SSO_SAML.md`, `STUDIO.md`, `SUPPLY_CHAIN.md`, `SYSTEM_CAPABILITIES.md`, `TICKETS.md`, `TOOLHUB.md`, `TRANSPARENCY.md`, `TRANSPARENCY_MERKLE.md`, `TRUTHGUARD.md`, `UPGRADE_AUTOPILOT.md`, `VALUE_CONTRACTS.md`, `VALUE_GATES.md`, `VALUE_INGESTION.md`, `VALUE_REALIZATION.md`, `VAULT.md`, `WAIVERS.md`, `WHATIF.md`, `WORK_ORDERS.md`, `ZERO_KEYS.md`.

## 18) Practical Master Flow (End-to-End)

1. `amc setup` then `amc up`.
2. Connect agents through Bridge or wrappers.
3. Capture OBSERVED evidence and receipts.
4. Run diagnostic/forecast/assurance/value cycles.
5. Manage governance via approvals/budgets/freeze.
6. Tune targets and execute approved upgrade plans.
7. Export benchmark, audit binder, and passport artifacts.
8. Verify artifacts offline and compare ecosystem posture.
9. Repeat on recurrence cadence with fail-closed trust checks.

This is AMC as implemented: deterministic, signed, evidence-bound, privacy-safe, and recurrence-driven.

## 19) Deep Technical Dataflow (How AMC Works End-to-End)

### 19.1 Runtime Call Path (Agent -> Evidence)

1. Agent obtains lease token (pairing/redeem or owner-issued lease).
2. Agent calls Bridge or Gateway endpoint with lease.
3. Policy enforcement checks:
   - workspace claim,
   - provider/model allowlists,
   - budget/rate limits,
   - optional prompt enforcement/truthguard.
4. Request routed to allowed upstream/fake provider.
5. Receipt built from canonicalized/redacted input+output hashes.
6. Ledger events appended (request, decision, response, audit metadata).
7. Transparency/Merkle checkpoints are available for proof-bound artifacts.
8. Downstream engines (diagnostic/forecast/assurance/value) consume evidence.

### 19.2 Governance Change Path (Owner -> Controlled Execution)

1. Owner applies signed policy/config or requests high-risk operation.
2. If action class requires approval, request enters dual-control flow.
3. Quorum decision binds intent hash and execution mode.
4. Execution writes signed state and appends audit/transparency events.
5. Recurrence engines receive trigger events and refresh derived artifacts.

### 19.3 Comparative Export Path (Workspace -> Ecosystem)

1. Export candidate assembled from allowlisted numeric/categorical fields only.
2. PII/secret scanner validates payload and fails on restricted patterns.
3. Artifact signs canonical JSON and bundles proof bindings.
4. Optional publish/import flows verify signatures and registry trust pins.
5. Comparisons compute percentiles/clusters with trust warnings if evidence weak.

## 20) Trust Tiers, Evidence Semantics, and Claim Discipline

### 20.1 Trust Tiers Used

- `OBSERVED`: directly observed AMC-controlled execution traces.
- `OBSERVED_HARDENED`: observed evidence in stronger hardened context.
- `ATTESTED`: cryptographically attested evidence (vault/notary pathways).
- `SELF_REPORTED`: user/agent/system-provided context not trusted for score inflation.

### 20.2 Strong-Claim Rules

Strong claims in scoring/export contexts are only allowed when configured gates pass:
- integrity index threshold,
- correlation ratio threshold,
- minimum observed share and capped self-reported share,
- notary/attestation requirements where enabled.

If gates fail, modules return `INSUFFICIENT_EVIDENCE` and do not present misleading confident numbers.

### 20.3 Truthguard Discipline

Truthguard validates structured claims and evidence refs. It flags:
- unsupported "I did X" assertions without evidence references,
- disallowed tool/model claims,
- secret-like string disclosure,
- output contract violations.

## 21) Governance Action Classes (Implemented)

Action classes defined in governor catalog:
- `READ_ONLY`
- `WRITE_LOW`
- `WRITE_HIGH`
- `DEPLOY`
- `SECURITY`
- `FINANCIAL`
- `NETWORK_EXTERNAL`
- `DATA_EXPORT`
- `IDENTITY`

These classes drive policy, approval requirements, and execution gating.

## 22) Provider, Endpoint, and Integration Coverage

### 22.1 Provider Families

Implemented provider families include:
- OpenAI
- Anthropic
- Google/Gemini
- xAI/Grok
- OpenRouter
- Local mock/upstream

### 22.2 Bridge Compatibility Endpoints

Bridge surfaces provider-compatible fronts (workspace-scoped in host mode):
- `/bridge/openai/v1/chat/completions`
- `/bridge/openai/v1/responses`
- `/bridge/anthropic/v1/messages`
- `/bridge/gemini/v1beta/models/:model:generateContent`
- `/bridge/openrouter/v1/chat/completions`
- `/bridge/xai/v1/chat/completions`
- `/bridge/local/v1/chat/completions`

### 22.3 Agent Integration Modes

- Adapter run (`amc adapters run`).
- Wrapper execution (`amc wrap`).
- SDK instrumentation (`src/sdk/*`).
- Pairing and connect flow (`amc pair`, `amc connect`).

## 23) API Route Index (Implemented Families)

This index is grouped by route family and derived from implemented server routing.

### 23.1 Core Service

- `/health`, `/healthz`, `/readyz`
- `/status`
- `/events/org`
- `/console/*`

### 23.2 Auth + Session + Pairing

- `/auth/login`, `/auth/logout`, `/auth/me`
- `/pair/create`, `/pair/redeem`, `/pair/claim`

### 23.3 Bridge/Tool/Governance

- `/bridge/*`
- `/toolhub/tools`, `/toolhub/intent`, `/toolhub/execute`, `/toolhub/pending-intents`
- `/approvals`, `/approvals/requests`
- `/leases/status`, `/leases/issue`, `/leases/revoke`
- `/budgets`, `/budgets/apply`

### 23.4 Compass Core

- `/canon`, `/canon/verify`, `/canon/apply`
- `/cgx/policy`, `/cgx/policy/apply`, `/cgx/build`, `/cgx/graph/latest`, `/cgx/pack/latest`, `/cgx/verify`
- `/diagnostic/auto-answer`, `/diagnostic/run`, `/diagnostic/bank`, `/diagnostic/bank/verify`, `/diagnostic/bank/apply`, `/diagnostic/render`, `/diagnostic/self-run`
- `/truthguard/validate`

### 23.5 Prompt/Forecast/Assurance

- `/prompt/policy`, `/prompt/policy/apply`, `/prompt/verify`, `/prompt/status`, `/prompt/pack/build`, `/prompt/pack/show`, `/prompt/pack/diff`, `/prompt/scheduler/*`
- `/forecast/policy`, `/forecast/policy/apply`, `/forecast/latest`, `/forecast/refresh`, `/forecast/scheduler/*`
- `/assurance/policy`, `/assurance/policy/apply`, `/assurance/run`, `/assurance/runs`, `/assurance/cert/issue`, `/assurance/cert/latest`, `/assurance/waiver/*`, `/assurance/scheduler/*`

### 23.6 Value/Audit/Passport/Standard

- `/value/policy`, `/value/policy/apply`, `/value/contracts`, `/value/contracts/apply`, `/value/ingest/webhook`, `/value/import/csv`, `/value/snapshot/latest`, `/value/report`, `/value/scheduler/*`
- `/audit/policy`, `/audit/policy/apply`, `/audit/map/*`, `/audit/binder/*`, `/audit/requests/*`, `/audit/scheduler/*`
- `/passport/policy`, `/passport/policy/apply`, `/passport/create`, `/passport/cache/latest`, `/passport/export`, `/passport/verify`, `/passport/exports`, `/passport/badge`
- `/standard/generate`, `/standard/verify`, `/standard/schemas`, `/standard/schemas/:name`, `/standard/validate`

### 23.7 Bench/Registry/Comparisons

- `/bench/policy`, `/bench/policy/apply`, `/bench/create`, `/bench/exports`, `/bench/imports`, `/bench/registries`, `/bench/registry/add`, `/bench/registry/browse`, `/bench/import`, `/bench/compare`, `/bench/comparison/latest`, `/bench/publish`
- `/benchmarks/ingest`, `/benchmarks/list`, `/benchmarks/stats`

### 23.8 Org/Transform/Outcomes/Experiments

- `/org`, `/org/nodes`, `/org/assign`, `/org/unassign`, `/org/scorecards/latest`, `/org/scorecards/recompute`, `/org/commitments/generate`
- `/transform/map`, `/transform/map/apply` and transform plan/task operations
- `/outcomes/*`
- `/experiments/*`

### 23.9 Compliance/Federation/Integrations/Transparency/Plugins

- `/compliance/*`
- `/federation/*`
- `/integrations/*`
- `/transparency/*` and `/transparency/merkle/*`
- `/plugins/*`
- `/policy-packs/*`

### 23.10 Host Routes (Multi-workspace + Identity)

Implemented host route families include:
- `/host/healthz`, `/host/readyz`, `/host/events`
- `/host/api/login`, `/host/api/auth/*`
- `/host/api/auth/oidc/*`, `/host/api/auth/saml/*`
- `/host/api/workspaces`, `/host/api/users`, `/host/api/memberships/*`
- `/host/api/portfolio/forecast`, `/host/api/bench/portfolio`, `/host/api/audit/portfolio`
- `/host/console`, `/host/console/host.html`

## 24) Storage Layout Details (Expanded)

### 24.1 Workspace Core Paths

- `.amc/agents/*` runs and agent state
- `.amc/ledger/*` event and payload chain
- `.amc/transparency/*` append-only transparency + Merkle structures
- `.amc/plugins/*` registry/install lock and plugin cache
- `.amc/forecast/*`, `.amc/assurance/*`, `.amc/value/*`, `.amc/audit/*`, `.amc/bench/*`, `.amc/passport/*`, `.amc/prompt/*`, `.amc/standard/*`, `.amc/mechanic/*`, `.amc/cgx/*`, `.amc/canon/*`, `.amc/diagnostic/bank/*`
- `.amc/ops/*` retention/backup/maintenance/metrics metadata

### 24.2 Host Paths

- Host-level identity config + signatures
- Host vault for identity/scim/session/notary references
- Host portfolio caches (forecast/bench/audit)
- Workspace roots per tenant for isolated `.amc` stores

## 25) Recurrence and Scheduler Matrix

Schedulers are implemented per module, owner-controlled, and signature-aware.

| Scheduler | Scope | Trigger Types |
|---|---|---|
| Loop scheduler | Workspace/agent | manual + cadence |
| Forecast scheduler | Workspace/node/agent | cadence + policy events |
| Prompt pack scheduler | Agent | cadence + CGX/mechanic/policy events |
| Assurance scheduler | Workspace/node/agent | cadence + policy/plugin/prompt/release/notary events |
| Value scheduler | Workspace/agent | cadence + diagnostic/prompt/assurance/plugin/release/approval events |
| Audit cache scheduler | Workspace | cadence + diagnostic/forecast/assurance/bench/policy/approval/notary events |

All schedulers:
- verify policy signatures before execution,
- store signed scheduler state,
- do not bypass readiness/trust restrictions.

## 26) Fail-Closed Matrix (Expanded)

Examples of explicit fail-closed controls:

- Invalid trust or required notary state -> readiness fails.
- Invalid identity config signature -> host auth/scim endpoints unavailable.
- Invalid prompt policy/signature/lint (when enforce configured) -> bridge model calls unavailable.
- Invalid audit policy/map signatures -> audit endpoints unavailable.
- Invalid passport policy signature -> passport endpoints unavailable.
- Assurance threshold breach with fail-closed policy -> readiness blocked unless valid waiver active.
- Invalid benchmark/audit/passport/proof verification -> export/import/verify operations fail.

## 27) Privacy and Secret-Safety Controls

### 27.1 Scanner Families

Privacy scanners across modules reject:
- private key markers,
- email patterns,
- URL patterns,
- absolute file paths,
- token signatures (`sk-`, `AIza`, JWT-like, bearer patterns),
- suspicious long base64 text in restricted fields.

### 27.2 Export Allowlist Model

Bench/audit/passport/value/prompt exports use allowlisted numeric/categorical/hashes:
- no raw prompts,
- no raw model I/O,
- no unrestricted free text,
- no direct secret storage in signed config payloads.

## 28) SSE and Transparency Event Surfaces

Realtime console updates are emitted via SSE hubs for major modules:
- org
- cgx
- prompt
- assurance
- audit
- value
- mechanic
- bench
- passport/standard

Transparency/audit event streams include policy applies, artifact creates/verifies, scheduler updates, approval outcomes, and recurrence checkpoints.

## 29) Deployment and Runtime Topologies

Supported topologies:
- local single-workspace,
- local/host multi-workspace,
- docker-compose,
- helm/k8s templates.

Deployment assets and checks:
- Dockerfile and compose files,
- Helm chart + lint/template checks,
- e2e smoke (`local`, `docker`, `helm-template`) for release readiness.

## 30) CI and Verification Gates

Implemented go-live integrity gates include:
- full tests (`npm test`)
- compile/build (`npm run build`)
- smoke checks (`amc e2e smoke`)
- verify-all (`amc verify all --json`)
- artifact verification commands by family (bench, prompt, cert, audit, passport, release, backup, transparency).

## 31) Extension and Evolution Model

AMC is intentionally extensible via signed content and registries:
- plugin content packs,
- model taxonomy updates,
- compliance map updates,
- policy packs and archetypes.

Extension boundaries:
- no unsigned state mutation in trusted paths,
- no bypass of approvals for governed actions,
- no downgrade of trust gates without explicit signed config change.

## 32) Known Behavioral Guarantees and Limits

Guaranteed by design:
- deterministic policy/evidence computations for implemented engines,
- signature/proof validation for trusted artifacts,
- explicit insufficient-evidence signaling.

Not guaranteed:
- legal certification outcomes,
- future performance promises from forecasts/simulations,
- trust equivalence when bypassing Bridge/observed pathways.

## 33) Suggested Reading Order

1. `/Users/thewisecrab/AMC/README.md`
2. `/Users/thewisecrab/AMC/docs/SYSTEM_CAPABILITIES.md`
3. `/Users/thewisecrab/AMC/docs/LAUNCH.md`
4. `/Users/thewisecrab/AMC/docs/BRIDGE.md`
5. `/Users/thewisecrab/AMC/docs/CANON.md`
6. `/Users/thewisecrab/AMC/docs/MECHANIC_WORKBENCH.md`
7. `/Users/thewisecrab/AMC/docs/FORECASTING.md`
8. `/Users/thewisecrab/AMC/docs/ASSURANCE_LAB.md`
9. `/Users/thewisecrab/AMC/docs/AUDIT_BINDER.md`
10. `/Users/thewisecrab/AMC/docs/AGENT_PASSPORT.md`
11. `/Users/thewisecrab/AMC/docs/OPEN_STANDARD.md`
