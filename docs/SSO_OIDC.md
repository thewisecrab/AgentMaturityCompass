# SSO OIDC (Auth Code + PKCE)

AMC supports host-level OIDC login for multi-workspace deployments.

## Add an OIDC Provider

```bash
amc identity provider add oidc \
  --host-dir /path/to/amc-host \
  --id okta \
  --display-name "Okta" \
  --issuer https://your-issuer.example.com \
  --client-id your-client-id \
  --client-secret-file /secure/path/oidc-client-secret.txt \
  --redirect-uri https://amc.example.com/host/api/auth/oidc/okta/callback
```

Optional:

- `--scopes openid,email,profile,groups`
- `--use-well-known true|false`
- `--authorization-endpoint ...` (when discovery disabled)
- `--token-endpoint ...`
- `--jwks-uri ...`

## Login Flow

1. `GET /host/api/auth/oidc/:providerId/login`
2. AMC generates `state`, `nonce`, PKCE challenge.
3. Browser is redirected to IdP authorization endpoint.
4. Callback arrives at `/host/api/auth/oidc/:providerId/callback`.
5. AMC validates:
   - state and nonce
   - PKCE verifier
   - issuer/audience/exp
   - JWKS signature
6. AMC maps roles from signed `identity.roleMapping.rules`.
7. AMC creates host session cookie and redirects to `/host/console`.

## Security Notes

- PKCE is required.
- `alg=none` tokens are rejected.
- Role grants are never accepted directly from unmapped claim values.
- OIDC client secret is read from host vault via `clientSecretRef`.

## Redirect URI Guidance

Use the externally reachable HTTPS URL:

- `https://<your-amc-host>/host/api/auth/oidc/<providerId>/callback`

This must exactly match the IdP application configuration.

