# @bao/assets

Static game assets for the Bao monorepo — maps, textures, audio, init data, and AO 13.0 legacy inputs.

The **CLI tooling** (convert, seed, deploy) lives in [`@bao/cli`](../cli/README.md).

## Local dev server

Serves `public/` on port **8787** with CORS (used by `@bao/client` via `NEXT_PUBLIC_BAO_ASSETS`):

```bash
pnpm --filter @bao/assets dev
```

Or via root `pnpm dev` (turbo includes this package).

## AO 13.0 legacy assets

Bao does not ship the original Argentum Online 13.0 client. You need a local copy of the AO 13.0 client folder (or equivalent extract) to run conversions and database seeding.

Each asset type has a **`legacy/`** folder under `public/` where you place the raw AO files before running the CLI. Legacy inputs are gitignored (except `.gitkeep` placeholders); baked outputs in `public/` are tracked.

| Legacy folder | Copy from AO 13.0 client | Used by |
|---------------|--------------------------|---------|
| `public/maps/legacy/` | `Mapa*.dat`, `Mapa*.inf`, `Mapa*.map` from the client maps directory | `bao convert maps` |
| `public/audio/legacy/` | `WAV/`, `MIDI/`, `MP3/` folders plus `gm.sf2` soundfont | `bao convert audio` |
| `public/dats/legacy/` | Server `.dat` files (`obj.dat`, `NPCs.dat`, `Hechizos.dat`, etc.) | `bao seed` |

Textures/sprites are packed manually — see [Graphics (textures)](#graphics-textures) below.

## Converting legacy assets

Run these from the **repo root** after `pnpm install`.

### Maps

1. Copy legacy map triplets into `packages/assets/public/maps/legacy/`:
   - `Mapa34.dat`, `Mapa34.inf`, `Mapa34.map` (one set per map id)
2. Convert to Tiled JSON, meta sidecars, and `worlds/worlds.json`:

```bash
npx bao convert maps --maps 34        # one map
npx bao convert maps --all            # every complete set in legacy/
pnpm convert:maps -- --maps 34        # root script alias
```

Outputs land in `public/maps/` (e.g. `34.json`, `34.meta.json`) and update `public/manifest.json`.

### Audio

**Prerequisites:** [FluidSynth](https://www.fluidsynth.org/) and [ffmpeg](https://ffmpeg.org/) on your `PATH` (e.g. `choco install fluidsynth ffmpeg` on Windows). The CLI resolves their full paths via `where.exe` on Windows, so Git Bash does not need Chocolatey's bin directory on `PATH`. MIDI conversion needs a GM SoundFont — place `gm.sf2` in `public/audio/legacy/` next to `WAV/`, `MIDI/`, and `MP3/`, or set `BAO_SOUND_FONT` to any `.sf2` path (`~/…` is expanded).

```bash
# optional override
BAO_SOUND_FONT=~/Downloads/gm.sf2 npx bao convert audio --all
```

1. From your AO 13.0 client root, copy these into `packages/assets/public/audio/legacy/`:
   - `WAV/` — sound effects and UI sounds
   - `MIDI/` — background music (`.mid`)
   - `MP3/` — pre-rendered music (used when present instead of MIDI)
   - `gm.sf2` — GM soundfont for MIDI rendering
2. Convert and update `public/manifest.json`:

```bash
npx bao convert audio --all           # discover and import everything
npx bao convert audio --music 5,101   # subset: music ids
npx bao convert audio --sfx 21,22     # subset: numeric WAV sfx
npx bao convert audio --ui click      # subset: named UI wavs
pnpm convert:audio -- --all           # root script alias
```

Outputs:
- `public/audio/music/` — `.ogg` or `.mp3` per track
- `public/audio/sfx/ambient/`, `footsteps/`, `ui/` — `.wav` files
- `public/audio/overrides/` — optional runtime overrides (empty by default)

Use `--source <dir>` to point at a different legacy root (e.g. the full AO client install) instead of `public/audio/legacy/`.

### Database seed (dat files)

1. Copy AO server dat files into `packages/assets/public/dats/legacy/` (`obj.dat`, `NPCs.dat`, `Hechizos.dat`, `Ciudades.Dat`, `Balance.dat`, `Motd.ini`, etc.).
2. Generate SQL (and optionally load MySQL):

```bash
npx bao seed                        # write SQL to packages/assets/seeds/
npx bao seed apply                  # generate + apply (needs MYSQL_* in .env)
pnpm db:seed:apply
```

Map meta sidecars in `public/maps/*.meta.json` (from map conversion) are merged during seeding.

### Graphics (textures)

There is no `bao convert` for graphics yet. The pipeline is manual:

1. Export or convert AO graphics to PNG (see `scripts/bmp2png.sh`).
2. Align and pack spritesheets per [`scripts/PACKING.md`](scripts/PACKING.md).
3. Place packed atlases under `public/textures/tilesets/` and `public/textures/animations/`.

Init metadata (`public/init/graphics.json`, etc.) is generated separately and referenced by `public/manifest.json`.

## Layout

| Path | Purpose |
|------|---------|
| `public/` | Baked assets consumed by client and CDN |
| `public/maps/legacy/` | Legacy AO map `.dat` / `.inf` / `.map` inputs |
| `public/maps/` | Converted Tiled JSON, meta sidecars, `worlds.json` |
| `public/audio/legacy/` | Legacy AO `WAV/`, `MIDI/`, `MP3/` inputs |
| `public/audio/` | Converted audio + `manifest.json` entries |
| `public/dats/legacy/` | Legacy AO server `.dat` inputs (gitignored) |
| `public/textures/` | Packed tileset and animation spritesheets |
| `public/init/` | Graphics, objects, heads, effects JSON |
| `seeds/` | Generated SQL (gitignored) |
| `scripts/` | Graphics pipeline shell helpers |

## Deploy

```bash
# Using @bao/assets script
pnpm --filter @bao/assets staging
pnpm --filter @bao/assets production

# Using @bao/cli
npx bao deploy --environment staging
npx bao deploy --environment production
```

These delegate to `@bao/cli deploy` with the appropriate environment overlay.
