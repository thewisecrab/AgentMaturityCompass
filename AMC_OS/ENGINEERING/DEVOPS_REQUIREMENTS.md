# DEVOPS REQUIREMENTS — AMC LAUNCH (Services-First, Bootstrap-Friendly)

**Owner:** REV_DEVOPS_ENGINEER + REV_TECH_LEAD  
**Date:** 2026-02-18  
**Lever:** C — Delivery-Readiness

## 1) Assumptions (explicit)
- AMC launch is **services-first** (consulting workflow delivery), not a SaaS platform.
- We need to run 1–2 sprints reliably this month with minimal engineering overhead.
- Team size at day 1: **1 engineer + 1 operator** max.
- Existing brand/site may already exist; if not, use temporary branded subdomain.
- Client data is mostly non-public operational evidence (risk of C2/C3 data acknowledged).

## 2) Hosting / infrastructure recommendation (pragmatic + cheap)

### Recommended stack for v1 (no-code to light-code)
Use **Google Workspace + Notion + GitHub + Vercel + Supabase** as a pragmatic stack:

- **Intake / portal static artifacts:** Tally/Google Forms + Notion pages (no infra)
- **Core repo and automations:** GitHub (code, templates, CLI)
- **Production hosting for automation endpoints (Phase 1):** Vercel (Hobby/Starter)
- **Data + auth + storage (Phase 1+):** Supabase
- **Evidence storage (Phase 0 immediate):** Google Drive (existing workspace or free trial)

### Why this is pragmatic
- Lowest operational burden (managed services).
- No server fleet, no Docker/K8s burden day 1.
- Good enough security posture for client delivery with guardrails.
- Easy to migrate later to own VPC if volume grows.

### Day-1 minimum stack (services-first)
1. **DNS/domain:** existing domain via Cloudflare/Route 53 + HTTPS enabled.
2. **Email/IDs:** business Google account; shared aliases only as needed.
3. **Drive/Notion workspace:** client intake and sprint pages.
4. **GitHub repo:** protected branch + required PR checks.
5. **Vercel project:** connected to GitHub, auto-deploy from `main`.
6. **Supabase project (optional day 1 if phase-1 automation starts):** Postgres/Auth/Storage on free tier.

## 3) CI/CD basics (day 1, actually necessary only)

For v0/day-1, avoid “enterprise” pipelines. Set up this:

### Required
- **GitHub repo with branch protection** (`main`):
  - require PR for deployable changes
  - required checks: formatting + tests (if any) + build.
- **GitHub Actions** lightweight pipeline:
  - `pnpm install`
  - lint/typecheck
  - test
  - build
  - generate artifacts (scorebook/report outputs) into `dist/` and publish to Vercel on merge.
- **Environment management**:
  - `.env.example` checked in
  - provider secrets stored in GitHub/Vercel secrets (not files)
- **Deployment model**:
  - Vercel auto-deploy `main` + manual redeploy for emergency.
  - fallback: downloadable manual report path if deploy fails.

### Optional (Phase 1) once usage starts
- Container or CLI smoke-run in CI.
- Basic dependency update workflow (`pnpm` update weekly).
- Backups job for any exported reports/snapshots to backup location.

### One-person day-1 implementation sequence
- Set up GitHub repo/protection in ~45 min.
- Add GH Actions config in ~45 min.
- Connect Vercel and verify staging/prod deploy in ~30 min.
- Add deploy secrets and one manual deployment test in ~30 min.

## 4) Security minimums for handling client data

Use these non-negotiable controls before first client intake.

### Encryption at rest
- **Cloud apps:** rely on provider encryption (Drive/Notion/Supabase/Vercel).
- **Local machines:** full-disk encryption enabled (FileVault/BitLocker) for any client file access.
- **Backups/downloads:** avoid unencrypted local copies of raw evidence for >24h.

### Encryption in transit
- Force HTTPS/TLS on all web endpoints (Vercel default).
- Use signed links/short-lived auth tokens for any file or signed URLs.
- Use provider-native secure links for storage; never send raw credentials in email.

### Access controls
- **Identity:** enforce MFA on all admin/user accounts with data access.
- **Least privilege:** named, per-client access lists; avoid team-wide shared accounts.
- **Permissions model:** restricted sharing only; no public links for C2/C3 data.
- **Service accounts:** if used, limit to specific roles + token rotation monthly.
- **Audit trail:** log who accessed what folder/repo/env variable around sprint windows.

### Data retention and lifecycle
- Define per artifact policy at sprint start:
  - raw evidence: keep short period (e.g., 60–90 days unless client requests extension)
  - scoring/roadmap artifacts: retained for follow-up baseline (e.g., 12 months)
  - credentials/PII/keys: delete immediately after use or per legal requirement
- Add deletion reminders in sprint close checklist.
- Archive final readout in client-approved location and remove internal working copies.

### Operational minimums
- Separate client folders per project (no mixed tenant data).
- Signed NDA + data-use confirmation before access.
- Incident response rulebook (if breach/suspected access): lock accounts, rotate secrets, notify security/legal immediately, log event.

## 5) Monitoring essentials (what breaks + how you know)

### What breaks first in a one-person services workflow
1. Intake form stops accepting submissions.
2. Evidence upload folder permission changed (client no longer can upload).
3. Webhook/connector to scoring fails.
4. CLI/report generation fails due to schema drift.
5. Portal auth breaks or client loses access.
6. Expiry of free-tier limits (Drive/hosting/request quotas).

### What to monitor in practice
- **Health checks** (daily):
  - last intake submission timestamp
  - evidence upload folder write test
  - scoring script run status
  - portal login smoke test (if active)
- **Error monitoring**:
  - GitHub Actions failures (build/deploy)
  - webhook errors / 4xx-5xx endpoints
  - generation job failures and missing report artifacts
- **Ops visibility**:
  - one dashboard (Notion/Sheet) with: service, owner, last seen, red/amber/green.
  - Slack/Email alert if any item is red for >4h (can be a manual reminder at first).

### Day-1 tooling to support this
- GitHub Actions failure notifications (email/Slack).
- UptimeRobot/Pingdom free checks for production portal.
- Notion/Sheet runbook with triage playbook + escalation contact.

## 6) Bootstrap playbook (single-person, one day)

| Step | Outcome | Duration |
|---|---|---:|
| 1. Set up repo + protected branches + CI | safe deploy baseline | 1.0 hr |
| 2. Create intake + evidence folder templates + permissions | zero-touch onboarding | 1.0 hr |
| 3. Configure Vercel auto-deploy and envs | stable artifact hosting | 1.0 hr |
| 4. Set MFA + access list + shared secret policy | compliance baseline | 0.5 hr |
| 5. Add monitoring checks + contact escalation | early incident awareness | 0.5 hr |

**Total:** 4–5 hours setup + 30–60 min test/rehearsal.

## 7) Risk register (delivery-ready)

- **Platform dependency risk**: If one SaaS breaks, create fallback manual path (email intake/Google Slides manual output).
- **Free-tier limit risk**: budget alert + migration trigger when usage crosses 80%.
- **Data-privacy risk**: keep tool count low and document data flows by component.
- **Single-operator risk**: pre-authored runbook + runbook checkboxes prevent missed steps.

## Files Created/Updated
- `AMC_OS/ENGINEERING/DEVOPS_REQUIREMENTS.md` (created)
- `AMC_OS/INBOX/REV_DEVOPS_ENGINEER.md` (created)

## Acceptance Checks
- [ ] A reviewer can initialize the v1 stack in one business day with no prior infra context.
- [ ] Critical client workflows (intake, evidence, scoring run, report generation) have a defined owner and health signal.
- [ ] Encryption/access/retention minimums are explicitly listed and mapped to a launch checklist.
- [ ] CI/CD includes at least build/test + deploy with branch protection.
- [ ] Monitoring identifies at least 6 common failure classes before sprint day 1.

## Next Actions
1. Implement this exact CI/CD + monitoring baseline in GitHub Actions and Vercel before first live pilot.
2. Add environment policy file `AMC_OS/OPS/SECURITY_CHECKLIST.md` references in onboarding SOP.
3. Add a one-page runbook for emergency manual fallback (no automation required).
4. Run one end-to-end dry run: intake -> score -> report draft -> client share.
5. Request peer review by `REV_TECH_LEAD`.

## Risks/Unknowns
- If Google Workspace is not already provisioned, onboarding cost/time increases by 1 day.
- Regional data-handling requirements may impose additional legal controls (EU/CA clients).
- Supabase/Vercel free-tier pricing or quotas may change; budget for paid tiers before sprint volume grows.
