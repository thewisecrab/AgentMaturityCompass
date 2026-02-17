# Identity (Host Mode)

Enterprise identity is configured at the **host scope** so one AMC host can manage many workspaces safely.

## Files

- `<AMC_HOST_DIR>/identity/identity.yaml`
- `<AMC_HOST_DIR>/identity/identity.yaml.sig`

`identity.yaml` is always signature-verified before auth or SCIM routes run.

If signature verification fails:
- `/host/api/auth/*` returns `503` (`IDENTITY_CONFIG_UNTRUSTED`)
- `/host/scim/*` returns `503`
- Console should show an `IDENTITY CONFIG UNTRUSTED` banner

## Host Vault Secrets

Identity secrets are stored in the **host vault**, never plaintext config:

- `vault:identity/<providerId>/oidc/clientSecret`
- `vault:identity/<providerId>/saml/idpCertPem`
- `vault:scim/tokens/<tokenId>`

## Initialize and Verify

```bash
amc identity init --host-dir /path/to/amc-host
amc identity verify --host-dir /path/to/amc-host
```

## Local Auth vs SSO

`identity.localAuth` controls fallback username/password login:

- `enabled=true` and `passwordLoginEnabled=true`: local login available
- `enabled=false` or `passwordLoginEnabled=false`: local login disabled

To reduce lockout risk, keep at least one working auth path:
- at least one enabled OIDC/SAML provider, or
- local password login enabled for break-glass admin

## Role Mapping

SSO claims do not directly grant roles. AMC applies signed mapping rules from:

- `identity.roleMapping.rules`

This prevents claim-string privilege escalation and keeps role grants deterministic.

