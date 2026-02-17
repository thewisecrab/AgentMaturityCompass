# Operations Runbook

## Upgrade Procedure

1. Pull new image/tag.
2. Keep workspace volume mounted (`/data/amc`).
3. Roll deployment.
4. Verify:
   - `amc studio healthcheck --workspace /data/amc`
   - `amc doctor --json`
   - transparency + merkle verification.

## Runtime Retention

- Studio applies log retention using `AMC_DATA_RETENTION_DAYS` (default 30).
- Old files under `.amc/studio/logs/` beyond the threshold are pruned on startup.

## Vault Passphrase Rotation

Use owner mode and rotate monitor key/passphrase workflow:

```bash
amc vault rotate-keys
```

If running in containers, update mounted secret file and restart.

## Backup / Restore (Manual)

Backup:
- Stop writes (maintenance window).
- Snapshot volume containing `/data/amc`.
- Keep backup encrypted at rest.

Restore:
1. Restore `/data/amc` volume.
2. Start Studio.
3. Run integrity checks:
   - `amc verify`
   - `amc transparency verify`
   - `amc transparency merkle root`

## Disaster Recovery

- Primary recovery artifact is persistent workspace volume.
- After restore, verify all signatures, transparency chain, and merkle root before resuming EXECUTE paths.
- If verification fails, keep system in read-only diagnosis mode and re-sign only through owner controls.
