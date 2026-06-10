# Contributing

Thanks for helping on bao. Keep changes small and scoped to the package that owns the problem.

## Setup

```sh
pnpm install
cp .env.example .env
pnpm dev
```

See `README.md` and `AGENTS.md` for package layout and common commands.

## Branches

- Base branch: `develop`
- Name branches after the work: `feat/world`, `fix/assets-deploy`, etc.

## Commits

Use conventional commits with a scope when it helps:

```
fix(assets): deploy sync + assets re-generation
feat(world): add world integration with maps prefetching
chore: prettier
```

Keep the subject short. Body is optional — use it when the why isn't obvious.

## Pull requests

Open PRs against `develop`. Fill out the PR template; a short description beats a long one.

Before opening:

- run the relevant package scripts if you touched that area
- avoid unrelated drive-by changes
- mention migrations, asset regen, or deploy steps when relevant

## Assets / DB work

From repo root:

```sh
npx bao convert maps --maps 34
npx bao seed apply
npx bao deploy
```

Map meta sidecars (`*.meta.json`) are required for seeding maps. Generated SQL in `packages/assets/seeds/` is gitignored.
