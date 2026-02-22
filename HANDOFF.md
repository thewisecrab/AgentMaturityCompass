# FIX-4 Handoff: Incidents Integration

## What was wired

### 1) Public exports (`src/index.ts`)
Added incidents subsystem exports so incidents are reachable from package root:
- `IncidentStore` namespace (store API)
- `IncidentModel` namespace (incident types/model)
- `IncidentGraph`
- `IncidentTimeline`
- auto-assembly exports (`IncidentAutoAssembly`, plus `assembleFrom*` and `autoDetectAndAssemble`)
- direct incident store/type exports (`createIncidentStore`, `computeIncidentHash`, `verifyIncidentSignature`, `Incident*` types)

### 2) CLI command group (`src/cli.ts`)
Added top-level `incident` group with requested commands:
- `amc incident list [--status open|closed] [--limit N] [--agent <id>]`
- `amc incident show <id>`
- `amc incident create --title "..." --severity low|medium|high|critical [--agent <id>]`
- `amc incident link <incident-id> --evidence <evidence-id>`
- `amc incident close <id> --resolution "..."`

Implementation notes:
- Uses ledger-backed SQLite via `openLedger(...).db` + `createIncidentStore`.
- Handles append-only behavior by recording transitions/causal-edge links rather than mutating existing incident rows.
- `list --status` derives open/closed state from latest transition.

### 3) API routes (`src/api/incidentRouter.ts`, `src/api/index.ts`)
Added incidents router and dispatcher wiring:
- `GET /api/v1/incidents`
  - query: `agent`, `status=open|closed`, `limit`
- `POST /api/v1/incidents`
  - body: `{ agentId?, title, description?, severity, triggerType?, triggerId? }`
- `GET /api/v1/incidents/:id`
- `PATCH /api/v1/incidents/:id`
  - supports state/resolution transition and/or evidence linking via `evidenceId`

### 4) Tests (15 new tests)
Added direct incident subsystem coverage:
- `tests/incidentsStore.test.ts` (8 tests)
  - store init/CRUD retrieval/filtering
  - transitions and causal edge ordering
  - hash determinism and signature verification
- `tests/incidentsApiRoutes.test.ts` (7 tests)
  - list/create/show/patch(close)/patch(link)/filtered list
  - dispatcher integration via `handleApiRoute`

## Commands executed

### Focused incident tests (pass)
- `npm run typecheck` ✅
- `npm test -- tests/incidentsStore.test.ts tests/incidentsApiRoutes.test.ts --reporter=verbose` ✅

### Requested full-suite command
Attempted exact command:
- `npm test -- --reporter=verbose 2>&1 | tail -30`

In this sandbox it did not stream lines reliably from the direct pipeline, so a bounded log-capture fallback was run to obtain the final tail output.

Tail output captured:
```
× tests/enterpriseSsoScim.test.ts > enterprise identity (OIDC/SAML/SCIM) > OIDC rejects bad state, bad nonce/signature, and missing email 40300ms
  → Test timed out in 40000ms.
If this is a long-running test, pass a timeout value as the last argument or configure it globally with "testTimeout".
× tests/consoleApprovalsWhatifBenchmarks.test.ts > console + approvals + what-if + benchmarks > LAN pairing requires one-time code before login and code is single-use 20391ms
  → Test timed out in 20000ms.
If this is a long-running test, pass a timeout value as the last argument or configure it globally with "testTimeout".
✓ tests/consoleApprovalsWhatifBenchmarks.test.ts > console + approvals + what-if + benchmarks > transparency log records issuance events and detects tampering 638ms
✓ tests/consoleApprovalsWhatifBenchmarks.test.ts > console + approvals + what-if + benchmarks > policy pack diff is deterministic and apply writes signed configs
× tests/multiWorkspaceHostMode.test.ts > multi-workspace host mode > workspace readiness fails independently while host readiness remains available 30441ms
  → Test timed out in 30000ms.
If this is a long-running test, pass a timeout value as the last argument or configure it globally with "testTimeout".
× tests/consoleApprovalsWhatifBenchmarks.test.ts > console + approvals + what-if + benchmarks > console pages are served and contain no external CDN references 20171ms
  → Test timed out in 20000ms.
If this is a long-running test, pass a timeout value as the last argument or configure it globally with "testTimeout".
× tests/enterpriseSsoScim.test.ts > enterprise identity (OIDC/SAML/SCIM) > SAML ACS path verifies signed compact assertion and grants mapped roles 40231ms
  → Test timed out in 40000ms.
If this is a long-running test, pass a timeout value as the last argument or configure it globally with "testTimeout".
× tests/multiWorkspaceHostMode.test.ts > multi-workspace host mode > host and workspace console paths serve and workspace HTML avoids absolute /console links 30367ms
  → Test timed out in 30000ms.
If this is a long-running test, pass a timeout value as the last argument or configure it globally with "testTimeout".
✓ tests/multiWorkspaceHostMode.test.ts > multi-workspace host mode > host migrate imports single-workspace repo into host mode and preserves signatures
× tests/enterpriseSsoScim.test.ts > enterprise identity (OIDC/SAML/SCIM) > SCIM users/groups provisioning applies and revokes workspace memberships by group source 40140ms
  → Test timed out in 40000ms.
If this is a long-running test, pass a timeout value as the last argument or configure it globally with "testTimeout".
× tests/multiWorkspaceHostMode.test.ts > multi-workspace host mode > lease-auth agents cannot access host endpoints 30308ms
  → Test timed out in 30000ms.
If this is a long-running test, pass a timeout value as the last argument or configure it globally with "testTimeout".
× tests/enterpriseSsoScim.test.ts > enterprise identity (OIDC/SAML/SCIM) > lease-auth cannot call host identity/scim endpoints and users without membership cannot access workspace routes 40250ms
  → Test timed out in 40000ms.
If this is a long-running test, pass a timeout value as the last argument or configure it globally with "testTimeout".
```

## Commit status
Could not create commit in this sandbox because git metadata is mounted outside writable roots:
- `fatal: Unable to create '/Users/sid/AgentMaturityCompass/.git/worktrees/agent-4/index.lock': Operation not permitted`

All code changes are present in the working tree and ready to commit once git write access is available.
