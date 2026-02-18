# AMC Platform Architecture v2.0
## Agent Maturity Compass — Full Trust & Safety Platform

> **Version:** 2.0 (expanded from assessment framework to full enforcement platform)  
> **Date:** 2026-02-18  
> **Status:** Canonical. Supersedes MVP_FEATURE_SPEC.md and TECH_ARCHITECTURE.md for product positioning.

---

## 1. What AMC Is Now

AMC started as a maturity assessment framework. It is now a **full-stack trust and safety platform for agent systems**.

The insight that changed everything: assessment without enforcement is a report card, not a safety system. Every organization that buys an AMC Score will ask: "Great, we're L2. How do we get to L4?" That's the product.

**AMC Platform = Measure + Enforce + Prove**

| Layer | What it does | Product suite |
|-------|-------------|---------------|
| **Measure** | Score your current maturity across 7 dimensions | AMC Score |
| **Enforce** | Deploy controls that actually prevent bad outcomes | AMC Shield + AMC Enforce + AMC Vault |
| **Prove** | Generate tamper-evident evidence that you're compliant | AMC Watch |

---

## 2. Platform Suites (5 Core Products)

### Suite 1: AMC Score (Assessment Layer)
*"Where are you now?"*

The original AMC framework. 7 dimensions, L1–L4 maturity levels, evidence-based scoring.

**Dimensions:**
1. Governance — who owns decisions, approval paths, policy change history
2. Security — access control, secrets handling, threat controls
3. Reliability — failure handling, rollback, MTTR
4. Evaluation — output quality measurement, bias/risk scoring
5. Observability — logs, dashboards, alerting
6. Cost Efficiency — spend visibility, budget guardrails, ROI tracking
7. Operating Model — roles, improvement loops, training, cadence

**Products:**
- Compass Sprint ($5,000 one-time): Baseline score + gap analysis + 30/60/90 roadmap
- Continuous Score ($999/mo): Monthly reassessment, drift detection, trend reports
- Enterprise Assessment ($25,000+): Org-wide multi-team scoring, executive dashboard, compliance attestation

---

### Suite 2: AMC Shield (Preventive Security)
*"Stop attacks before they reach your agent."*

7 supply-chain security modules + 3 input safety modules. Sits at the ingestion layer — before content or skills reach the agent's reasoning loop.

**Module S1: Skill Static Analyzer ("ToxicSkill" Linter)**
- Ingests any skill/extension (SKILL.md + scripts + assets)
- Rule engine: remote fetch-and-execute, obfuscated commands, dynamic eval, credential harvesting, suspicious permission claims
- Output: risk score 0–100 + finding explanations + safe alternatives
- Integration: CLI tool + CI/CD hook + agent-load-time gate
- Deployment: SaaS API or self-hosted container
- Pricing: $19–$199/mo per dev; enterprise per-seat

**Module S2: Skill Behavioral Sandbox ("Detonation")**
- Ephemeral container/VM per skill test run
- Instruments: process tree, file writes, network calls, persistence attempts, stdout/stderr
- Multi-run randomization to detect evasion
- "No internet" mode for air-gapped testing
- Output: behavioral report + risk verdict + network trace
- Pricing: $1–$10 per scan or $199–$999/mo subscription

**Module S3: Skill Signing & Publisher Identity**
- Cryptographic signing for skills (developer key + org key)
- Publisher verification: domain, email, lightweight KYC for paid tiers
- Signed skill manifests with version pinning
- Client-side verification hook at install/load time
- Key rotation + revocation registry
- Agent policy: refuse unsigned skills from untrusted publishers
- Pricing: $99–$999/yr per publisher; enterprise policy controls included

**Module S4: Skill SBOM, Dependency Pinning & CVE Watcher**
- Build-time SBOM generation per skill
- Pin all dependencies (no floating versions)
- Detect fetch-and-execute patterns (`curl | bash` style attacks)
- Continuous CVE watch with alert on new vulnerabilities
- "Dynamic fetch" pattern detection and blocking
- Pricing: $49–$499/mo by skill count

**Module S5: Skill Reputation Graph & Trust Scoring**
- Publisher profiles with verification badges
- Aggregated signals: install counts, uninstall rates, crash rates, security reports
- Cryptographic signing history
- Privacy-preserving telemetry (opt-in)
- Trust threshold enforcement: agent policy blocks installs below threshold
- Sybil resistance: verified identities + anomaly detection on reputation signals
- Pricing: $1k–$20k/mo marketplace tier; $49–$199/mo pro user

**Module S6: Skill Permission Manifest & Least-Privilege Installer**
- Required manifest schema: declares all capabilities (filesystem R/W, shell exec, browser control, outbound network, messaging send, cron scheduling, config changes)
- Install-time grant/deny UI per capability
- Runtime enforcement via policy gate (deny undeclared capabilities)
- Capability attestation in signed receipt
- Pricing: $9–$49/mo individual; bundled in enterprise governance suite

**Module S7: Private Enterprise Skill Registry**
- Managed internal ClawHub: curated skills, version control, internal scanning
- CI pipeline: S1 static scan → S2 sandbox → S3 sign → publish
- Agent policy: only allow installs from private registry (no public marketplace)
- Mirror/sync with public registry (allowlisted only)
- Access controls: team-based install permissions
- Pricing: $2k–$30k/mo by org size and SLA

**Module S8: Channel Ingress Shield**
- Inbound message gating: pairing/allowlists, mention-gating in groups, trust tier by sender
- Rate limiting + automatic quarantine for abuse patterns
- Approval workflow for new sender pairings
- Group policy templates: "require mention," "DM only," "allowlist only"
- Audit log of all ingress decisions
- Pricing: $49–$499/mo per workspace

**Module S9: Content Sanitization Gateway**
- Dedicated "reader" pipeline for untrusted web pages, emails, docs, attachments
- Strips adversarial instruction patterns from content
- Extracts verified facts → passes only sanitized summary to action agent
- Provenance metadata: source URL, timestamp, sanitization confidence score
- Reader agent: no tools or read-only; Action agent: full tools but only consumes sanitized output
- Pricing: $29–$299/mo per agent host

**Module S10: Prompt Injection Detector & Content Risk Scorer**
- Hybrid detection: regex rules + LLM classifier
- Flags: "ignore system prompt," embedded commands, hidden Unicode/HTML instructions, invisible text
- Risk score per content item: safe / suspicious / block
- Risk actions: block tool usage, downgrade to reader mode, require human approval
- "Why flagged" explanation + override policy
- Pricing: $0.001–$0.01 per item or $49–$499/mo

---

### Suite 3: AMC Enforce (Runtime Controls)
*"Hard limits at the tool boundary — not in the prompt."*

9 runtime enforcement modules. These sit between the model's reasoning output and actual tool execution. Model compliance is irrelevant — these work regardless.

**Module E1: Tool Policy Firewall (Policy-as-Code)**
- Policy engine between model and tool layer
- Allow/deny by: context (DM vs group), sender trust tier, time of day, workspace
- Parameter constraints: browser can only visit allowlisted domains; shell only in approved directories
- Control plane protection: deny config apply/patch, cron scheduling, session spawning in untrusted sessions
- OPA-style policy language with decision logs
- Default templates: "messaging-only," "read-only," "trusted-operator," "full-autonomous"
- Pricing: $99–$2k/mo by agent count

**Module E2: Exec Guard (Shell & system.run Protection)**
- Command allowlist with argument validators
- Working directory restrictions
- Approval requirement for flagged commands (destructive, privilege-escalating, network-touching)
- Command + rationale + output hash logging
- Pattern-based quarantine: suspicious sequence detection
- Profile presets: "no exec," "safe exec" (allowlisted only), "operator exec" (full with logging)
- Pricing: $49–$999/mo

**Module E3: Browser Automation Guardrails**
- Block downloads by default
- Block credential entry on untrusted domains
- Look-alike domain detection + suspicious redirect alerting
- "Safe-click" policy: no clicks on Run/Install UI elements without approval
- Screenshot + DOM diff monitoring for behavioral anomalies
- Domain allowlist + reputation feed integration
- Pricing: $19–$199/mo per agent

**Module E4: Network Egress Proxy & Domain Allowlist**
- Transparent proxy for all agent outbound traffic
- Session-tagged policies: trusted vs untrusted sessions get different rules
- Block known pastebins / raw script hosts in sensitive contexts
- Outbound destination logging for forensics
- New domain alerting (first-seen domain triggers review)
- "Air-gap mode": no outbound except explicitly approved list
- Pricing: $99–$999/mo

**Module E5: Budget Circuit Breaker**
- Per-session hard limits: token spend, tool call count, execution time, browser page depth
- Auto-kill switch on limit hit with safe checkpointing
- "Safe mode" downgrade (read-only + no external calls) when approaching limits
- Billing integration: alert before actual API costs hit
- OWASP LLM DoS protection compliance
- Pricing: $49–$499/mo; often bundled into governance suite

**Module E6: Step-Up Authorization ("MFA for Agent Actions")**
- Approval required for: financial transactions, file deletion, config changes, user invitations, cron scheduling, external message sends
- Approval channels: mobile push, Slack, Teams, webhook
- Time-boxed approvals: auto-deny if no response in N minutes
- Emergency override with audit record
- Who approved + timestamp + session context logged to AMC Watch
- Pricing: $99–$2k/mo by approvals volume

**Module E7: Sandbox Orchestrator**
- Per-session ephemeral container/VM with constrained filesystem
- Automatic spin-up for group chats / untrusted sessions
- Workspace-only filesystem mapping; no secrets in sandbox
- Network allowlists per sandbox type
- Teardown + audit trail on session end
- Integration with AMC Watch for sandbox activity logging
- Pricing: $99–$1k/mo + compute pass-through

**Module E8: Cross-Session Data Firewall (Multi-Agent Isolation)**
- Memory and filesystem namespace isolation per session
- Work session cannot read personal session memory; group chat cannot read private files
- "One-way transfer" protocol: sanitized summaries only (via Module S9) can flow from untrusted to trusted sessions
- Sub-agent scope restrictions: spawned agents inherit minimal permissions, not parent permissions
- Pricing: $199–$5k/mo (high enterprise value)

**Module E9: Outbound Communications Safety Layer**
- Pre-send validation hook for all outbound messages/emails
- Recipient allowlists + "no cold outreach" enforcement mode
- Content DLP check before send (Module V2 integration)
- Rate limits per recipient and per time window
- Template-based sending: only fill declared variables, no free-form generation
- Quarantine queue for flagged outbound
- Pricing: $49–$499/mo per org

---

### Suite 4: AMC Vault (Data Protection)
*"Secrets stay secret. Data stays clean."*

4 data protection modules covering secrets, PII, exfiltration detection, and memory security.

**Module V1: Secrets Broker & Just-in-Time Credentials**
- Agent never stores raw API keys; requests scoped short-lived tokens per action
- Token scope: "read invoices" not "admin all"; "send one email" not "inbox full access"
- Vault integration (HashiCorp Vault, 1Password, AWS Secrets Manager, or native)
- Automatic rotation and revocation
- Stolen token damage containment: scope-limited, time-expiring
- Usage log: which agent, which action, which token, timestamp
- Pricing: $99–$2k/mo by integration count

**Module V2: DLP Redaction Middleware**
- Detection and redaction from: prompts, tool outputs, transcripts, outgoing messages, logs
- Detects: API keys, passwords, private keys, PII (email, phone, address, SSN), internal URLs, credit card numbers
- Methods: regex + entropy analysis + trained classifier
- "Redaction receipts": what was removed, where, confidence score
- Configurable: redact vs. block vs. alert-and-pass
- Pricing: $0.50–$5 per 1k items or $49–$999/mo

**Module V3: Honeytokens & Canary Files**
- Plant decoy secrets (fake API keys, dummy files, synthetic PII) in filesystem and logs
- Monitor for access or transmission of canary tokens
- Auto-response on trigger: lock down tools, revoke live tokens, isolate session, alert operator
- "Canary in the coal mine": detects when agent workflow has been hijacked
- SIEM integration for canary alert routing
- Pricing: $49–$499/mo

**Module V4: Secure Memory & RAG Guard**
- Access control per user/session for agent memory / vector stores
- Retrieval filtering: don't retrieve secrets or sensitive fields into untrusted contexts
- "Instruction stripping" on retrieved documents (via Module S9 integration)
- New document quarantine: all new ingests quarantined until scanned by Module S10
- Poisoning detection: anomaly scoring on new documents vs. established corpus
- OWASP data/model poisoning coverage
- Pricing: $99–$2k/mo

---

### Suite 5: AMC Watch (Monitoring, Audit & Assurance)
*"Prove it. Every action. Tamper-evident."*

2 modules covering signed audit trails and continuous assurance.

**Module W1: Signed Action Receipts Ledger**
- Every tool call produces a structured receipt:
  - Tool name, parameters (redacted by V2), outputs
  - Timestamp, session ID, sender identity
  - Policy decision: why allowed or blocked (from E1)
  - Cryptographic signature (HMAC-SHA256 or asymmetric)
- Append-only hash-chain storage (tamper-evident by design)
- SIEM export (Splunk, Datadog, Elastic, S3)
- Search UI + export for incident response
- Compliance report generation: SOC 2 Type II evidence packs
- Pricing: $99–$5k/mo

**Module W2: Continuous Assurance Suite**
- **Config drift & security audit runner**: Automated audit on schedule, flags misconfigs against secure baseline
- **Policy baseline enforcement**: "Secure baseline" templates, drift alerts, forced re-approval on change
- **OWASP LLM Top 10 coverage tests**: Automated regression suite for prompt injection, supply chain, insecure output, data leakage, DoS, etc.
- **Red team autopilot**: Scheduled adversarial tests against live agent configuration
- **Incident response autopilot**: On suspected breach — isolate session, revoke tokens, rotate credentials, collect evidence pack, open IR ticket
- **Risk scoring dashboard**: Real-time composite risk score across all modules
- Pricing: $1k–$50k/mo; modular add-ons available

---

## 3. How Suites Map to AMC Score Dimensions

Buying AMC Platform is buying the enforcement layer for each dimension:

| AMC Score Dimension | Suite(s) That Enforce It | Key Modules |
|---------------------|--------------------------|-------------|
| **Governance** | AMC Enforce | E1 Tool Policy Firewall, E6 Step-Up Auth, E8 Cross-Session Firewall |
| **Security** | AMC Shield + AMC Enforce + AMC Vault | S1–S10, E2–E5, V1–V4 |
| **Reliability** | AMC Enforce + AMC Watch | E5 Budget Circuit Breaker, E7 Sandbox, W1 Receipts, W2 Assurance |
| **Evaluation** | AMC Watch | W1 Receipts Ledger, W2 Assurance Suite (continuous eval module) |
| **Observability** | AMC Watch | W1 Signed Receipts, W2 Config Drift + Dashboard |
| **Cost Efficiency** | AMC Enforce | E5 Budget Circuit Breaker + billing integrations |
| **Operating Model** | AMC Watch + AMC Score | W2 Assurance Suite, continuous reassessment |

**The L4 achievement path:**

| Starting Level | AMC Platform Tier | Expected Outcome |
|----------------|-------------------|------------------|
| L1 (Ad hoc) | AMC Score + AMC Shield | Reaches L2–L3 Security, L2 Governance |
| L2 (Developing) | + AMC Enforce | Reaches L3–L4 Governance, Security, Reliability |
| L3 (Defined) | + AMC Vault + AMC Watch | Reaches L4 Observability, Evaluation, Operating Model |
| L4 (Optimized) | Full Platform + W2 | Maintains L4; generates compliance evidence automatically |

---

## 4. Product Bundles & Pricing

### Starter Bundle: AMC Score Only
- Compass Sprint (one-time): $5,000
- Continuous Score: $999/mo

### Growth Bundle: AMC Score + AMC Shield
- Continuous Score: $999/mo
- AMC Shield (modules S1–S10): $499/mo
- **Bundle:** $1,299/mo (save 10%)

### Professional Bundle: + AMC Enforce
- Growth Bundle + AMC Enforce (E1–E9): $999/mo
- **Bundle:** $2,099/mo

### Enterprise Bundle: Full Platform
- All 5 suites: custom pricing
- **Range:** $5,000–$50,000/mo depending on agent count, deployment model, SLA
- Includes: dedicated implementation engineer, quarterly maturity reviews, compliance evidence packs

### Marketplace / OEM Licensing
- For agent platform providers bundling AMC as native trust layer
- Revenue share or per-MAA (Monthly Active Agent) pricing: $1–$10/agent/mo
- White-label option available

---

## 5. Technical Architecture

### Deployment Models

**SaaS (Default)**
- AMC Platform hosted; agent connects via SDK or webhook
- Data residency: US (default), EU (Enterprise)
- Uptime SLA: 99.9%

**Self-Hosted**
- All modules deployable as Docker containers
- Kubernetes Helm chart for enterprise
- No data leaves customer environment
- Requires annual enterprise license

**Embedded (OEM)**
- SDK-level integration into agent runtimes
- Modules run in-process with minimal latency overhead
- Available for: Python (primary), TypeScript, Go

### Integration Points

```
Agent Runtime
     │
     ├── [S8] Channel Ingress Shield ←── inbound messages
     │          │
     │    [S9/S10] Content Sanitization + Injection Detector
     │          │
     ├── Model Reasoning Loop
     │          │
     │    [E1] Tool Policy Firewall ←── checks every tool call
     │          │
     │    [E6] Step-Up Auth ←── high-risk actions pause here
     │          │
     │    Tool Execution Layer
     │    ├── [E2] Exec Guard (shell)
     │    ├── [E3] Browser Guardrails
     │    ├── [E4] Network Egress Proxy
     │    └── [E9] Outbound Comms Safety
     │          │
     │    [V1] Secrets Broker ←── credential injection
     │    [V2] DLP Redaction ←── pre-output sanitization
     │          │
     └── [W1] Signed Action Receipt ←── every action logged
               │
          [W2] Continuous Assurance ←── monitors everything
```

### Data Flow & Privacy

- Receipts (W1): encrypted at rest, customer-owned keys, BYOK supported
- DLP redaction (V2): data never leaves your network in self-hosted mode
- Behavioral sandbox (S2): ephemeral containers; no persistent data post-scan
- Canary tokens (V3): only metadata transmitted (canary ID + trigger timestamp), never payload content

---

## 6. Compliance Coverage

| Standard | AMC Platform Coverage |
|----------|-----------------------|
| OWASP LLM Top 10 | Full coverage via W2 automated test suite |
| NIST AI RMF | Governance (Score), Monitor (Watch), Measure (Score + Watch) |
| SOC 2 Type II | Evidence packs via W1 Receipts + W2 Audit Runner |
| ISO 27001 | Security controls documentation + audit trail |
| GDPR / data privacy | DLP (V2), data residency controls, retention policies |
| EU AI Act (emerging) | High-risk AI system documentation, human oversight evidence |

---

## 7. Self-Hosting Readiness

Full containerized deployment:

```bash
# Add AMC Helm repo
helm repo add amc https://charts.agentmaturitycompass.com

# Install with defaults
helm install amc-platform amc/amc-platform \
  --namespace amc-system \
  --set global.licenseKey=YOUR_KEY \
  --set global.agentRuntime=openclaw  # or: custom, langchain, autogen

# Configure your agent to use AMC
export AMC_ENDPOINT=http://amc-platform.amc-system.svc.cluster.local
export AMC_POLICY=enterprise-secure  # or: starter, growth, custom
```

Modules can be enabled/disabled per deployment:
```yaml
modules:
  shield:
    s1_static_analyzer: true
    s2_behavioral_sandbox: false  # expensive; enable for CI only
    s3_signing: true
  enforce:
    e1_policy_firewall: true
    e6_stepup_auth: true
  vault:
    v1_secrets_broker: true
    v2_dlp: true
  watch:
    w1_receipts: true
    w2_assurance: false  # enterprise only
```

---

## 8. Build Roadmap

### Phase 1 (Months 1–3): Foundation
- AMC Score: Full assessment platform with self-service questionnaire
- W1: Signed Action Receipts Ledger (highest enterprise pull)
- E1: Tool Policy Firewall (most critical runtime control)
- S1: Skill Static Analyzer (supply chain entry point)
- V2: DLP Redaction Middleware

### Phase 2 (Months 4–6): Shield & Enforce
- S2: Behavioral Sandbox
- S3: Signing + Publisher Identity
- S8–S10: Channel Ingress + Content Sanitization + Injection Detector
- E2: Exec Guard
- E6: Step-Up Auth

### Phase 3 (Months 7–9): Vault & Watch
- V1: Secrets Broker
- V3: Honeytokens
- V4: RAG Guard
- W2: Continuous Assurance Suite (core modules)

### Phase 4 (Months 10–12): Enterprise & OEM
- S4–S7: SBOM, Reputation Graph, Private Registry
- E3–E5, E7–E9: Remaining enforce modules
- W2: Red team autopilot + IR autopilot
- OEM SDK packaging

---

## 9. Key Risks & Mitigations

| Risk | Mitigation |
|------|-----------|
| False positives in S1/S10 causing workflow disruption | Explainable findings + allowlist rules + shadow mode before enforce |
| Evasion of S2 sandbox | Multi-run randomization, network isolation, behavior deduplication |
| Key theft for S3 signing | Short-lived certs, key rotation, revocation registry |
| Sybil attacks on S5 reputation | Verified identity requirement + anomaly detection on reputation signals |
| Scope creep in W2 | Ship as modular add-ons with minimum secure baseline first |
| Customer pushback on latency from enforcement layer | Async logging where possible; P99 latency budget per module <50ms |

---

**Files created/updated:** `AMC_OS/PRODUCT/PLATFORM_ARCHITECTURE_v2.md`
**Acceptance checks:**
1. All 25 products named, specced, and priced
2. Dimension mapping table complete (all 7 dimensions covered)
3. Technical architecture diagram shows integration order
4. Build roadmap has concrete phase milestones
5. Compliance coverage table addresses top 5 standards

**Next actions:**
1. Update AMC_DIMENSIONS_FRAMEWORK.md to reference platform modules at each maturity level
2. Rewrite PRICING_MODEL.md to reflect 5-suite bundle structure
3. Rewrite LANDING_PAGE_COPY with platform positioning
4. Spawn technical spec agents for each of the 25 modules
5. Update TECH_ARCHITECTURE.md with integration diagram
