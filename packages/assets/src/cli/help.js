export const HELP_TEXT = `┌──────────────────────────────────────────────────────────────────┐
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
  --validate           Fail if server spawns are misaligned with baked sprites
  --dry-run            Log conversion without writing files
  --debug              Verbose logging

Environment (seed apply):
  MYSQL_* from repo root .env — see packages/api/README.md

More:
  Database migrations   packages/api/README.md
`;

export const printHelp = () => {
  console.log(HELP_TEXT);
};
