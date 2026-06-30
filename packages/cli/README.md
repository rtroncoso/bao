# @bao/cli

TypeScript CLI for Bao asset tooling: map conversion, world database seeding, audio import, and S3 deploy.

## Install (monorepo)

From the repo root after `pnpm install`:

```bash
npx bao                  # help
npx bao convert maps --maps 34
npx bao convert audio --all
npx bao seed
npx bao seed apply
npx bao deploy --environment staging
```

Root scripts (`pnpm db:seed`, `pnpm convert:maps`, `pnpm convert:audio`, etc.) invoke this package via the `bao` bin.

## Global install (future)

When published to npm:

```bash
npm install -g @bao/cli
bao --help
```

**Note:** `@bao/core` must be published and installed as a dependency before the CLI works outside this monorepo. Until then, use the workspace setup above.

## Prerequisites

| Command | External tools |
|---------|----------------|
| `convert audio` | `fluidsynth`, `ffmpeg` (optional `BAO_SOUND_FONT`) |
| `seed apply` | MySQL (`MYSQL_*` in repo root `.env`) |
| `deploy` | AWS S3 credentials (`AWS_S3_*` or `BAO_S3_*`) |

## Path defaults

When run from the bao monorepo, the CLI defaults to [`packages/assets/public`](../assets/public) and [`packages/assets/seeds`](../assets/seeds). Legacy AO 13.0 inputs use `legacy/` subfolders:

| Default path | Purpose |
|--------------|---------|
| `public/maps/legacy/` | Map conversion input (`--input`) |
| `public/audio/legacy/` | Audio conversion input (`--source`) |
| `public/dats/legacy/` | Dat seed input (`--dats`) |

Outside the monorepo, the same layout is expected under `./public`. Override any path with `--public`, `--input`, `--source`, `--dats`, `--output`, etc.

Step-by-step conversion instructions (where to copy AO 13.0 files, what each command produces): [`packages/assets/README.md`](../assets/README.md).

## Development

```bash
pnpm --filter @bao/cli build
pnpm --filter @bao/cli test
pnpm --filter @bao/cli dev   # tsx watch
```

Requires `@bao/core` to be built first (`pnpm --filter @bao/core build`).

## Static assets

Game assets (`public/`, dev server on `:8787`) live in [`@bao/assets`](../assets/README.md), not in this package.
