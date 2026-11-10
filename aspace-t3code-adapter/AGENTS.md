# AGENTS

## Purpose

`aspace-t3code-adapter/` owns the A'Space contract for the t3code
fork (`Amdkn/t3code`, pinned commit `dc72705`, version 0.1.7).
It is the only A'Space code in the fork: upstream files are byte-identical
(D-N048 H-M2).

## Ownership

This scope owns:

- `contract.json`: pinned commit, CLI surface, telemetry switches
- `smoke_test.mjs`: 6 `node:test` checks (contract pins, `--version`,
  `--help`, `help`, `doctor --help`, `--help` inside `unshare -n`)
- `README.md`: how to run the contract

## Local Contracts

- Talk-only commands only (`--help`, `--version`, `help`,
  `doctor --help`). Never start the server (bare `t3`, `up`, `start`,
  `serve`, `connect`, `update`, `install`, `service`).
- Telemetry forced off: `T3CODE_TELEMETRY_ENABLED=false` plus
  `T3CODE_POSTHOG_KEY` / `T3CODE_POSTHOG_HOST` emptied.
- State in a scratch `T3CODE_HOME` — never the live `~/.t3` userdata.

## Work Guidance

- Keep the adapter lean: contract + smoke test + docs, no runtime code.
- Any change to the pinned commit requires a design amendment (D5),
  never a silent fast-forward.

## Verification

```sh
pnpm --filter t3 run build:bundle   # from the repo root, once
node --test aspace-t3code-adapter/smoke_test.mjs
```

## Child DOX Index

- (none — no subfolders)

## DOX note

The root `AGENTS.md` (upstream) was intentionally left unchanged:
D-N048 H-M2 requires the upstream tree byte-identical except this
directory. This file is the local contract for the adapter boundary.
