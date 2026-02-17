# Ops Hardening

AMC ships a signed operations policy that controls retention, encryption-at-rest, backups, and maintenance.

## Policy
- File: `.amc/ops-policy.yaml`
- Signature: `.amc/ops-policy.yaml.sig`
- Commands:
  - `amc ops init`
  - `amc ops verify`
  - `amc ops print`

If the ops policy signature is invalid, retention/backup/maintenance flows fail closed and Studio `/readyz` returns `503`.

## Retention Model
- Commands:
  - `amc retention status`
  - `amc retention run --dry-run`
  - `amc retention run`
  - `amc retention verify`
- AMC never deletes ledger rows. It archives event payload history into signed segments and prunes payload fields with tombstones.
- Hash-chain integrity remains verifiable after archival/prune.

## Archive Segments
- Path: `.amc/archive/ledger/`
- Each segment has:
  - `segment_*.jsonl.gz`
  - `segment_*.manifest.json`
  - `segment_*.manifest.sig`
- `amc retention verify` checks segment signatures, segment hashes, and chain continuity.

## Why Rows Aren’t Deleted
- Evidence rows are hash-chained and signed.
- Deleting rows would break deterministic continuity and invalidate anti-tamper guarantees.
- AMC prunes payload columns only, while preserving event hashes and verification metadata.

