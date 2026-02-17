# Pairing, LAN Mode, and PWA

## LAN Mode
Studio binds to localhost by default. LAN mode enables controlled network access.

Commands:
- `amc studio lan enable --bind 0.0.0.0 --port 3212 --cidr 192.168.1.0/24`
- `amc studio lan disable`
- `amc pair create --ttl 10m`

LAN config is signed at `/.amc/studio/lan.yaml(.sig)`.

## Pairing
When LAN pairing is required:
1. Owner creates one-time code.
2. Client claims code via `POST /pair/claim`.
3. Pair cookie is set and then `/auth/login` is allowed.

Properties:
- single-use code
- expiry enforced
- no code in QR payload
- pairing events audited (`PAIR_CREATED`, `PAIR_CLAIMED`, `PAIR_EXPIRED`)

## PWA
Compass Console is installable and offline-capable:
- `src/console/assets/manifest.json`
- `src/console/assets/sw.js`

Cached content:
- static console assets
- last-known signed `/console/snapshot`

Not cached:
- secrets/tokens/leases/approval payloads.
