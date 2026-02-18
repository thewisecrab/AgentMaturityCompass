# Release Runbook (Safer Shipping)

This runbook is the operator checklist for publishing AMC safely and repeatably.

Use it for every production release.

---

## 0) Preconditions

- Release PR merged to `main`
- CI green on `main` (`npm test`, `npm run build`)
- At least one approved changeset in `.changeset/`
- Release signing key available in CI (`AMC_RELEASE_SIGNING_KEY` or `AMC_RELEASE_SIGNING_KEY_FILE`)
- Rollback owner on-call and aware of release window

---

## 1) Local release readiness (before tagging)

```bash
npm ci
npm run typecheck
npm test
npm run build
npm run release:prepack-check
```

What this validates:
- npm tarball can be produced deterministically
- SBOM + license inventory generation works
- secret scan passes on packaged artifact
- `.amcrelease` can be packed and verified offline

---

## 2) Migration safety checkpoint

Before cutting a production tag, run the migration checklist in:

- [`docs/MIGRATION_RUNBOOK.md`](./MIGRATION_RUNBOOK.md)

At minimum:
- signed backup created and verified
- restore drill passes in an isolated path
- `amc verify all --json` baseline captured before rollout

---

## 3) Cut release

1. Confirm `package.json` version is final
2. Create and push tag:

```bash
git tag v<version>
git push origin v<version>
```

3. GitHub Actions `Release` workflow runs automatically

---

## 4) Post-release verification

Validate published assets:

- GitHub Release includes:
  - `*.amcrelease`
  - `sbom.cdx.json`
  - `licenses.json`
  - `provenance.json`
  - `release-verify.txt`
- npm package published successfully
- GHCR image published with expected tag

Offline verification:

```bash
amc release verify dist/amc-<version>.amcrelease
```

---

## 5) Rollback runbook (fail-safe)

Trigger rollback if any of the following happen:
- migration fails or produces integrity mismatch
- release verification fails
- production health checks fail repeatedly after deploy

Rollback sequence:

1. Stop new rollout
2. Re-deploy previous known-good image/tag
3. Restore latest verified backup if persistent-state migration was applied
4. Re-run:

```bash
amc verify all --json
amc retention verify
amc backup verify <backup-file>
```

5. Create incident note with:
- failed version
- rollback version
- root-cause hypothesis
- evidence hashes / report links

---

## 6) Release sign-off template

- Release: `vX.Y.Z`
- Operator:
- Migration owner:
- Backup artifact:
- Restore drill result: PASS / FAIL
- Post-release verify result: PASS / FAIL
- Rollback required: YES / NO
- Notes:
