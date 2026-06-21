bao
======

https://github.com/user-attachments/assets/8b4f3b9f-cf20-4840-9587-ade0db0ccb98

---

[![vercel](https://img.shields.io/github/deployments/rtroncoso/bao/Production?label=vercel&logo=vercel&logoColor=white)](https://vercel.com)
[![turborepo](https://img.shields.io/badge/maintained%20with-turborepo-blueviolet.svg)](https://turborepo.org/)
[![pnpm](https://img.shields.io/badge/pnpm-v9.12.0-informational)](https://pnpm.io/)

Complete repository for **bao** game client, servers and tools.

## Try the Live Demo

You can fiddle around this implementation by going to the [Demo Site](https://bao.rtroncoso.com)

> **Credentials:** demo / demo123
> 
> **Tip:** Press **Command+G** (Mac) or **Ctrl+G** (Windows/linux) to view debug info

## Getting Started

Install dependencies and start the dev stack (API, client, Colyseus, core):

```sh
pnpm install
cp .env.example .env   # set MYSQL_*, JWT_SECRET, etc.
pnpm dev:db            # MySQL via Docker
pnpm db:migrate
pnpm dev
```

World data (maps, NPCs, objects) is managed with the **`bao` CLI** from [`@bao/cli`](packages/cli/README.md):

```sh
npx bao convert maps --maps 34   # legacy maps → client JSON + meta sidecars
npx bao seed apply               # generate SQL and load MySQL
```

See [`packages/cli/README.md`](packages/cli/README.md) for full CLI usage. Static assets live in [`packages/assets`](packages/assets/README.md). API/database details: [`packages/api/README.md`](packages/api/README.md).

