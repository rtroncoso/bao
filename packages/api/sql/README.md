# Database migrations

SQL migrations are applied with the transactional runner:

```bash
# From repo root
pnpm db:migrate

# From packages/api
pnpm migrate
pnpm migrate -- --dry-run
pnpm migrate -- --only 2026-06-09_world_integration.sql
```

## How it works

1. On first run, creates `schema_migrations` (name, checksum, applied_at).
2. Runs each file below in **dependency order**, inside a **single transaction per file**.
3. Records the file checksum only after the full file succeeds.
4. Re-running `pnpm db:migrate` **skips** files already in `schema_migrations`.
5. If a migration file changes after it was applied, the runner **fails** (prevents silent drift).

## Migration order

| File | Purpose |
|------|---------|
| `2020-11-09_full.sql` | Base schema: objects, attributes, classes, accounts, … |
| `2026-06-09_world_integration.sql` | World tables: maps, npcs, spells, spawns, balance, config |
| `2020-11-09_characters.sql` | Character tables for API/Colyseus gameplay |
| `2026-06-10_character_world_position.sql` | `mapId`, `worldX`, `worldY` on `characters` |

## MySQL caveat

`CREATE TABLE` and other DDL can cause **implicit commits** in MySQL/MariaDB. If a migration fails mid-file, tables created before the failure may remain even after `ROLLBACK`. The runner still:

- avoids recording a failed migration (so re-run retries the whole file),
- skips successfully completed files on duplicate runs.

For a clean retry after a failed base migration on a dev database, drop and recreate the database, then run `pnpm db:migrate` again.

## Manual apply (not recommended)

```bash
mysql ... < packages/api/sql/2020-11-09_full.sql
```

Manual runs bypass `schema_migrations`; the runner may attempt to re-apply and fail on existing tables. Prefer `pnpm db:migrate`.
