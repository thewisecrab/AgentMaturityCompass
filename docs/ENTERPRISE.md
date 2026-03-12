# ENTERPRISE.md — AMC for enterprise and regulated teams

## Who this is for
- Platform teams deploying AI agents at scale
- Regulated organizations (financial services, healthcare, government)
- Security teams responsible for AI governance
- Compliance leads mapping to EU AI Act, ISO 42001, NIST AI RMF

## What enterprise AMC includes

### Full product stack
All eight canonical AMC products:
- **Score** — evidence-weighted trust diagnostics
- **Shield** — 86 adversarial assurance packs
- **Enforce** — policy controls, approval workflows, scoped actions
- **Vault** — Ed25519 signatures, Merkle chains, HSM/TPM support
- **Watch** — traces, anomalies, dashboards, Prometheus metrics
- **Fleet** — multi-agent oversight, comparison, delegation graphs
- **Passport** — portable agent credentials (.amcpass)
- **Comply** — EU AI Act, ISO 42001, NIST AI RMF, SOC 2, OWASP mapping

### Deployment options
| Option | Best for |
|---|---|
| Self-hosted | Teams that need internal control |
| Managed/hosted | Teams that want reduced operational overhead |
| On-premises | Regulated environments with data residency requirements |
| Hybrid | Mixed deployment with cloud scoring + on-prem evidence storage |

### Enterprise support
- Implementation and onboarding assistance
- Governance and compliance advisory
- Policy pack development
- Custom domain pack creation
- Priority support channels
- SLA expectations (response time, uptime)

### Security posture
- No data leaves your environment in self-hosted/on-prem deployments
- Ed25519 cryptographic signing for all evidence
- Tamper-evident ledger with Merkle tree verification
- SBOM generation for supply chain transparency

## How to engage
1. Start with the free open-source tier to evaluate AMC
2. Review `docs/PRODUCT_EDITIONS.md` for edition comparison
3. Review `docs/PRICING.md` for pricing architecture
4. Contact for enterprise packaging and deployment discussion

## Read next
- `docs/PRODUCT_EDITIONS.md`
- `docs/PRICING.md`
- `docs/DEPLOYMENT_OPTIONS.md`
- `docs/SERVICES_AND_SUPPORT.md`
- `docs/BUYER_PACKAGES.md`
