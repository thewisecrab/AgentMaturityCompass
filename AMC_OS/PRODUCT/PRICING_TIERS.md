# AMC Pricing Tiers — Self-Serve + Enterprise
**Philosophy:** Nominal pricing to cover costs and fund growth. The real revenue engine is Compass Sprints ($5k) and retainers — SaaS is the acquisition funnel.
**Date:** 2026-02-18

---

## Tier Overview

| | Free | Pro | Power | Enterprise |
|---|---|---|---|---|
| **Price** | $0 | $19/mo | $49/mo | $299+/mo (call) |
| **Assessments/mo** | 1 | 5 | Unlimited | Unlimited |
| **Dimensions scored** | 3 of 7 | All 7 | All 7 | All 7 + custom |
| **Evidence review** | Self-reported | Self-reported | Self-reported + AI-assisted | Expert-verified |
| **Trend tracking** | ❌ | Last 3 runs | Unlimited history | Unlimited + org rollup |
| **Runtimes** | 1 | 2 | All | All + custom |
| **API access** | ❌ | ❌ | ✅ | ✅ |
| **Team seats** | 1 | 1 | 3 | Unlimited |
| **Export** | PDF (basic) | PDF (full) | PDF + JSON | PDF + JSON + audit pack |
| **Support** | Community | Email | Priority email | Dedicated CSM |
| **Compass Sprint CTA** | ✅ | ✅ | ✅ | Custom SOW |

---

## Free — $0/mo
**Purpose:** Viral acquisition. Get teams to self-score, share their badge, bring us leads.

**What you get:**
- 1 assessment per month
- 3 dimensions only (Governance, Security, Reliability — the ones with most enterprise anxiety)
- Basic maturity score: L1-L4 overall
- Top 3 gaps identified (not the full roadmap)
- Shareable score badge ("My agent scored L2 on AMC. See yours →")
- Community benchmark ("You're in the top 40% on Security")
- Email delivery of results

**What you don't get:**
- All 7 dimensions
- Recommendations roadmap
- Trend tracking
- Any integrations
- Evidence guidance

**Monetization:** None directly. Feeds Pro/Sprint conversions. Data insights (anonymized, aggregate) long-term.

---

## Pro — $19/mo (or $190/yr, save 2 months)
**Purpose:** Individual practitioners, solo AI leads, small teams running 1-3 agents.

**What you get:**
- Everything in Free
- 5 assessments/month
- All 7 dimensions scored
- Full gap analysis + top 5 recommended actions per dimension
- Last 3 assessment history + trend line
- 2 runtime integrations (OpenClaw, Claude, OpenAI, LangChain etc.)
- PDF export (full scorecard)
- Email support (48h response)

**Cost math:**
- Fixed infra per user: ~$2/mo
- Variable (AI scoring): ~$1-3/assessment × 5 = ~$5-15/mo
- Total cost per user: ~$7-17/mo
- Gross margin: ~10-55% (scales as infrastructure amortizes)

---

## Power User — $49/mo (or $490/yr, save 2 months)
**Purpose:** Engineering leads, AI PMs, CTOs at orgs with multiple agents in production.

**What you get:**
- Everything in Pro
- Unlimited assessments
- Unlimited assessment history + trend analytics
- API access (programmatic scoring, webhook results)
- All runtime integrations
- 3 team seats (share results, collaborate on gaps)
- Full JSON export + audit trail
- Priority email support (24h response)
- Early access to new dimensions + features

**Cost math:**
- Fixed infra per user: ~$3/mo
- Variable (unlimited assessments, avg 10/mo): ~$10-30/mo
- Total cost: ~$13-33/mo
- Gross margin: ~33-73%

---

## Enterprise — from $299/mo (sales call required)
**Purpose:** Orgs running agent programs at scale, regulated industries, teams needing audit-ready evidence.

**What you get:**
- Everything in Power
- Unlimited seats
- Custom maturity dimensions (add org-specific controls)
- Organization-level rollup dashboard (score across all your agents)
- Audit-ready evidence pack export (for compliance, due diligence, board reporting)
- White-label option (agencies: brand it as your own)
- SLA: 4h response, 99.9% uptime commitment
- Dedicated Customer Success Manager
- Custom onboarding + training
- Quarterly executive maturity review
- On-prem/VPC deployment option (top tier)

**Pricing bands:**
- $299/mo: up to 10 seats, 3 agents tracked
- $699/mo: up to 25 seats, 10 agents tracked
- $999/mo: up to 50 seats, unlimited agents
- Custom: 50+ seats, white-label, on-prem

---

## Compass Sprint Add-On — $5,000 (one-time)
Available to all tiers. Expert-guided 5-day sprint to implement your AMC roadmap.

**Upgrade path:** Free → trial → Pro → Sprint → Retainer

---

## Trial Policy
- **Free trial of Pro**: 7 days, no credit card required
- Full Pro access for 7 days
- Day 7: score summary email + upgrade CTA + option to downgrade to Free
- No auto-charge without explicit consent

---

## Cost Infrastructure (Monthly Fixed)
| Item | Cost |
|---|---|
| Hosting (Vercel Pro) | $20/mo |
| Database (Supabase Pro) | $25/mo |
| Email (Resend) | $20/mo |
| Monitoring (basic) | $0-20/mo |
| Domain + misc | $5/mo |
| **Total fixed** | **~$70-90/mo** |

**Break-even:** ~5 Pro users or ~2 Power users covers all fixed costs.  
**Sustainable at scale:** 100 Pro users = $1,900/mo revenue, ~$200/mo variable costs = $1,700/mo profit from SaaS alone (before Sprints).

---

## Competitive Positioning
- **vs. DIY spreadsheet**: $0 extra, structured, benchmarked, faster
- **vs. consulting firms charging $50k for governance audits**: $19/mo self-serve, same framework
- **vs. generic AI risk tools**: Purpose-built for AI agents specifically, not general GRC

**Positioning statement:** "The most affordable way to know if your AI agent is actually production-ready."

---

*Files: AMC_OS/PRODUCT/PRICING_TIERS.md*
*Next: build questionnaire, trial email sequence, go live*
