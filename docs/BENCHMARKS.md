# BENCHMARKS

AMC `bench` artifacts are deterministic, signed, privacy-safe ecosystem checkpoints.

## What A `.amcbench` Contains

- `bench.json` with allowlisted numeric/categorical metrics only
- `bench.sig` signature envelope for offline verification
- signer public key
- transparency/merkle root snapshots and inclusion proofs
- strict PII/secret scan report (`checks/pii-scan.json`)
- deterministic build metadata

## What It Does NOT Contain

- raw prompts
- raw model responses
- transcripts/tool outputs
- secrets/tokens/keys
- free-form user text/PII

## Privacy Guarantees

- allowlist-only export model
- free-text export blocked
- optional scope anonymization and hashed IDs
- strict scanner blocks emails, URLs, file paths, key/token patterns

## Evidence + Proof Anchoring

Bench exports bind metrics to signed transparency + Merkle artifacts and inclusion proofs so claims are verifiable without exposing evidence payloads.

If proofs are unavailable, exports are still possible, but trust is downgraded and publishing gates can block distribution.

## CLI

```bash
amc bench init
amc bench verify-policy

amc bench create --scope workspace --out .amc/bench/exports/workspace/workspace/latest.amcbench
amc bench verify .amc/bench/exports/workspace/workspace/latest.amcbench
amc bench print .amc/bench/exports/workspace/workspace/latest.amcbench
```

## Publishing Governance

Publishing is dual-control:

1. Create publish request (requires explicit irreversible-sharing ack)
2. Satisfy approval quorum
3. Execute publish

```bash
amc bench publish request \
  --agent default \
  --file .amc/bench/exports/workspace/workspace/latest.amcbench \
  --registry ./bench-registry \
  --registry-key ./bench-registry/registry.key \
  --ack

amc bench publish execute --approval-request <apprreq_id>
```
