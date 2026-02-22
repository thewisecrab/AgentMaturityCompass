# W2-4 Handoff — RAG Maturity Scoring

## Scope Completed
Implemented production RAG maturity scoring in `/tmp/amc-wave2/agent-4` covering:

1. Retrieval quality scoring using precision/recall/F1 from labeled retrieved-vs-relevant chunks.
2. Metadata quality scoring for chunk attribution/source completeness.
3. Retrieval drift detection over time (improving/stable/degrading/insufficient data).
4. Hallucination risk scoring for RAG outputs (unsupported claims, citation coverage, contradictions, confidence behavior).
5. Citation integrity scoring (accuracy, verifiability, source validity).
6. New diagnostic questions:
   - `AMC-RAG-1` Retrieval Quality
   - `AMC-RAG-2` Metadata Attribution Quality
   - `AMC-RAG-3` Retrieval Drift Monitoring
   - `AMC-RAG-4` Hallucination & Citation Integrity

## Key File Changes
- RAG scoring implementation:
  - `src/score/ragMaturity.ts`
  - `src/score/index.ts` (exports for new RAG diagnostics/types)
- Diagnostic question bank:
  - `src/diagnostic/questionBank.ts`
- Canon/bank/mechanic schema count alignment for expanded question bank:
  - `src/canon/canonBuiltin.ts`
  - `src/canon/canonSchema.ts`
  - `src/diagnostic/bank/bankSchema.ts`
  - `src/diagnostic/bank/bankV1.ts`
  - `src/mechanic/mechanicSchema.ts`
- Tests:
  - `tests/ragMaturity.test.ts` (12 tests)
  - `tests/questionBank.test.ts` (updated counts + AMC-RAG presence test)

## Verification
Executed:

- `npm test -- tests/ragMaturity.test.ts tests/questionBank.test.ts`
  - Passed: `2` files, `16` tests total.

Attempted:

- `npm run typecheck`
  - Fails due pre-existing duplicate variable declarations in `src/cli.ts`:
    - `src/cli.ts(2592,7): Cannot redeclare block-scoped variable 'evidence'.`
    - `src/cli.ts(2601,7): Cannot redeclare block-scoped variable 'evidence'.`
  - This is unrelated to RAG scoring changes and was not modified in this task.

## Notes
- Question bank grew from 87 to 91 total questions.
- Layer distribution updated from `13/18/20/16/20` to `13/18/20/16/24`.
- Canon and diagnostic bank schemas were updated accordingly to avoid validation mismatches.
