# AMC Feature Prioritization v2 (25 Modules)

**Version:** 2.0  
**Date:** 2026-02-18  
**Scope:** Full platform feature set based on v2 architecture and customer pain patterns

---

## 1) Prioritization method

We use a weighted decision matrix:
- **Impact (I):** 1–5 (business and safety impact, based on customer pain severity)
- **Effort (E):** 1–5 (1=low, 5=high)
- **Revenue (R):** 1–5 (direct and expansion revenue potential)

**Priority score:** `(I × R × (6-E))`
- Higher is better.
- We also separately track **Tier Lift**:
  - Tier 1: improves Starter value
  - Tier 2: accelerates Growth expansion
  - Tier 3: drives Professional/Enterprise upsell

---

## 2) 25-module matrix

| Suite | Module | Pain impact | Build effort | Revenue value | Score | Revenue rationale | Build vs Buy | Priority |
|---|---|---:|---:|---:|---:|---|---:|---:|
| Score | Continuous Score Core | 5 | 5 | 5 | 25 | 2,099/mo pull only with starter adoption + retention | Build (core IP) | 25 |
| Shield | S1 Skill Static Analyzer | 5 | 3 | 5 | 40 | High-frequency risk reduction at ingest; strong Growth upsell | Buy/Build mix (build wrapper + OSS scanners) | 40 |
| Shield | S2 Behavioral Sandbox | 4 | 5 | 4 | 20 | Premium blocker for high-risk tool ecosystems; trust for Growth users | Build (platform-specific infra) | 20 |
| Shield | S3 Skill Signing & Identity | 4 | 4 | 5 | 30 | Enables trust chain and marketplace risk reduction | Build + external signing standards | 30 |
| Shield | S4 SBOM/CVE Watch | 4 | 4 | 3 | 24 | Improves security posture and enterprise credibility | Buy (existing OSS tools) + Build orchestration | 24 |
| Shield | S5 Reputation Graph | 3 | 5 | 3 | 24 | Medium impact, higher complexity; useful for larger ecosystems | Build (new data model + anti-abuse logic) | 15 |
| Shield | S6 Permission Manifest | 5 | 3 | 5 | 60 | Very high commercial impact; blocks privilege abuse with low lift | Build (policy schema + installer hooks) | 60 |
| Shield | S7 Private Registry | 4 | 4 | 4 | 32 | Enterprise workflow enablement and governance control | Build (strong platform fit) | 24 |
| Shield | S8 Channel Ingress Shield | 5 | 3 | 5 | 60 | Prevents upstream social-engineering vectors; frequent enterprise ask | Build | 60 |
| Shield | S9 Content Sanitization | 4 | 4 | 5 | 30 | Core reliability/security in mixed-trust environments | Build + model/rules stack | 24 |
| Shield | S10 Injection Detector | 5 | 3 | 5 | 75 | Immediate safety signal on every inbound interaction; top urgency for ops teams | Build (model + rules pipeline) | 75 |
| Enforce | E1 Tool Policy Firewall | 5 | 4 | 5 | 60 | Highest-value runtime control; strongest Professional driver | Build (policy engine) | 60 |
| Enforce | E2 Exec Guard | 4 | 3 | 4 | 40 | Prevents destructive command abuse with moderate engineering lift | Build | 40 |
| Enforce | E3 Browser Guardrails | 3 | 4 | 3 | 24 | Useful safety layer, lower urgency than E1/E2/E6 | Build | 24 |
| Enforce | E4 Network Egress Proxy | 4 | 4 | 4 | 32 | Strong for enterprise policy compliance, infra-heavy | Build | 32 |
| Enforce | E5 Budget Circuit Breaker | 4 | 3 | 3 | 48 | Very practical ops and cost control; lowers incident and spend overruns | Build (config + telemetry) | 48 |
| Enforce | E6 Step-Up Auth | 5 | 3 | 5 | 60 | Human-in-the-loop for high-risk actions; major trust differentiator | Build | 60 |
| Enforce | E7 Sandbox Orchestrator | 4 | 4 | 4 | 32 | Reduces lateral contamination risk | Build (runtime orchestration) | 32 |
| Enforce | E8 Cross-Session Firewall | 4 | 5 | 5 | 20 | High security value but infra-heavy and complex policy boundaries | Build | 20 |
| Enforce | E9 Outbound Safety | 4 | 3 | 4 | 40 | Good enterprise and compliance fit; blocks downstream leakage | Build | 40 |
| Vault | V1 Secrets Broker | 5 | 4 | 5 | 20 | Very high pain on security breaches; directly supports enterprise wins | Build + adapter integrations | 20 |
| Vault | V2 DLP Redaction | 5 | 3 | 5 | 60 | Fast perceived safety uplift; direct operational value | Build + proven NLP libraries | 60 |
| Vault | V3 Honeytokens | 3 | 4 | 3 | 24 | Good detection/forensics module; moderate urgency | Build | 18 |
| Vault | V4 Secure Memory & RAG Guard | 5 | 5 | 4 | 20 | Strong for data integrity at scale; heavier build lift | Build + retrieval stack | 20 |
| Watch | W1 Signed Receipts | 5 | 4 | 5 | 60 | Required for auditability and enterprise conversion | Build (core secret for trust) | 60 |
| Watch | W2 Continuous Assurance | 5 | 5 | 5 | 25 | High-margin enterprise module but longest path | Build (tests + reporting) | 25 |

> Legend: *Priority =* rough numeric index for sequencing, not a replacement for engineering planning.

---

## 3) Top 5 modules to ship first for maximum revenue pull

Based on impact, enterprise pull, and low-to-moderate effort:

1. **E1 Tool Policy Firewall** — unlocks Professional tier
2. **S6 Permission Manifest** — high prevention value, fast conversion
3. **S8 Channel Ingress Shield** — immediate security gap closure
4. **S10 Prompt Injection Detector** — urgent risk reduction, high perceived value
5. **V2 DLP Redaction** — broad value across security/compliance across all tiers

**Rationale:** these five together give a complete “minimum safe platform” for production and directly support Growth→Professional conversion.

---

## 4) Build vs Buy dependencies

| Module | Build/buy decision | Core dependencies | Build complexity note |
|---|---|---|---|
| S1 | Buy + Build | semgrep/bandit/scanners + wrapper | Build only policy interpretation layer |
| S2 | Build | container runtime, process tracing | High infra complexity; difficult to buy reliably |
| S3 | Build | crypto/signing libs, key mgmt | Build orchestration + revocation registry |
| S4 | Buy + Build | syft/trivy/CVE feeds + SBOM generator | Build for report harmonization |
| S5 | Build | graph DB + telemetry store | anti-gaming logic is proprietary |
| S6 | Build | manifest parser + installer hooks | Strong control over schema evolution |
| S7 | Build | registry + CI hooks + auth | Moderate integration complexity |
| S8 | Build | gateway middleware + anti-spam/rate rules | Critical for real-time performance |
| S9 | Build | content extraction + normalization + filtering | Domain-specific policy mapping required |
| S10 | Build | NLP/LLM-inference + rules | Need strict policy explainability |
| E1 | Build | OPA-like engine | Core platform logic, no viable off-the-shelf fit |
| E2 | Build | command parser + execution policy | Model-agnostic but runtime-specific |
| E3 | Buy + Build | browser automation tools | Guardrail mapping is custom |
| E4 | Buy + Build | proxy stack + policy config | Need low-latency path controls |
| E5 | Build | rate-limit engine + cost meter integration | Integration-dependent but high impact |
| E6 | Build | approval APIs + identity provider hooks | Critical workflow control |
| E7 | Build | container orchestration APIs | Safety-critical orchestration |
| E8 | Build | namespace isolation + data lineage | Complex policy enforcement boundaries |
| E9 | Build | outbound channel connectors | Requires channel-specific policy exceptions |
| V1 | Build + Buy integrations | secrets adapters (Vault, 1Password, etc.) | Broker logic is proprietary |
| V2 | Buy + Build | PII/regex/classifier libs | Build for policy and redaction receipts |
| V3 | Build | canary monitoring + webhook alerts | Novel and lightweight |
| V4 | Build | vector DB + retrieval controls | Retrieval-hardening logic proprietary |
| W1 | Build | signing crypto + hash-chain store | Core to AMC trust evidence |
| W2 | Build | scheduler + control tests + report engine | High compliance dependency |

---

## 5) Revenue per module (indicative)

Module-level estimate derives from incremental bundle pull and upsell probability. These are directional (USD/month equivalent where recurring) and should be used for sales planning.

- **Starter-level contributors**
  - Continuous Score + Continuous Score workflows: **$999/mo floor**

- **Growth-level contributors**
  - S1, S6, S8, S9, S10 typically enable +$300 each in migration pull versus starter-only configuration
  - S2/S3/S4/S5/S7 and V2 frequently increase gross ticket by **$50–$250/mo equivalent** within bundled pricing

- **Professional-level contributors**
  - E1, E2, E5, E6, E9 and E3/E4/E7/E8 drive the core Professional upgrade margin
  - Typical package uplift impact: **+$1,100/mo** above Growth at conversion time (consistent with +$800/mo net uplift in bundle)

- **Enterprise-level contributors**
  - W1/W2, V1/V2/V3/V4 are principal enterprise differentiators
  - Practical revenue attribution: **$5k–$50k/mo** based on agent scale and control density

- **OEM/Marketplace**
  - Per-active-agent fee (1–10/agent/mo) compounds with client footprint and is the dominant long-tail revenue stream after scale

---

## 6) Delivery sequencing recommendation (90-day v2 roadmap alignment)

- **Month 1-3:** S6, S8, S10, E1, V2, W1 (foundational safe execution path)
- **Month 4-6:** E6, E2, S1, S3, E5, S9
- **Month 7-9:** V1, W2 core, V4, E8, V3
- **Month 10-12:** remaining modules and SDK/OEM packaging + enterprise add-ons

---

## Files created/updated
- `AMC_OS/PRODUCT/FEATURE_PRIORITIZATION_v2.md`

## Acceptance checks
- All 25 modules are included with impact/effort/revenue and priority score.
- Top-5 first modules are explicitly justified by revenue pull.
- Build vs buy matrix calls out core dependencies per module.
- Revenue estimates are directionally consistent with `PRICING_MODEL_v2.md` tiers.

## Next actions
1. Add module-level cost-of-delivery estimates and margin model.
2. Validate prioritization with REV_COO_ORCH and engineering capacity planning.
3. Convert matrix into sprint backlog with dependencies and owners.
4. Add quarterly review cycle to recalculate impact once first 10 design partners run.
5. Add explicit risk ranking for modules with highest false-positive profile.

## Risks / unknowns
- Some modules have very high effort and lower short-term ROI before scale.
- False-positive sensitivity can alter commercial acceptance, especially in S10/S9.
- Revenue attribution by module is not yet fully attributable in mixed bundles.
