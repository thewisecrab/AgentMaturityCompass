# VAULT

AMC stores signing private keys encrypted at rest in a local vault.

Vault files:
- `.amc/vault.amcvault`
- `.amc/vault.amcvault.meta.json`

Private keys are not kept in plaintext key files.

## Commands

```bash
amc vault init
amc vault unlock
amc vault lock
amc vault status
amc vault rotate-keys
```

If vault is locked, signing commands fail with an actionable error.

## CI / Non-interactive

Set passphrase via environment variable:

```bash
export AMC_VAULT_PASSPHRASE='<passphrase>'
```

AMC never writes the passphrase to disk and never prints it.

## Rotation

`amc vault rotate-keys` rotates monitor signing key and updates public-key history so old artifacts remain verifiable.
