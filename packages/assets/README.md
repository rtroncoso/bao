# @bao/assets

Asset tooling for the Bao monorepo — map conversion, world database seeding, and S3 deploy.

## CLI

From the **repo root** (after `pnpm install`):

```bash
npx bao                  # help (same output as below)
npx bao help
npx bao convert maps --maps 34
npx bao seed
npx bao seed apply
```

```
┌──────────────────────────────────────────────────────────────────┐
│  bao — Bao monorepo asset tooling                                │
└──────────────────────────────────────────────────────────────────┘

Usage:
  npx bao                         Show this help
  bao <command> [subcommand] [options]

Commands:
  seed                 Generate idempotent world seed SQL
  seed apply           Generate seed SQL and apply to MySQL
  convert maps         Convert legacy maps → Tiled JSON + worlds.json
  deploy               Deploy public/ assets to S3

Quick start (from repo root):
  pnpm install
  cp .env.example .env
  pnpm dev:db && pnpm db:migrate
  npx bao convert maps --maps 34
  npx bao seed apply

Seed options:
  --dats <dir>         AO Dat source (default: public/dats)
  --maps-meta <dir>    Map meta sidecars (default: public/maps)
  --output <dir>       SQL output directory (default: seeds/)
  --only <types>       Subset: objects,npcs,spells,maps,cities,balance,crafting,faction,config
  --apply              Apply to MySQL after generate (alias: seed apply)
  --dry-run            Parse and log counts only
  --debug              Verbose logging

Convert maps options:
  --maps <ids>         Comma-separated map ids (e.g. 1,34)
  --all                Convert all legacy maps in input directory
  --worlds             Emit worlds/worlds.json (default: on)
  --no-worlds          Skip worlds/worlds.json generation
  --meta               Emit per-map *.meta.json sidecars (default: on)
  --no-meta            Skip per-map meta sidecars
  --input <dir>        Legacy maps directory (default: public/maps/old)
  --output <dir>       Baked maps output (default: public/maps)
  --init <dir>         Init JSON directory (default: public/init)
  --public <dir>       Public assets root (default: public)
  --tilesets-type <t>  Tileset spritesheet type (default: tilesets)
  --no-crop            Skip border crop when converting
  --dry-run            Log conversion without writing files
  --debug              Verbose logging

Environment (seed apply):
  MYSQL_* from repo root .env — see packages/api/README.md

More:
  Database migrations   packages/api/README.md
  AO Dat file list      packages/assets/public/dats/README.md
```

`npx bao` resolves the workspace CLI without a global install. Equivalent pnpm scripts:

| Script | Command |
|--------|---------|
| `pnpm convert:maps` | `npx bao convert maps` |
| `pnpm db:seed` | `npx bao seed` |
| `pnpm db:seed:apply` | `npx bao seed apply` |

Pass extra flags after `--` when using pnpm scripts, e.g. `pnpm convert:maps -- --maps 34`.

## Setup workflow

1. **Configure env** — copy `.env.example` → `.env` at repo root (`MYSQL_*`, `JWT_SECRET`).
2. **Start MySQL** — `pnpm dev:db`
3. **Migrate** — `pnpm db:migrate` ([details](../api/README.md))
4. **Copy AO Dat files** — into `public/dats/` ([file list](public/dats/README.md))
5. **Convert maps** — `npx bao convert maps --maps 34` (writes `public/maps/*.json`, `*.meta.json`, `public/worlds/worlds.json`)
6. **Seed database** — `npx bao seed apply` (writes `seeds/*.sql`, then applies to MySQL)

Map meta sidecars (`*.meta.json`) are required for the maps importer. Without them, `04_maps.sql` is skipped.

## Input / output

| Path | Role |
|------|------|
| `public/dats/` | AO `server/Dat` files (not in git) |
| `public/maps/old/` | Legacy `MapaN.{dat,inf,map}` sources |
| `public/maps/` | Baked Tiled JSON + `*.meta.json` sidecars |
| `public/worlds/worlds.json` | Map grid for neighbor loading |
| `seeds/` | Generated SQL (gitignored except `.gitkeep`) |

## Seed output files

| File | Source |
|------|--------|
| `01_objects.sql` | `obj.dat` |
| `02_spells.sql` | `Hechizos.dat` |
| `03_npcs.sql` | `NPCs.dat` |
| `04_maps.sql` | `*.meta.json` |
| `05_cities.sql` | `Ciudades.Dat` |
| `06_balance.sql` | `Balance.dat` |
| `07_crafting.sql` | Herrero / Carpintero dats |
| `08_faction.sql` | `ArmadurasFaccionarias.dat` |
| `09_config.sql` | Motd, Help, forbidden names, GM summon NPCs |

Re-running `npx bao seed` is idempotent — safe to regenerate and re-apply.

## Deploy

```bash
npx bao deploy
# or
pnpm staging
pnpm production
```

S3 credentials: `.env.staging` / `.env.production` in this package.
