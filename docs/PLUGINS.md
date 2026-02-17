# Plugins

AMC plugins are **content-only** extension bundles. They do not run code.

## Security Model

- Package format: `.amcplug` (deterministic tar.gz).
- Each package includes:
  - `manifest.json`
  - `manifest.sig` (publisher Ed25519 signature)
  - `publisher.pub`
  - `content/...` assets
- Install path is guarded by:
  - registry signature verification
  - package hash verification
  - publisher allowlist checks
  - dual-control approvals (`SECURITY` action class)
- Installed state is locked in signed `.amc/plugins/installed.lock.json`.
- Startup integrity check is fail-closed:
  - tampering marks plugin integrity broken
  - `/readyz` returns `503`
  - certificate issuance is blocked

## Supported Asset Types

Plugins may add declarative assets only:

- policy packs
- assurance packs
- compliance maps
- adapters
- outcome templates
- casebook templates
- transform overlays / intervention libraries
- learn markdown content

No scripts, binaries, or runtime code execution is allowed.

## Commands

```bash
amc plugin keygen --out-dir ./keys
amc plugin pack --in ./my-plugin --key ./keys/publisher.key --out ./dist/my.amcplug
amc plugin verify ./dist/my.amcplug
amc plugin print ./dist/my.amcplug
```

Workspace operations:

```bash
amc plugin init
amc plugin workspace-verify
amc plugin list
```

Install lifecycle (dual control):

```bash
amc plugin install --registry local amc.plugin.example@1.0.0
amc approvals list --agent default --status pending
amc approvals approve --agent default <approvalRequestId> --mode execute --reason "owner approval"
# second approver required for SECURITY by default
amc plugin execute --approval-request <approvalRequestId>
```

## Console

Compass Console includes `/console/plugins` for:

- installed plugin status + integrity
- registry browsing
- install / upgrade / remove request flows
- approval-linked execution
