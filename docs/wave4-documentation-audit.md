# Wave 4 Documentation Audit (Agent 18)

Date: 2026-02-22

## Scope
Public-facing documentation audited against implementation:
- `README.md`
- `docs/*.md`
- question artifacts (`docs/AMC_QUESTIONS_IN_DEPTH.md`, `docs/AMC_QUESTION_BANK_FULL.json`)
- API/runtime sources under `src/`

## Method
- Compared documented routes/commands to:
  - `src/studio/studioServer.ts`
  - `src/api/index.ts` + `src/api/*.ts`
  - `src/bridge/bridgeServer.ts` + `src/bridge/bridgeModelRouter.ts`
  - `src/cli.ts`
- Compared question-bank docs to:
  - `src/diagnostic/questionBank.ts`
  - `src/workspace.ts`
- Onboarding smoke attempt:
  - `/usr/bin/time -p npm ci` (failed in this environment)
  - Failure details: Node `v25.5.0` + `better-sqlite3` native build/install failure

## Executive Summary
Documentation quality is broad but inconsistent. The highest-risk drifts were in question-bank cardinality, API contract clarity, and onboarding reliability assumptions. Architecture docs are mostly accurate at module level. Three critical runbooks were added.

## Findings (Severity Ordered)

### Critical
1. Question-bank documentation is fragmented across three incompatible realities.
- Implementation: `89` active questions (`src/diagnostic/questionBank.ts`).
- Legacy artifacts: `42` entries in `docs/AMC_QUESTIONS_IN_DEPTH.md` and `docs/AMC_QUESTION_BANK_FULL.json`.
- Multiple docs still reference `67` or `42` as current.
- Impact: assessor inconsistency, disputed scoring expectations, and invalid maturity planning.

2. Quickstart implementation path still hard-checks `67` questions.
- `src/workspace.ts:610` throws if bank count is not `67`.
- Live bank is `89`.
- Impact: onboarding can fail even when docs are corrected.

3. API contract drift remains significant for machine-readable docs.
- Runtime control plane serves a large non-versioned surface in `src/studio/studioServer.ts` (roughly 194 method+path handlers) plus `/api/v1/*` router endpoints.
- `src/studio/openapi.ts` still models `/api/*` paths and cookie name `amc-session`, while runtime uses `/api/v1/*` and `amc_session`.
- Impact: generated clients and integrator assumptions can break.

### High
4. API docs were previously incomplete/inaccurate and are now partially remediated.
- Corrected redirect mapping and added endpoint/parameter/error coverage in `docs/API_SURFACES.md`.
- Remaining gap: full Studio control-plane endpoint-by-endpoint reference is still not documented.

5. Host-mode enterprise onboarding examples had invalid CLI flags.
- `docs/ENTERPRISE.md` now corrected to current host CLI (`--dir`, `--to-host`, `--workspace-id`, explicit bootstrap env vars).
- Impact before fix: copy/paste failures in enterprise setup.

6. No explicit runbooks existed for three high-probability incidents.
- Added in this wave:
  - `docs/runbooks/amc-service-down.md`
  - `docs/runbooks/score-dispute.md`
  - `docs/runbooks/evidence-corruption.md`

### Medium
7. Operational documentation covers backup/upgrade, but scaling guidance remains thin.
- Present: backup/restore, migration, release/ops runbooks.
- Missing: threshold-driven scale runbook (saturation signals, trigger points, scale actions, rollback criteria).

8. Architecture map is mostly aligned with source layout.
- `docs/ARCHITECTURE_MAP.md` broadly matches module boundaries.
- Gap is completeness depth (especially runtime route inventory), not major structural mismatch.

## Task-by-Task Outcome
1. Audit docs vs implementation: Completed; critical drifts documented.
2. Architecture vs code: Mostly aligned; no major structural lies found.
3. Missing runbooks (down/dispute/corruption): Confirmed missing; added.
4. API docs completeness/accuracy: Improved in this wave; still incomplete for full Studio control plane and OpenAPI generation.
5. Operational docs (scale/backup/upgrade): backup/upgrade documented; scaling runbook still missing.
6. 67+ questions assessor context: Not sufficient; live 89-question bank exceeds in-depth doc coverage.
7. Onboarding under 30 minutes: Not reliably true across Node versions; this environment failed `npm ci` on Node 25.

## Remediations Completed in This Wave
- Core documentation corrections:
  - `README.md`
  - `docs/API_SURFACES.md`
  - `docs/DIAGNOSTIC_BANK.md`
  - `docs/QUESTION_BANK.md`
  - `docs/EVIDENCE_TRUST.md`
  - `docs/QUICKSTART.md`
  - `docs/SOLO_USER.md`
  - `docs/AMC_MASTER_REFERENCE.md`
  - `docs/ENTERPRISE.md`
  - `docs/INSTALL.md`
  - `docs/LAUNCH.md`
  - `docs/BRIDGE.md`
  - `docs/CONSOLE.md`
  - `docs/STUDIO.md`
  - `docs/AMC_QUESTIONS_IN_DEPTH.md` (header/source note only)
- Added incident runbooks:
  - `docs/runbooks/amc-service-down.md`
  - `docs/runbooks/score-dispute.md`
  - `docs/runbooks/evidence-corruption.md`

## Recommended Next Actions
1. Regenerate full assessor docs for all 89 active question IDs (replace legacy 42-question artifacts).
2. Fix quickstart hard-check in `src/workspace.ts` (`expected 67`) to use current bank cardinality.
3. Align or replace `src/studio/openapi.ts` with live runtime routes and auth semantics.
4. Add a dedicated scaling operations runbook with measurable trigger thresholds.
