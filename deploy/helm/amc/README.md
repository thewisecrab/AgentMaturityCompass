# AMC Helm Chart

## Render

```bash
helm template amc ./deploy/helm/amc
```

## Lint

```bash
helm lint ./deploy/helm/amc
```

## Install

```bash
helm install amc ./deploy/helm/amc \
  --set image.repository=ghcr.io/your-org/amc-studio \
  --set image.tag=latest
```

## Example values

Render internal-only deployment:

```bash
helm template amc ./deploy/helm/amc -f ./deploy/helm/amc/examples/values-internal-only.yaml
```

Render ingress + TLS deployment:

```bash
helm template amc ./deploy/helm/amc -f ./deploy/helm/amc/examples/values-ingress-tls.yaml
```

Render persistent bootstrap deployment:

```bash
helm template amc ./deploy/helm/amc -f ./deploy/helm/amc/examples/values-persistent-bootstrap.yaml
```

## Features

- Non-root runtime (`runAsUser: 10001`)
- Read-only root filesystem
- Persistent workspace PVC (`/data/amc`)
- Bootstrap from Kubernetes Secret values
- Readiness/liveness probes (`/readyz`, `/healthz`)
- TLS ingress support
- NetworkPolicy with ingress-controller-only ingress and DNS/upstream egress controls
- PDB + ServiceAccount templates
