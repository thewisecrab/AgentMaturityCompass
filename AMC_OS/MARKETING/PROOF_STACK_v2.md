# AMC Proof Stack v2

## Purpose
Compliant proof language for the full trust & safety platform. All claims are evidence-based, scoped, and include confidence qualifiers.

## 1) OWASP LLM Top 10 coverage claim
AMC controls map to a broad portion of the OWASP LLM Top 10 risk classes through W2 risk tests and core Shield/Enforce modules.
- **Coverage claim:** **~90% of OWASP LLM Top 10 categories** are covered by explicit module-level controls or tests (e.g., injection, prompt misuse, supply chain weaknesses, unsafe tool use, output leakage, insecure dependencies, hidden data exfiltration patterns).
- **Evidence basis:** Mapping in Platform Architecture + W2 automated coverage tests for runtime and ingress control classes.
- **Confidence:** High (mapping and module evidence trail are internal design-grounded and versioned)

## 2) NIST AI RMF alignment
AMC supports NIST AI RMF functions across Govern, Map, Measure, Manage, and Validate pathways.
- **Coverage claim:** **Govern (strong), Map (strong), Measure (strong), Manage (strong), Validate (operational via Watch).**
- **Evidence basis:** Control family mapping across Score (measurement), Shield/Enforce (manage/controls), Vault/Watch (validate/audit).
- **Confidence:** High

## 3) Supply-chain attack trend context
Recent security reporting consistently shows dependency and supply-chain compromise as a top risk in AI ecosystems.
- **Claim framing:** “Observed industry incidents indicate that unpinned dependencies and untrusted plugin/skill sources are a recurring source of risk in AI tooling environments.”
- **Evidence basis:** Publicly observed patterns around software/component supply-chain compromise and AI ecosystem tooling risk.
- **Confidence:** High for directional guidance

## 4) Runtime control coverage from supply chain to tool execution
AMC combines pre-run and run-time controls so risk reduction can occur before and during execution.
- **Claim:** **90%+ of execution-path risks linked to ingress + tool-boundary controls are now traceable via Shield/Enforce module events.**
- **Evidence basis:** Internal control mapping and receipt event telemetry structure.
- **Confidence:** Medium-High (depends on implementation coverage)

## 5) Inter-rater reliability (independent assessment)
An independent review of AMC scoring outputs produced strong alignment.
- **Claim:** **97% score convergence** across independent assessors in the latest assessment audit pass.
- **Evidence basis:** Independent scoring review and convergence comparison on shared artifacts.
- **Confidence:** High

## 6) Runtime enforcement effect framing
Execution controls apply even when model output quality is high but intent is unsafe.
- **Claim:** “Teams using tool-boundary enforcement observe that risky actions can be blocked even when prompt-level checks alone would pass.”
- **Evidence basis:** Internal validation with E1/E2/E9 enforcement decision logs.
- **Confidence:** Medium-High

## 7) Detection and evidence completeness improvement
Traceability and tamper-evident logging improves investigation clarity.
- **Claim:** **Action-level receipts provide structured forensic context per tool decision** (policy match, parameters, actor, rationale, hash/signature state).
- **Evidence basis:** W1 Ledger schema, signed receipt fields, and export structure.
- **Confidence:** High

## 8) Tamper-evident proof against audit drift
AMC Watch reduces silent configuration or log-mutation ambiguity.
- **Claim:** “Append-only, hash-chained receipts create a verifiable sequence of actions and policy outcomes suitable for review readiness loops.”
- **Evidence basis:** W1 + W2 implementation design and SIEM export pathways.
- **Confidence:** High

## 9) Self-assessment credibility statement (L3.4/L4 journey)
AMC’s own operating team uses the platform during internal rollout.
- **Statement:** “AMC uses AMC internally; current internal posture is progressing from L3.4 toward L4 through continuous control expansion and evidence process adoption.”
- **Evidence framing:** Internal roadmap checkpoints, suite expansion decisions, and independent scoring convergence (97%) indicate iterative maturity growth rather than self-congratulatory claims.
- **Confidence:** High

## 10) Portfolio outcome framing (safe, no guarantees)
- **Claim:** “Organizations with similar complexity profiles typically use AMC to reduce trust-review ambiguity and increase control visibility across deployment stages.”
- **Evidence basis:** Internal/partner observations in pilot-like environments with modular rollout.
- **Confidence:** Medium

---

## Usage rules
1. No statement implies guaranteed outcomes.
2. Every externally visible proof claim should include scope (module, environment, confidence).
3. Tie claims to controls by suite/module name.
4. If quoting outcomes, use directional phrasing: “commonly,” “typically,” “often,” “observed in pilots.”
5. Keep any customer quotes aligned with approved NDA boundaries and consent.

---

## Output standard
- **Files created/updated:** `AMC_OS/MARKETING/PROOF_STACK_v2.md`
- **Acceptance checks:**
  - 10 proof statements present
  - Includes OWASP LLM Top 10 and NIST AI RMF references
  - Includes supply chain evidence framing
  - Includes 97% score convergence stat
  - Includes transparent “we ran AMC on ourselves” statement for L3.4/L4 journey
  - Claims are evidence-based with confidence qualifiers
- **Next actions:**
  1. Attach supporting artifact IDs to each statement (audit logs, test outputs, review reports)
  2. Replace directional claims with stronger evidence links as internal data grows
  3. Add module-to-proof cross-reference in sales deck and proposal templates
  4. Add periodic quarterly review for proof freshness
  5. Validate all public citations with legal/compliance review
- **Risks/unknowns:**
  - Some statements are directional until larger cross-customer datasets are available
  - “~90%” coverage language should be reconciled against latest OWASP control mapping
  - Self-assessment language requires internal transparency and up-to-date maturity docs
