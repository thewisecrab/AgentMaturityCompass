# SCIM 2.0 Provisioning

AMC exposes host-level SCIM endpoints for enterprise user/group provisioning.

Base path (from signed identity config):

- `/host/scim/v2`

## Create SCIM Token

```bash
amc scim token create \
  --host-dir /path/to/amc-host \
  --name okta-scim \
  --out /secure/path/amc-scim-token.txt
```

AMC prints the token once. Store it in your IdP securely.

AMC stores only token references/hashes in host vault; never plaintext in config files.

## Supported SCIM Endpoints

- `GET /host/scim/v2/ServiceProviderConfig`
- `GET /host/scim/v2/ResourceTypes`
- `GET /host/scim/v2/Schemas`
- `GET|POST /host/scim/v2/Users`
- `GET|PATCH|PUT|DELETE /host/scim/v2/Users/:id`
- `GET|POST /host/scim/v2/Groups`
- `GET|PATCH|PUT|DELETE /host/scim/v2/Groups/:id`

## Group-to-Role Mapping Strategy

SCIM groups do not grant privileges automatically. Grants are derived through signed mapping rules in `identity.yaml`:

```yaml
identity:
  roleMapping:
    rules:
      - match:
          groupsAny: ["amc-ws-default-owner"]
        grant:
          workspaceId: "default"
          roles: ["OWNER","AUDITOR"]
```

This makes role assignment deterministic and auditable.

## Membership Provenance and Safe Revocation

AMC tracks role source provenance (`SCIM_GROUP`, `SSO_GROUP`, `MANUAL`).

When a user is removed from a SCIM group, AMC revokes only roles sourced from that group, preserving manual grants.

## Security Notes

- SCIM uses bearer token auth only.
- Lease-auth agent traffic is blocked from `/host/scim/*`.
- SCIM writes are audited (`SCIM_USER_*`, `SCIM_GROUP_*`, `SCIM_MEMBERSHIP_CHANGED`).
- Rate limits apply and can return `429`.

