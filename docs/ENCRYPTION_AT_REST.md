# Encryption At Rest

AMC encrypts large evidence payloads in the blob store with AES-256-GCM using vault-managed keys.

## Blob Store
- Directory: `.amc/blobs/`
- Encrypted payload files: `.amc/blobs/<blobId>.blob`
- Signed index:
  - `.amc/blobs/index.jsonl`
  - `.amc/blobs/index.jsonl.sig`

## Key Management
- Blob keys are stored in vault secrets: `vault.secrets.blobKeys.<version>`
- Commands:
  - `amc blobs key init`
  - `amc blobs key rotate`
  - `amc blobs reencrypt --from <n> --to <n> --limit <n>`
  - `amc blobs verify`

## What Is Encrypted
- Redacted payload bodies that are persisted as blobs:
  - runtime stdout/stderr chunks
  - larger audit/review payloads
  - feedback/comment blobs
  - large ingest payload snapshots

## What Is Not Encrypted
- Public verification metadata and signatures in ledger/index rows
- Hashes (`payload_sha256`, event hashes, receipt hashes)
- Signed config files

## Safety Rules
- Vault must be unlocked for encrypted blob writes.
- If encryption is required by policy and vault is locked, AMC refuses blob writes instead of silently downgrading.
- Blob tampering is detected by AES-GCM auth and payload hash checks.

