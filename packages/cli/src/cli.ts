#!/usr/bin/env node
import { Command } from "commander";
import path from "path";

import { runDeploy } from "./commands/deploy.js";
import { convertAudio } from "./convert/audio.js";
import { convertMaps } from "./convert/maps.js";
import { HELP_TEXT } from "./cli/help.js";
import { patchPixiForHeadless } from "./lib/patchPixi.js";
import { resolveProjectPaths } from "./lib/projectPaths.js";
import { runSeed } from "./seed/index.js";
import type {
  ConvertAudioOptions,
  ConvertMapsOptions,
  SeedOptions,
} from "./types.js";

import "./lib/registerCoreAliases.js";

const program = new Command();

program
  .name("bao")
  .description("Bao asset tooling — map conversion, world seeding, S3 deploy");

program.on("--help", () => {
  console.log("");
  console.log(HELP_TEXT);
});

const seedOptions = [
  ["--dats <dir>", "AO Dat source directory"],
  ["--maps-meta <dir>", "Map meta sidecars directory"],
  ["--output <dir>", "SQL output directory"],
  [
    "--only <types>",
    "Subset: objects,npcs,spells,maps,cities,balance,crafting,faction,config",
  ],
  ["--dry-run", "Parse and log counts only"],
  ["--debug", "Verbose logging"],
] as const;

const applySeedOptions = <
  T extends { option: (flags: string, description?: string) => T }
>(
  cmd: T
): T => {
  for (const [flags, description] of seedOptions) {
    cmd.option(flags, description);
  }
  return cmd;
};

const buildSeedOptions = (
  opts: Record<string, unknown>,
  apply = false
): SeedOptions => {
  const paths = resolveProjectPaths();
  return {
    datsDir: (opts.dats as string | undefined) ?? paths.datsDir,
    mapsMetaDir: (opts.mapsMeta as string | undefined) ?? paths.mapsMetaDir,
    outputDir: (opts.output as string | undefined) ?? paths.seedsDir,
    only: (opts.only as string | undefined) ?? null,
    apply,
    dryRun: Boolean(opts.dryRun),
    debug: Boolean(opts.debug),
  };
};

const printSeedSummary = (summary: Awaited<ReturnType<typeof runSeed>>) => {
  console.log("Seed complete:");
  for (const entry of summary) {
    if (entry.type === "apply") {
      console.log(`  apply: ${entry.count} SQL files executed`);
    } else if (entry.skipped) {
      console.log(`  ${entry.type}: skipped (source missing)`);
    } else {
      console.log(
        `  ${entry.type}: ${entry.count} records (${entry.statements} statements)`
      );
    }
  }
};

const seedCmd = program
  .command("seed")
  .description("Generate idempotent world seed SQL");

applySeedOptions(seedCmd).action(async (opts: Record<string, unknown>) => {
  const summary = await runSeed(buildSeedOptions(opts));
  printSeedSummary(summary);
});

applySeedOptions(
  seedCmd.command("apply").description("Generate seed SQL and apply to MySQL")
).action(async (opts: Record<string, unknown>) => {
  const summary = await runSeed(buildSeedOptions(opts, true));
  printSeedSummary(summary);
});

program
  .command("import dats")
  .description('Deprecated — use "bao seed"')
  .action(async (opts: Record<string, unknown>) => {
    console.warn('[bao] "import dats" is deprecated; use "bao seed" instead.');
    const summary = await runSeed(buildSeedOptions(opts));
    printSeedSummary(summary);
  });

const convertCmd = program
  .command("convert")
  .description("Convert legacy assets");

convertCmd
  .command("maps")
  .description("Convert legacy maps → Tiled JSON + worlds.json")
  .option("--maps <ids>", "Comma-separated map ids (e.g. 1,34)")
  .option("--all", "Convert all legacy maps in input directory")
  .option("--worlds", "Emit worlds/worlds.json", true)
  .option("--no-worlds", "Skip worlds/worlds.json generation")
  .option("--meta", "Emit per-map *.meta.json sidecars", true)
  .option("--no-meta", "Skip per-map meta sidecars")
  .option("--input <dir>", "Legacy maps directory")
  .option("--output <dir>", "Baked maps output directory")
  .option("--init <dir>", "Init JSON directory")
  .option("--public <dir>", "Public assets root")
  .option("--tilesets-type <type>", "Tileset spritesheet type", "tilesets")
  .option("--no-crop", "Skip border crop when converting")
  .option(
    "--validate",
    "Fail if server spawns are misaligned with baked sprites"
  )
  .option("--dry-run", "Log conversion without writing files")
  .option("--debug", "Verbose logging")
  .action(async (opts: Record<string, unknown>) => {
    patchPixiForHeadless();

    const paths = resolveProjectPaths();
    const maps = opts.maps
      ? String(opts.maps)
          .split(",")
          .map((value: string) => Number.parseInt(value.trim(), 10))
          .filter((id: number) => Number.isFinite(id))
      : [];

    const options: ConvertMapsOptions = {
      all: Boolean(opts.all),
      debug: Boolean(opts.debug),
      dryRun: Boolean(opts.dryRun),
      inputDir: (opts.input as string | undefined) ?? paths.mapsInputDir,
      initDir: (opts.init as string | undefined) ?? paths.initDir,
      maps,
      meta: opts.meta as boolean | undefined,
      noCrop: Boolean(opts.noCrop),
      outputDir: (opts.output as string | undefined) ?? paths.mapsOutputDir,
      publicDir: (opts.public as string | undefined) ?? paths.publicDir,
      tilesetsType: opts.tilesetsType as string | undefined,
      validate: Boolean(opts.validate),
      worlds: opts.worlds as boolean | undefined,
    };

    const result = await convertMaps(options);

    const skipped =
      result.skipped?.length > 0
        ? ` (skipped ${result.skipped.length}: ${result.skipped.join(", ")})`
        : "";

    console.log(
      `[bao] converted ${result.total} map(s): ${result.converted.join(
        ", "
      )}${skipped}`
    );
  });

convertCmd
  .command("audio")
  .description("Import AO WAV/MIDI/MP3 → public/audio + manifest")
  .requiredOption(
    "--source <dir>",
    "AO client root (contains WAV/, MIDI/, MP3/)"
  )
  .option("--all", "Import all discovered audio")
  .option("--music <ids>", "Comma-separated music ids")
  .option("--sfx <ids>", "Comma-separated sfx ids")
  .option("--ui <names>", "Comma-separated UI wav names")
  .option("--public <dir>", "Public assets root")
  .option("--dry-run", "Log without writing files")
  .option("--debug", "Verbose logging")
  .action(async (opts: Record<string, unknown>) => {
    const paths = resolveProjectPaths();
    const parseList = (value?: unknown) =>
      String(value ?? "")
        .split(",")
        .map((entry) => entry.trim())
        .filter(Boolean);

    const options: ConvertAudioOptions = {
      sourceDir: path.resolve(String(opts.source)),
      publicDir: (opts.public as string | undefined) ?? paths.publicDir,
      music: parseList(opts.music),
      sfx: parseList(opts.sfx),
      ui: parseList(opts.ui),
      all: Boolean(opts.all),
      dryRun: Boolean(opts.dryRun),
      debug: Boolean(opts.debug),
    };

    const result = await convertAudio(options);

    console.log(
      `[bao] audio: ${result.music.length} music, ${result.sfx.length} sfx entries in manifest`
    );
  });

program
  .command("deploy")
  .description("Deploy public/ assets to S3")
  .option("-d, --debug", "Show additional debug info")
  .option(
    "-e, --environment <environment>",
    "Optional overlay: .env.staging or .env.production",
    "staging"
  )
  .option("--sync-all", "Re-upload every local file (ignore remote ETag match)")
  .option("--public <dir>", "Public assets root to deploy")
  .action(async (opts: Record<string, unknown>) => {
    const paths = resolveProjectPaths();
    await runDeploy({
      debug: Boolean(opts.debug),
      environment: opts.environment as string | undefined,
      syncAll: Boolean(opts.syncAll),
      publicDir: (opts.public as string | undefined) ?? paths.publicDir,
    });
  });

program.parseAsync(process.argv).catch((error: unknown) => {
  const message = error instanceof Error ? error.message : String(error);
  console.error(message);
  if (error instanceof Error && error.stack) {
    console.error(error.stack);
  }
  process.exit(1);
});
