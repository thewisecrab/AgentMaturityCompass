# Single-binary install (experimental Node SEA)

AMC now includes an **experimental** single-binary packaging path using **Node SEA (Single Executable Applications)**.

This is the honest version, not brochure cosplay:
- it builds a host-specific binary on the machine/runner that creates it
- it is **not** cross-compiling macOS/Linux/Windows from one host
- native/runtime behavior still depends on AMC's real Node ecosystem constraints
- it should be treated as a convenience distribution path, not yet the default install method

## What it is good for
- local demos
- internal distribution on a known host platform
- release artifacts for users who want `./amc` instead of `node dist/cli.js`

## What it does not promise yet
- universal static binaries
- zero-dependency guarantees across every OS image
- replacement for npm as the primary install path

## Build locally

Prerequisites:
- Node version with SEA support (the repo currently builds with modern Node)
- `npm ci`
- `npm run build`
- `npx postject` available (the build script will invoke it via `npx --yes postject`)

```bash
npm run build
npm run build:sea
```

Output:
- binary: `dist/sea/amc` (or `dist/sea/amc.exe` on Windows)
- metadata: `dist/sea/manifest.json`
- SEA blob: `dist/sea/amc-prep.blob`

## Smoke test

Planned verification flow:

```bash
./dist/sea/amc doctor --json
./dist/sea/amc quickscore --json || true
```

Use `AMC_VAULT_PASSPHRASE` when needed for commands that initialize workspace state.

### Current verification status
- blob generation: verified
- binary injection: verified
- fallback to official Node release binary when local Node lacks SEA fuse: verified
- runtime execution on the current macOS arm64 host: **not yet green** (current binary exits during startup on this host)

So today this is a real packaging path with partial verification, not a fully proven default install route.

## CI / release direction

The release workflow can build **host-specific SEA artifacts** on matching runners and upload them as release assets. That is the intended MVP path.

## Why SEA instead of pretending pkg is done?

Because SEA is part of the modern Node runtime story and is honest about what it is. `pkg` may still be useful later, but AMC now has a real, inspectable single-binary path wired into the repo.

Files created/updated: `scripts/build-sea.mjs`
Acceptance checks: `npm run build:sea` creates `dist/sea/*` and `./dist/sea/amc doctor --json` runs on the same host
Next actions:
- add per-OS release assets in `release.yml`
- add Windows runner verification if release demand warrants it
- evaluate startup size/perf tradeoffs before making SEA the primary install path
Risks/unknowns:
- SEA behavior may vary by Node release
- binary is host-specific, not universal
- native dependency/runtime edge cases still need wider matrix coverage
