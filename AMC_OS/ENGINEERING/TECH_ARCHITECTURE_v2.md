# AMC Technical Architecture v2

**Version:** 2.0 (Production Reference)  
**Date:** 2026-02-18  
**Language:** Python 3.11 first-party implementation

---

## 1) System purpose

AMC v2 is a **modular trust platform for agent systems** with five suites:

1) **AMC Score** (measure)
2) **AMC Shield** (prevention)
3) **AMC Enforce** (runtime controls)
4) **AMC Vault** (data protection)
5) **AMC Watch** (evidence + assurance)

Each module is independently deployable, policy-aware, and connected through common event + control planes.

---

## 2) ASCII integration diagram (all 5 suites)

```text
                        +-----------------------------+
                        |     Agent Runtime/Orchestrator| 
                        |  (OpenAI/Claude/Tools layer) |
                        +-----------------------------+
                                      |
                                      v
+----------------------+      +-----------------------+
| Ingress Channels     | ---> | AMC Shield Ingress    |
| (DM, Email, Webhook) |      | [S8,S9,S10]          |
+----------------------+      +-----------------------+
                                      |
+------------------------+            v
| Skill + Capability     |        +-------------------------+
| Source (local/market)  | -----> |  Skill Gate (S1,S3,S4,S5,S6,S7) |
+------------------------+        +-------------------------+
                                      |
                                      v
                            +-------------------------+
                            |   Agent LLM Reasoning   |
                            |    Core / model / tool  |
                            +-------------------------+
                                      |
                                      v
                        +-----------------------------+
                        |  AMC Enforce Runtime Plane   |
                        | [E1,E2,E3,E4,E5,E6,E7,E8,E9]|
                        +-----------------------------+
                                      |
                                      v
                       +-------------------------------+
                       | Tool Execution / External APIs |
                       +-------------------------------+
                                      |
                                      v
+----------------+      +---------------------+      +----------------+
| Secrets Layer  | ---> | AMC Vault (V1,V2...) | ---> | Model/Data I/O |
| (Token broker) |      +---------------------+      +----------------+
                                      |
                                      v
                             +----------------------+
                             | AMC Watch Evidence   |
                             | [W1,W2] + SIEM/SOAR |
                             +----------------------+
                                      |
                                      v
                               +-------------+
                               | Dashboards  |
                               +-------------+
                                      |
                            +--------------------+
                            | API / SDK Clients  |
                            | (REST + Python SDK)|
                            +--------------------+
```

---

## 3) Module implementation profile (Python 3.11)

**Common stack defaults per module:**
- Language: **Python 3.11**
- API framework: **FastAPI**
- Event bus: **NATS** (self-hosted) or **Redis streams** (small deployments)
- Authn/authz: **mTLS + JWT + API keys + short-lived session tokens**
- Crypto: **PyCA cryptography**, **passlib**, **hashlib/HMAC**
- Logging: **OpenTelemetry + JSON schema logs**
- Policy language: **OPA/Rego-compatible engine wrapper**, JSON policy DSL fallback

| Suite | Module | Integration | Key dependencies | Integration method | Inline latency target |
|---|---|---|---|---|---|
| Score | Continuous Score | Python service, cron + API | pandas, pydantic, numpy, sqlalchemy | REST pull + webhook updates | async (non-inline) |
| Shield | S1 Analyzer | Python scanner service | semgrep, bandit, ast, pip-audit | webhook/CLI | non-inline |
| Shield | S2 Sandbox | Containerized analyzer | docker/podman, seccomp, eBPF probe | SDK hook + webhook | non-inline |
| Shield | S3 Signing | signing verifier service | cryptography, didkit, jose | SDK (publish-time) | inline read path 15ms |
| Shield | S4 SBOM/CVE | inventory scanner | syft/spdx-tools, trivy, pip, npm | webhook + CLI | non-inline |
| Shield | S5 Reputation | reputation service | neo4j/sqlite/postgres, Redis cache | SDK/Webhook | non-inline |
| Shield | S6 Permission manifest | policy metadata service | pydantic, jsonschema, yaml | SDK installer hook | inline <20ms |
| Shield | S7 Private registry | registry service | git, minio/s3, sigstore | webhook + API | non-inline |
| Shield | S8 Ingress Shield | gateway middleware | fastapi middleware, redis, rules engine | webhook/proxy | inline <30ms |
| Shield | S9 Sanitization | content filter service | trafilatura, readability, lxml, bs4, detoxify | proxy | inline <40ms |
| Shield | S10 Injection Detector | classifier service | pydantic, onnxruntime, regex, rapidfuzz | SDK middleware | inline <30ms |
| Enforce | E1 Tool Policy Firewall | policy runtime | OPA, jsonpath-ng, casbin (optional) | SDK before tool call | inline <20ms |
| Enforce | E2 Exec Guard | command policy module | shlex, pathlib, seccomp profiles | SDK/pre-exec hook | inline <30ms |
| Enforce | E3 Browser Guardrails | browser proxy shim | playwright, puppeteer compatibility layer | proxy | inline <45ms |
| Enforce | E4 Egress Proxy | network policy proxy | squid/Envoy, dnsmasq, eBPF optional | proxy | inline <25ms |
| Enforce | E5 Budget Circuit Breaker | rate controller | redis, rcache, token accounting | SDK + telemetry stream | inline <10ms |
| Enforce | E6 Step-Up | approval orchestration | redis, uuid, hmac | webhook + callback channel | async (decision queue) |
| Enforce | E7 Session Sandbox | orchestration service | docker, namespaces, cgroups | runtime hook + proxy | non-inline |
| Enforce | E8 Cross-session firewall | memory/control plane | redis namespace tags, ACL | SDK + storage guard | inline <20ms |
| Enforce | E9 Outbound Safety | send middleware | html-sanitizer, pydantic, rate limiter | SDK + proxy | inline <35ms |
| Vault | V1 Secrets Broker | secrets service | hvac, secretlib adapters, kms sdk | webhook/proxy | inline <20ms |
| Vault | V2 DLP middleware | stream processor | presidio, regex, spaCy-lite, numpy | proxy + webhook | inline <40ms |
| Vault | V3 Honeytokens | watcher daemon | watchdog, SIEM webhook adapters | background + webhook | non-inline |
| Vault | V4 Secure Memory/RAG Guard | index middleware | pgvector, weaviate/faiss, sentence-transformers | SDK + retrieval middleware | inline <30ms |
| Watch | W1 Signed Receipts | ledger service | cryptography, hash-chain DB, kafka | webhook/SDK interceptor | inline <20ms |
| Watch | W2 Assurance | scheduler+rules engine | croniter, pandas, pytest-bdd | background + reporting API | non-inline |

**Inline modules:** E1,E2,E3,E4,E5,E6,E8,E9,S3,S6,S8,S9,S10,V1,V2,V4,W1 should meet <50ms p95 in production path where marked inline.

---

## 4) Deployment options

### 4.1 SaaS
- Shared control plane with tenant-level data partitions
- Global edge gateways + regional policy nodes
- Default 99.9% uptime
- BYOK support and regional residency controls

### 4.2 Self-hosted (Docker / K8s Helm)
- Compose quick-start for teams up to 3k actions/day
- Helm for production multi-tenant deployments
- Air-gapped mode for sensitive environments
- Optional managed stateful services (Postgres, Redis, object storage)

### 4.3 Embedded SDK
- Python package (`amc-runtime`) first-party
- Optional TS bindings for gateway-side calls
- SDK-first integration for low-latency enforcement in agent loops
- Supports on-device / plugin-based agent frameworks

---

## 5) Data flow and visibility model

1. **Inbound event intake:** channel content or command enters Shield ingress.
2. **Pre-execution controls:** S8/S9/S10 and S1/S6 policy checks.
3. **Reasoning and action planning:** model emits tool plan.
4. **Runtime enforcement:** E1/E2/E3/E4/E5/E6/E7/E8/E9 gate each action.
5. **Credential mediation:** V1 injects scoped tokens; V2/V4 sanitize and filter.
6. **Execution:** tool APIs run in guarded context.
7. **Evidence capture:** every action writes to W1 hash-ledger and feeds W2.
8. **Assurance:** W2 aggregates risk, drift, compliance readiness, and reports.

**Who can see what:**
- Workspace admins: policy, module status, receipts summary.
- Admin+SecOps role: full W1/W2 logs (redacted views where required).
- Compliance role: audit exports, drift reports, attestation bundles.
- Engineering role: module health metrics, non-sensitive traces.

**Security of data at rest/in transit:**
- In transit: TLS 1.3 + mTLS between services
- At rest: AES-256 on DB/object stores, envelope encryption for sensitive fields
- Customer key option (BYOK/HSM integration) for enterprise mode
- PII and secret fields tokenized/redacted before non-privileged module access

---

## 6) Security of AMC itself (meta)

- Least-privilege service accounts + workload identity per microservice
- Signed container images + image provenance checks at deploy
- Continuous dependency scanning in CI (CVE + SLSA metadata)
- RBAC with separate planes:
  - control plane (policy)
  - execution plane (decision cache)
  - evidence plane (hash ledger)
- Quarterly internal red-team and tabletop incident tests
- Immutable audit trails for tenant policy changes
- Tamper resistance: W1 hash chain + notarized checkpoint snapshots

---

## 7) Performance requirements

### P99 latency budget per module (target)

- **Inline policy modules:** <50ms end-to-end
  - E1, S6, S8, S10, V1, V2, V4, W1, E2, E4, E9, E3 (where safe mode is used)
- **Budget policy/circuit modules:** <20ms
  - E5 and E8
- **Asynchronous/background modules:** <10s to first event for scans/assurance jobs
  - S1, S2, S3 signing sync, S4, S5, S7, W2, V3

### Throughput targets

| Deployment | Actions/hour | Notes |
|---|---:|---|
| SMB start | 50,000 | 2 replica workers with queue buffering |
| Mid-market | 250,000 | 4–6 replicas, Redis + pg connection pooling |
| Enterprise | 1,000,000+ | multi-az, autoscaling policy workers |

### Scaling constraints

- Decision cache TTL defaults to 5s for unchanged policy checks
- Queue backpressure when policy/assurance services exceed 85% p99
- Degradation modes: safe-mode defaults for unclear policy/evidence

---

## 8) Data model

### Database stack
- **SQLite**: local/dev only
- **PostgreSQL**: production default

### Core schema overview

- `tenants` (id, name, region, plan_tier, org_metadata)
- `agent_runtime_targets` (tenant_id, runtime_id, platform, sdk_version, status)
- `policies` (tenant_id, suite, module, policy_doc, version, effective_from, effective_to, signer)
- `policy_decisions` (request_id, module, decision, reason_code, latency_ms, context_json, created_at)
- `events_receipts` (event_id, tenant_id, session_id, tool_name, params_hash, outcome, risk_score, actor_id, signatures, prev_hash)
- `assurance_runs` (run_id, tenant_id, kind, status, started_at, completed_at, findings)
- `evidence_blobs` (tenant_id, artifact_type, location, pii_level, retention_ttl)
- `agent_secrets_jit` (agent_id, scope, token_ref, expires_at, usage_scope)
- `module_health` (tenant_id, module_id, heartbeat_at, health_score, p99_ms)

---

## 9) API and SDK

### External API
- **REST (FastAPI)** for control plane and audit plane:
  - `POST /score` (assessment ingest)
  - `POST /runtime/decision` (E1 policy decision)
  - `POST /runtime/receipts` (W1 write)
  - `GET /assurance/{tenant}`
  - `POST /intake/skill` (S1/S3/S4)
  - `GET /metrics`

### SDK (first-class)
- **Python SDK**:
  - `amc_sdk.guard.decide()`
  - `amc_sdk.guard.tool_call()`
  - `amc_sdk.vault.token()`
  - `amc_sdk.watch.emit_receipt()`
- **TypeScript SDK (next):** parity for JS/TS runtimes in phase 2/3

### SDK lifecycle
- v1: sync decision APIs
- v2: async webhooks + batch decision bundles
- v3: policy package caching and edge mode

---

## 10) Integration with agent runtime examples

### Recommended call chain
1. `sanitize_input()` → S8/S9/S10 checks
2. `score_and_plan()` → model call
3. `policy_firewall.check()` → E1
4. `secrets.inject()` → V1
5. `tool_guard.check_exec()` → E2/E3/E4
6. `budget.check()` → E5
7. `step_up.maybe_require_approval()` → E6
8. `execute_tool()`
9. `receipt.emit()` → W1
10. `assurance.ingest()` → W2 async

---

## Files created/updated
- `AMC_OS/ENGINEERING/TECH_ARCHITECTURE_v2.md`

## Acceptance checks
- Diagram includes all five suites and runtime path.
- Each module has explicit language/dependencies/integration/latency.
- Deployment options are documented for SaaS/self-hosted/SDK.
- Data flow + data visibility is explicit and auditable.
- Performance and database model include production expectations.

## Next actions
1. Convert this architecture into implementation runbooks and ADRs.
2. Add CI/CD and helm chart constraints in `TECH_STACK.md`.
3. Produce module-level OpenAPI and contract schemas.
4. Add load-test plan for inline-latency validation.
5. Add threat model matrix for each deployment option.

## Risks / unknowns
- Real-time latency may exceed 50ms in highly regulated multi-hop on-prem setups.
- Evidence hashing and event durability can become bottleneck without storage tuning.
- TS SDK parity may lag if ecosystem integration depends on it early.
