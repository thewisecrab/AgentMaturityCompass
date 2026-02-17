# RBAC

AMC Studio enforces local-first role-based access control using signed `/.amc/users.yaml`.

## Roles
- `OWNER`: full control; can unlock vault, sign configs, issue certs, lift freezes.
- `AUDITOR`: verify/attest; can co-sign approvals where policy requires it.
- `APPROVER`: approve/deny execution intents; cannot mutate signed policy/targets.
- `OPERATOR`: run diagnostics/assurance/exports; no signing unless also `OWNER`.
- `VIEWER`: read-only reports/console.
- `AGENT`: read-only self-check and lease-scoped endpoints only.

## Security Model
- Passwords are stored as salted scrypt hashes in `/.amc/users.yaml`.
- `/.amc/users.yaml` is signed (`/.amc/users.yaml.sig`) by auditor key.
- If users signature is invalid, Studio enters read-only protection for write endpoints.
- Console authentication uses `POST /auth/login` and HttpOnly `amc_session` cookie.
- Admin bootstrap token remains available for CLI/emergency operations.

## Commands
- `amc user init`
- `amc user add --username <name> --role <ROLE>`
- `amc user list`
- `amc user revoke <username>`
- `amc user role set <username> --roles OWNER,APPROVER`
- `amc user verify`
