# W3-5 Handoff — Eval Interop Importers

## Scope Completed
Implemented production-quality eval import interoperability to convert external evaluator outputs into signed AMC evidence:

1. Upgraded Wave 2 eval importers with framework-specific AMC mappings:
   - LangSmith: eval-score signal mapping to concrete AMC QIDs.
   - DeepEval: metric-to-QID mapping + confidence calibration evidence.
   - Promptfoo: red-team mapping to OWASP LLM Top 10 AMC questions (`AMC-5.8` .. `AMC-5.17`).
   - OpenAI Evals: pass/fail mapping to behavioral-contract AMC questions (centered on `AMC-BCON-1`).
2. Added new adapters/importers:
   - Weights & Biases (`wandb`) run results -> AMC performance evidence.
   - Langfuse (`langfuse`) traces -> AMC observability evidence.
3. Hardened evidence emission:
   - Per-case `test` evidence now includes mapped `questionIds`.
   - Added per-question `metric` evidence (`metricKey=external_eval_score`).
   - Added failure `audit` evidence (`auditType=EXTERNAL_EVAL_FAILURE`).
   - Added DeepEval calibration metrics (`metricKey=confidence_calibration_error`).
   - Default trust tier now derives from framework policy (`ATTESTED` unless overridden).
4. Added unified eval coverage dashboard API + CLI:
   - New status aggregator computes imported coverage per AMC dimension.
   - New command: `amc eval status`.
   - New command: `amc eval import` (formats now include `wandb` and `langfuse`).

## Key File Changes
- `src/eval/evalImporters.ts`
  - Extended `EvalImportFormat` with `wandb`, `langfuse`.
  - Added framework-specific mapping engines.
  - Added `parseWandbEvalResults`, `parseLangfuseEvalResults`.
  - Added richer signed evidence writes during import.
  - Added `evalImportCoverageStatus()` and related status types.
- `src/eval/evalCli.ts`
  - Added new formats to parser.
  - Added `evalStatusCli()`.
- `src/cli.ts`
  - Added `eval` command group with:
    - `amc eval import`
    - `amc eval status`
- `src/index.ts`
  - Exported new importer/status functions and types.
- `tests/evalImportersInterop.test.ts`
  - Added 18 tests covering mappings, new adapters, evidence writes, and status dashboard.

## Verification
Executed successfully:

- `npm test -- tests/evalImportersInterop.test.ts`
  - Passed: `18` tests.
- `npm test -- tests/releaseBundlesArchetypesGate.test.ts`
  - Passed: `5` tests.

Executed but not fully passing due existing environment-bound failures unrelated to eval importer changes:

- `npm test`
  - Many pre-existing test timeouts and `listen EPERM` socket-binding failures in network/server-heavy suites.
  - Eval interop suite itself passed inside full run (`tests/evalImportersInterop.test.ts` passed).

## Notes
- Source strategy references read and applied:
  - `SIGNAL3_COMPETITOR_ANALYSIS.md`
  - `SIGNAL5_100X_MASTER_PLAN.md` (IMP-04/IMP-06 interop context)
- Existing CLI file still contains legacy duplicated command declarations in unrelated areas; untouched here except eval command additions.
