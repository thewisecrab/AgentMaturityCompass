# Plugin Supply Chain Security

AMC plugin delivery is designed to prevent untrusted extension code paths.

## Non-Executable Plugins

- Plugins are declarative content only.
- No JS/Python/shell execution is loaded from plugins.
- Plugin assets are schema-validated before use.

## Verification Chain

1. Registry index signature (`index.sig`) is verified against pinned registry pubkey fingerprint.
2. Package SHA-256 from registry is verified against downloaded `.amcplug`.
3. Plugin manifest signature is verified against `publisher.pub`.
4. Publisher fingerprint is checked against registry/workspace allowlist.
5. Installed set is tracked in signed `installed.lock.json`.
6. Startup integrity re-verifies installed lock and package signatures.

If any step fails, plugin install/load is refused or workspace readiness fails closed.

## Transparency + Merkle

Install/upgrade/remove actions append transparency entries and update Merkle roots.

Artifact types logged:

- `PLUGIN_INSTALLED`
- `PLUGIN_UPGRADED`
- `PLUGIN_REMOVED`

These entries are offline-verifiable with the existing transparency tooling.

## Dual-Control Requirement

Plugin mutations are `SECURITY` actions:

- approval request is created
- quorum must be met (default requires distinct OWNER + AUDITOR for SECURITY)
- only then is plugin execution allowed

This prevents agents (and single compromised users) from introducing unapproved plugin changes.
