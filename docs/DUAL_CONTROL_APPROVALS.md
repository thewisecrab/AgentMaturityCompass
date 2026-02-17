# Dual-Control Approvals

AMC supports approval quorum chains for high-impact actions.

## Core Flow
1. ToolHub creates `approvalRequestId` on guarded intent.
2. Approvers submit signed decisions.
3. Quorum engine evaluates role eligibility, distinct-user rules, and TTL.
4. ToolHub executes only when quorum is `QUORUM_MET`.
5. Approval is consumed single-shot and replay attempts are denied.

## Policy
Configured in signed `/.amc/approval-policy.yaml`.

Example high-impact posture:
- `WRITE_HIGH`: `requiredApprovals: 2`, `requireDistinctUsers: true`
- `DEPLOY`: `requiredApprovals: 2`, `requireDistinctUsers: true`
- `SECURITY`: `requiredApprovals: 2`, roles constrained to `OWNER|AUDITOR`

## Binding Hashes
Approval requests bind execution context:
- `intentHash`
- `workOrderHash`
- `policyHash`, `toolsHash`, `budgetsHash`
- lease constraints hash

This prevents replay under modified governance state.

## Audit Events
- `APPROVAL_REQUEST_CREATED`
- `APPROVAL_DECISION_RECORDED`
- `APPROVAL_QUORUM_MET`
- `APPROVAL_CONSUMED`
- `APPROVAL_QUORUM_FAILED`
- `APPROVAL_REPLAY_ATTEMPTED`
