# @bao/assets

Static game assets for the Bao monorepo — maps, textures, audio manifests, init data, and AO dat inputs.

The **CLI tooling** (convert, seed, deploy) lives in [`@bao/cli`](../cli/README.md).

## Local dev server

Serves `public/` on port **8787** with CORS (used by `@bao/client` via `NEXT_PUBLIC_BAO_ASSETS`):

```bash
pnpm --filter @bao/assets dev
```

Or via root `pnpm dev` (turbo includes this package).

## CLI commands

From the **repo root**:

```bash
npx bao convert maps --maps 34
npx bao seed
npx bao seed apply
npx bao deploy --environment staging
```

See [`packages/cli/README.md`](../cli/README.md) for full CLI usage.

## Layout

| Path | Purpose |
|------|---------|
| `public/` | Baked assets consumed by client and CDN |
| `public/dats/` | AO `.dat` sources (gitignored) |
| `public/maps/old/` | Legacy map files for conversion |
| `seeds/` | Generated SQL (gitignored) |
| `scripts/` | Graphics pipeline shell helpers |

## Deploy

```bash
pnpm --filter @bao/assets staging
pnpm --filter @bao/assets production
```

These delegate to `@bao/cli deploy` with the appropriate environment overlay.
