# @bao/api

Express REST API for Bao — accounts, characters, objects, maps, and world data.

## Development

```bash
# From repo root
pnpm dev          # API + client + Colyseus + core watch
pnpm --filter @bao/api dev
```

Requires MySQL. Copy `.env.example` to `.env` at the **repo root** and set `MYSQL_*`, `JWT_SECRET`, and `API_PORT`.

## Database setup

Migrations must run **before** `bao seed apply` (seeding does not create tables).

```bash
pnpm dev:db        # start MySQL (Docker)
pnpm db:migrate    # apply pending SQL migrations
```

### What `pnpm db:migrate` does

1. Creates `schema_migrations` on first run.
2. Applies each SQL file in **dependency order**, one transaction per file.
3. Skips files already recorded in `schema_migrations`.
4. Fails if an applied file's checksum changes (edit → add a new migration instead).

Full runner details: [`sql/README.md`](sql/README.md).

### Migration order

| File | Purpose |
|------|---------|
| `2020-11-09_full.sql` | Base schema: objects, attributes, classes, accounts |
| `2026-06-09_world_integration.sql` | World tables: maps, npcs, spells, spawns, balance, config |
| `2020-11-09_characters.sql` | Character / inventory tables for gameplay |
| `2026-06-10_character_world_position.sql` | `mapId`, `worldX`, `worldY` on characters |

`2020-11-09_full.sql` must run first — seed SQL references `objects` and world spawn tables FK into `maps` / `objects`.

### Environment variables

| Variable | Default | Purpose |
|----------|---------|---------|
| `MYSQL_HOST` | `localhost` | MySQL host |
| `MYSQL_PORT` | `3306` | MySQL port |
| `MYSQL_USER` | `root` | MySQL user |
| `MYSQL_PASSWORD` | _(empty)_ | MySQL password |
| `MYSQL_DATABASE` | `bao` | Database name (**required**) |
| `JWT_SECRET` | — | JWT signing for `/client` routes |
| `ADMIN_API_KEY` | — | Service auth for `/admin` routes (Colyseus position save) |

## Scripts

| Command | Description |
|---------|-------------|
| `pnpm migrate` | Run migrations (same as root `pnpm db:migrate`) |
| `pnpm migrate -- --dry-run` | Preview pending migrations |
| `pnpm migrate -- --only <file.sql>` | Apply a single migration file |
