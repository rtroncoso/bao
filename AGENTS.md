# AI Agent Guide for bao

This repository is a turborepo monorepo for the `bao` game project. It contains a browser client, REST API backend, Colyseus game server, shared core module, CLI tooling, and static assets.

## Key workspace packages
- `packages/client` — Next.js + React frontend, Pixi game rendering, Redux, Tailwind, `react-scripts` unit tests.
- `packages/api` — Express REST API server (TypeScript), JWT authentication, MySQL support, `ts-node-dev` development flow.
- `packages/colyseus` — Colyseus game server in TypeScript, realtime room logic, `ts-node-dev` for local development.
- `packages/core` — Shared TypeScript core module used by client and server packages.
- `packages/cli` — `@bao/cli` TypeScript CLI (map convert, DB seed, S3 deploy). Run `npx bao` from repo root.
- `packages/assets` — Static game assets (`public/`) and local dev server on `:8787`.

## Recommended commands
Use `pnpm` at the repo root.
- `pnpm install` — install dependencies for all workspaces.
- `pnpm dev` — run `turbo run dev` for all packages.
- `pnpm build` — run `turbo run build` for all packages.
- `pnpm lint` — run `turbo run lint`.
- `pnpm test` — run `cross-env NODE_ENV=testing turbo run test`.
- `pnpm format` — run `turbo run prettier`.

Package-specific commands:
- `packages/client`: `pnpm dev`, `pnpm build`, `pnpm test`, `pnpm test:lint`, `pnpm prettier`
- `packages/api`: `pnpm dev`, `pnpm start`, `pnpm lint`, `pnpm format`
- `packages/colyseus`: `pnpm dev`, `pnpm start`, `pnpm loadtest`, `pnpm prettier`
- `packages/core`: `pnpm build`, `pnpm test`
- `packages/cli`: `pnpm build`, `pnpm test`, `pnpm dev`

## Project conventions
- This is a monorepo with workspace-local package references like `workspace:*`.
- Use `pnpm` for package management and `turbo` for orchestration.
- Keep frontend changes in `packages/client`, API changes in `packages/api`, realtime server changes in `packages/colyseus`, shared business logic in `packages/core`, and CLI changes in `packages/cli`.
- `packages/client` is a hybrid Next.js / CRA style app with a custom webpack/Tailwind + Pixi rendering stack.
- `packages/api`, `packages/colyseus`, `packages/core`, and `packages/cli` are TypeScript.

## Helpful docs
- Root README: `README.md`
- CLI usage: `packages/cli/README.md`
- Static assets: `packages/assets/README.md`
- Client intro: `packages/client/README.md`
- Colyseus server intro: `packages/colyseus/README.md`

## AI agent guidance
- Prefer edits that match existing package structure and toolchain.
- If implementing features or fixes, update only the package that owns the relevant domain.
- Do not assume the repo uses npm or Yarn; use `pnpm`.
- Do not add or update dependencies without checking package-level scripts and workspace compatibility.
- For TypeScript changes in `packages/colyseus`, `packages/core`, or `packages/cli`, mention rebuilding with `pnpm build`.
- For frontend changes, note that `packages/client` uses Next.js and also supports `react-scripts` testing.

## Why this file exists
This file helps AI coding agents understand the repo layout, the primary package responsibilities, the standard commands, and the expected workflow for changes. It is deliberately minimal and links to package docs for details.
