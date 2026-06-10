# @bao/assets

Asset tooling for the Bao monorepo: world database seeding, legacy map conversion, and S3 deployment.

## Quick start

From the **repo root**:

```bash
pnpm install
cp .env.example .env          # set MYSQL_* and JWT_SECRET
pnpm dev:db                   # start MySQL (Docker)
pnpm db:migrate               # apply SQL migrations (transactional)

# Then:

# 1. Copy AO 13.0 server/Dat files into public/dats/
# 2. Convert maps so public/maps/*.meta.json sidecars exist (when convert CLI is available)

pnpm db:seed                  # generate SQL → packages/assets/seeds/
pnpm db:seed:apply            # generate + apply to MySQL
```

From **`packages/assets`**:

```bash
pnpm seed
pnpm seed -- --apply
pnpm seed -- --dry-run --debug
```

---

## Database migrations

`bao seed --apply` does **not** run migrations. Apply them **before** seeding:

```bash
pnpm dev:db        # start MySQL
pnpm db:migrate    # transactional runner; skips already-applied files
```

The runner (`packages/api/scripts/migrate.ts`) applies each SQL file in a **single transaction**, records success in `schema_migrations`, and **skips duplicates** on re-run. See [`packages/api/sql/README.md`](../api/sql/README.md).

| Order | File | Required for seed? | What it provides |
|-------|------|--------------------|------------------|
| 1 | [`packages/api/sql/2020-11-09_full.sql`](../api/sql/2020-11-09_full.sql) | **Yes** | Base game schema: `objects`, `objects_attributes`, `objects_classes`, `attributes`, `classes`, accounts, and related tables |
| 2 | [`packages/api/sql/2026-06-09_world_integration.sql`](../api/sql/2026-06-09_world_integration.sql) | **Yes** | World tables: `maps`, `npcs`, `spells`, spawn tables, `game_balance`, `cities`, `crafting_recipes`, `faction_armor_map`, `motd_lines`, `help_lines`, `forbidden_names`, `gm_summon_npcs`, etc. |
| 3 | [`packages/api/sql/2020-11-09_characters.sql`](../api/sql/2020-11-09_characters.sql) | No (game runtime) | Character/inventory tables for live play; not populated by `bao seed` |

`2020-11-09_full.sql` must run first: `01_objects.sql` references `objects` / `attributes` / `classes`, and world spawn tables FK into `objects`.

**MySQL caveat:** DDL (`CREATE TABLE`, etc.) can still cause implicit commits. If a migration fails mid-file, drop/recreate the dev database and run `pnpm db:migrate` again.

---

## Environment

`--apply` reads MySQL settings from the **repo root** `.env` (via `@bao/env`):

| Variable | Default | Purpose |
|----------|---------|---------|
| `MYSQL_HOST` | `localhost` | MySQL host |
| `MYSQL_PORT` | `3306` | MySQL port |
| `MYSQL_USER` | `root` | MySQL user |
| `MYSQL_PASSWORD` | _(empty)_ | MySQL password |
| `MYSQL_DATABASE` | `bao` | Target database (**required** for `--apply`) |

Copy [`.env.example`](../../.env.example) to `.env` at the repo root.

---

## Input files

### AO Dat files (`public/dats/`)

Copy the contents of Argentum Online `server/Dat` into [`public/dats/`](public/dats/). See [`public/dats/README.md`](public/dats/README.md) for the file list.

These files are **not** committed to git; each developer copies them locally.

### Map meta sidecars (`public/maps/*.meta.json`)

Map spawns and metadata come from `*.meta.json` sidecars produced by map conversion (`bao convert maps`). Without them, the `maps` importer is skipped and `04_maps.sql` is not written.

Legacy map sources live under `public/maps/` (e.g. `Mapa{N}.dat`, `.inf`, `.map`).

---

## `bao seed` command

### Package / root scripts

| Command | Runs |
|---------|------|
| `pnpm seed` (in `packages/assets`) | `tsx src/bao.js seed` |
| `pnpm db:seed` (repo root) | `pnpm --filter @bao/assets seed` |
| `pnpm db:seed:apply` (repo root) | `pnpm --filter @bao/assets seed -- --apply` |

### Direct CLI

```bash
# From packages/assets
node src/bao.js seed [options]
# or
pnpm exec tsx --tsconfig tsconfig.json src/bao.js seed [options]
```

### Flags

| Flag | Default | Purpose |
|------|---------|---------|
| `--dats <dir>` | `public/dats` | AO Dat source directory |
| `--maps-meta <dir>` | `public/maps` | Directory containing `*.meta.json` sidecars |
| `--output <dir>` | `seeds/` | SQL output directory |
| `--only <types>` | all | Comma-separated subset: `objects,npcs,spells,maps,cities,balance,crafting,faction,config` |
| `--apply` | false | After generate, execute `*.sql` against MySQL |
| `--dry-run` | false | Parse and log counts only; no file writes or DB apply |
| `--debug` | false | Verbose logging (e.g. unmapped `obj.dat` fields) |

### Examples

```bash
# Generate all seed SQL (default paths)
pnpm db:seed

# Generate + apply
pnpm db:seed:apply

# Custom Dat location (e.g. AO install outside repo)
node src/bao.js seed --dats /path/to/AO/server/Dat

# Only objects and NPCs
node src/bao.js seed --only objects,npcs

# Preview counts without writing files
node src/bao.js seed --dry-run --debug

# Deprecated alias (warns, then runs seed)
node src/bao.js import dats
```

### Generated SQL files

Written to `seeds/` in lexical order (also the `--apply` execution order):

| File | Source | Idempotency |
|------|--------|-------------|
| `01_objects.sql` | `obj.dat` | UPSERT `objects`, `objects_attributes`; DELETE+INSERT `objects_classes` per object |
| `02_spells.sql` | `Hechizos.dat` | UPSERT `spells` by `id` |
| `03_npcs.sql` | `NPCs.dat` | UPSERT `npcs`, `npc_drops`, `npc_shop_items`, `npc_spells`, `npc_trainer_creatures` |
| `04_maps.sql` | `*.meta.json` | UPSERT `maps`; DELETE all spawn rows, then INSERT spawns/exits |
| `05_cities.sql` | `Ciudades.Dat` | UPSERT `cities` by stable `id` (file order) |
| `06_balance.sql` | `Balance.dat` | UPSERT `game_balance` (`category`, `key`) |
| `07_crafting.sql` | Herrero/Carpintero dats | UPSERT `crafting_recipes` (`profession`, `slot`) |
| `08_faction.sql` | `ArmadurasFaccionarias.dat` | UPSERT `faction_armor_map` |
| `09_config.sql` | Motd, Help, names, Invokar | UPSERT `motd_lines`, `help_lines`, `forbidden_names`, `gm_summon_npcs` |

`seeds/*.sql` is **gitignored**; only [`seeds/.gitkeep`](seeds/.gitkeep) is tracked. Re-running seed updates files on disk but does not dirty `git status`.

**Not seeded by default** (operational/runtime): `bkNPCs.dat`, `BanIps.dat`, `AreasStats.dat`, `consultas.dat`, `apuestas.dat`.

---

## Validation

After setup, confirm:

```bash
# Idempotent generation (git status unchanged for tracked files)
pnpm db:seed
pnpm db:seed
git status

# Idempotent apply (stable row counts, no duplicate map spawns)
pnpm db:seed:apply
pnpm db:seed:apply
```

Spot-checks:

- Object id **7** (door) in `objects` / `objects_attributes`
- NPC id **35** (Nix properties) in `npcs` + shop rows
- Spell id **1** in `spells`
- Map **34** spawn counts vs `public/maps/34.meta.json` (after map convert)

With API/Colyseus running and `ADMIN_API_KEY` set:

```http
GET /admin/maps/34/spawns
```

---

## Other `bao` commands

```bash
node src/bao.js deploy          # S3 asset deploy (see src/deploy.js)
pnpm staging                    # deploy.sh --environment staging
pnpm production               # deploy.sh --environment production
```

`bao convert maps` (map → TMX + `*.meta.json` + `worlds.json`) is part of the world integration CLI; run it before seeding map spawns when that subcommand is available on your branch.

---

## Project layout

```
packages/assets/
  public/dats/          # AO server/Dat (user-managed, not in git)
  public/maps/          # Legacy map files + *.meta.json sidecars
  seeds/                # Generated SQL (gitignored except .gitkeep)
  src/
    bao.js              # CLI entrypoint
    seed/
      index.js          # Orchestrator
      apply.js          # mysql2 apply
      importers/        # Per-dat SQL writers
      lib/              # INI parser, attribute/class maps
```
