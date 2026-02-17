# Hardware-Backed Trust

AMC supports a hardened signing boundary through **AMC Notary**. In Notary mode, critical signatures are produced by a separate process and verified offline with pinned public keys.

## Why this exists

The main risk is not only bad model output, but compromised signing trust:
- an evaluated agent trying to forge “official” artifacts
- a compromised Studio process trying to rewrite history
- key exfiltration from the app process

Notary reduces this by moving signing away from Studio and enforcing a fail-closed trust policy.

## Threat model

### Protected against
- Agent-side tampering of signed artifacts.
- Studio-side signing bypass when `trust.mode=NOTARY` is enforced.
- Silent key substitution via pinned Notary fingerprint checks.
- Replay/unauthorized signing attempts (HMAC-authenticated Notary API + signed Notary log).

### Not fully protected against
- Full host compromise of both Studio and Notary plus vault/passphrase compromise.
- Hardware vendor trust failures when using external signer integrations.

## Attestation levels

AMC emits a signed Notary attestation and classifies it as:
- `SOFTWARE`: file-sealed key backend or software-controlled signer.
- `HARDWARE`: external signer reports hardware claims (`HSM|TPM|KMS|SMARTCARD|ENCLAVE|OTHER`) and signatures verify.

`HARDWARE` is stronger operational evidence, but not an absolute security guarantee by itself.

## Fail-closed behavior

When `trust.mode=NOTARY` and required checks fail (Notary unavailable, fingerprint mismatch, insufficient attestation level), AMC:
- returns `503` on `/readyz`
- blocks critical issuance/signing flows (certs, bundles, release manifests, lock/signature artifacts)
- logs and surfaces explicit trust failure reasons

## Verification model

All critical artifacts remain offline-verifiable through:
- signature envelope (`alg`, `pubkey`, `fingerprint`, `sig`)
- Notary trust pinning (`trust.yaml`)
- transparency + Merkle updates tied to issuance events

This strengthens physical/virtual trust bridging for risk assurance and continuous renewal.
