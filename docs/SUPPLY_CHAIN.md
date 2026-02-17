# Supply Chain Guarantees

AMC release engineering produces signed, offline-verifiable release evidence.

## Artifacts

`amc release pack` includes:
- npm package tarball
- SBOM (`sbom.cdx.json`)
- dependency licenses (`licenses.json`)
- provenance record (`provenance.json`)
- strict secret scan (`secret-scan.json`)
- signed manifest (`manifest.json` + `manifest.sig`)

## What Is Guaranteed

- Artifact hashes are checked against the signed manifest.
- Manifest signatures are Ed25519 and verifiable offline.
- Secret scanning blocks HIGH-risk findings.
- Verification does not require network access.

## What Is Not Guaranteed

- This is not a legal attestation.
- Provenance is an AMC provenance record, not formal SLSA certification.
- License inventory is best-effort from installed dependencies and lockfile metadata.

## Commands

```bash
amc release sbom --out sbom.cdx.json
amc release licenses --out licenses.json
amc release provenance --out provenance.json
amc release pack --out dist/amc-<version>.amcrelease
amc release verify dist/amc-<version>.amcrelease
```
