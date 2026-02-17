# AMC Docker Image

This directory contains the AMC Studio container entrypoint and Docker context rules.

## Build

```bash
docker build -t amc-studio:local .
```

## Run

```bash
docker run --rm -it \
  -p 3210:3210 -p 3211:3211 -p 3212:3212 \
  -e AMC_BOOTSTRAP=1 \
  -e AMC_BIND=0.0.0.0 \
  -e AMC_VAULT_PASSPHRASE_FILE=/run/secrets/amc_vault_passphrase \
  -e AMC_BOOTSTRAP_OWNER_USERNAME_FILE=/run/secrets/amc_owner_username \
  -e AMC_BOOTSTRAP_OWNER_PASSWORD_FILE=/run/secrets/amc_owner_password \
  -v amc_data:/data/amc \
  -v "$(pwd)/deploy/compose/secrets/amc_vault_passphrase.txt:/run/secrets/amc_vault_passphrase:ro" \
  -v "$(pwd)/deploy/compose/secrets/amc_owner_username.txt:/run/secrets/amc_owner_username:ro" \
  -v "$(pwd)/deploy/compose/secrets/amc_owner_password.txt:/run/secrets/amc_owner_password:ro" \
  amc-studio:local
```

The container launches:
- Studio API + Compass Console
- Gateway
- Proxy
- ToolHub

Healthcheck command:

```bash
node dist/cli.js studio healthcheck --workspace /data/amc
```
