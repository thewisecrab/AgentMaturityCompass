# W3-11 Handoff — Passport Public Verification & Sharing

## Scope Delivered
- Added public passport API surface:
  - `GET /api/v1/passports` (paginated public registry)
  - `GET /api/v1/passport/:id` (public passport payload/share URL target)
  - `GET /api/v1/passport/:id/verify` (public verification endpoint)
  - `POST /api/v1/passport/:id/revoke` (admin-token protected revocation)
- Added passport expiry model:
  - Passports now carry `expiresTs` and expire after 90 days.
  - Verification fails closed for expired passports.
- Added passport revocation model:
  - Persistent revocation store at `.amc/passport/revocations.json`.
  - Verification fails closed for revoked passports.
- Added share support:
  - `amc passport share --agent <id> --format url|qr|json|pdf`
  - URL + verification URL + QR URL generation.
  - PDF share artifact generation.
- Added comparison support:
  - `amc passport compare <agent-id-1> <agent-id-2>`
  - Side-by-side overall + five-dimension maturity score output.

## Main File Changes
- API routing:
  - `src/api/passportRouter.ts` (new)
  - `src/api/index.ts`
  - `src/studio/studioServer.ts`
- Passport core:
  - `src/passport/passportConstants.ts` (new)
  - `src/passport/passportSchema.ts`
  - `src/passport/passportCollector.ts`
  - `src/passport/passportStore.ts`
  - `src/passport/passportVerifier.ts`
  - `src/passport/passportApi.ts`
  - `src/passport/passportCli.ts`
- CLI wiring:
  - `src/cli.ts`
- Tests:
  - `tests/passportPublicApiAndCli.test.ts` (new, 13 tests)

## Verification Run
- `npm run typecheck` ✅ pass
- `npx vitest run tests/passportPublicApiAndCli.test.ts tests/apiRouters.test.ts` ✅ pass (31 tests)
- `npm test` ❌ does not pass in this environment due large pre-existing suite failures/timeouts and `EPERM` socket binds unrelated to this change set.

## Notes
- Revoke endpoint auth is enforced via `x-amc-admin-token` match when API token is configured.
- QR output is generated as a shareable QR image URL that encodes the verification endpoint URL.
