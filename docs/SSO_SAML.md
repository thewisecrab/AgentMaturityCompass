# SSO SAML (SP in AMC)

AMC can operate as a SAML Service Provider at host scope.

## Add a SAML Provider

```bash
amc identity provider add saml \
  --host-dir /path/to/amc-host \
  --id azuread \
  --display-name "Azure AD SAML" \
  --entry-point https://idp.example.com/saml/login \
  --issuer https://idp.example.com/issuer \
  --idp-cert-file /secure/path/idp-cert.pem \
  --sp-entity-id https://amc.example.com/host/api/auth/saml/azuread/metadata \
  --acs-url https://amc.example.com/host/api/auth/saml/azuread/acs
```

## Metadata and Endpoints

- SP metadata:
  - `GET /host/api/auth/saml/:providerId/metadata`
- Login start:
  - `GET /host/api/auth/saml/:providerId/login`
- Assertion Consumer Service:
  - `POST /host/api/auth/saml/:providerId/acs`

## Validation Requirements

AMC validates:

- response/assertion signatures (based on provider config)
- audience and issuer expectations
- `InResponseTo` correlation
- clock skew window
- required identity attributes (email at minimum)

After validation, AMC maps groups/claims through signed role mapping rules and issues the host session cookie.

## Security Notes

- SAML trust material (`idpCertPem`) is stored in host vault.
- Role assignment is mapping-driven, not assertion-string-driven.
- If `identity.yaml` signature is invalid, SAML endpoints fail closed with `503`.

