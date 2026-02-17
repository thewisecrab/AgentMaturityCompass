# Evidence Requests

Evidence Requests provide controlled auditor-to-owner disclosure without exposing raw prompts, raw tool I/O, secrets, or PII.

## Workflow

1. Auditor creates a request for specific hashed artifacts/proofs/controls.
2. Owner starts approval flow (GOVERNANCE/SECURITY policy path).
3. Dual-control quorum is satisfied.
4. Owner/operator fulfills request by exporting a restricted `.amcaudit` binder.

Agents (lease-auth) are blocked from this workflow.

## Requested Item Types

- `CONTROL:<controlId>`
- `PROOF:<proofId>`
- `ARTIFACT_HASH:<id>@<sha256>`

## Commands

```bash
amc audit request create --scope workspace --items control:ACCESS_CONTROL.SSO_SCIM
amc audit request list
amc audit request approve <requestId> --reason "approved"
amc audit request fulfill <requestId> --out ./request-export.amcaudit
```

## Security Properties

- requests are signed and transparently logged
- approval decisions are bound to intent hashes
- fulfillment is verified against executable approvals
- outputs remain privacy-safe and evidence-bound

This keeps audit disclosure deterministic, tamper-evident, and aligned with continuous recurrence operations.
