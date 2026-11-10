# aspace-t3code-adapter

A'Space contract for the t3code fork (`Amdkn/t3code`, pinned commit `dc72705`, version 0.1.7). It is the only A'Space code in the fork: upstream files are byte-identical (D-N048 H-M2).

## What it exposes

Talk-only commands against the built `t3` CLI (`apps/server/dist/bin.mjs`):

- `t3 --version` → `0.1.7`
- `t3 --help` / `t3 help`
- `t3 doctor --help` (prints the doctor help; `doctor --help` needs a pre-existing database, so the smoke uses `--help`)

## What it never does

- Never runs bare `t3` (starts the WebSocket server), `t3 up`, `t3 start`, `t3 serve`, `t3 connect`, `t3 update`, `t3 install`, `t3 service`, or `t3 __service-launcher`.
- Never launches a dev server.

## Telemetry — forced off

Upstream PostHog is **ON by default** with a hardcoded key (`apps/server/src/telemetry/AnalyticsService.ts`, host `https://ingest.t3.codes`). The adapter forces:

- `T3CODE_TELEMETRY_ENABLED=false` (gates `record` and `sendBatch` entirely)
- `T3CODE_POSTHOG_KEY=""` and `T3CODE_POSTHOG_HOST=""` (defense in depth)

State lives in a scratch `T3CODE_HOME`, never the live `~/.t3` userdata. Full audit: `t3code-TELEMETRY-AUDIT.md` (V5 domicile, FKB00).

## Run the smoke test

```sh
# Build the CLI once (from the repo root):
pnpm --filter t3 run build:bundle
# Then:
node --test aspace-t3code-adapter/smoke_test.mjs
```

6 checks: contract pins, `--version`, `--help`, `help`, `doctor --help`, `--help` inside `unshare -n` (when available).
