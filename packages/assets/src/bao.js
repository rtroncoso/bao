#!/usr/bin/env node
import path from 'path';
import { fileURLToPath } from 'url';

import { printHelp } from './cli/help.js';
import { runSeed } from './seed/index.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PACKAGE_ROOT = path.resolve(__dirname, '..');
const PUBLIC_DIR = path.join(PACKAGE_ROOT, 'public');

const parseArgs = (argv) => {
  const options = {
    command: null,
    subcommand: null,
    datsDir: path.join(PACKAGE_ROOT, 'public/dats'),
    mapsMetaDir: path.join(PACKAGE_ROOT, 'public/maps'),
    outputDir: path.join(PACKAGE_ROOT, 'seeds'),
    only: null,
    apply: false,
    dryRun: false,
    debug: false,
    convertMaps: [],
    convertAll: false,
    worlds: true,
    meta: true,
    inputDir: path.join(PUBLIC_DIR, 'maps', 'old'),
    convertOutputDir: path.join(PUBLIC_DIR, 'maps'),
    initDir: path.join(PUBLIC_DIR, 'init'),
    publicDir: PUBLIC_DIR,
    tilesetsType: 'tilesets',
    noCrop: false,
    validate: false,
  };

  const args = argv.filter((arg) => arg !== '--');

  if (args.length === 0) {
    return options;
  }

  options.command = args.shift();

  if (options.command === 'help') {
    return options;
  }

  if (options.command === 'import' && args[0] === 'dats') {
    options.subcommand = 'import-dats';
    args.shift();
  } else if (options.command === 'convert' && args[0] === 'maps') {
    options.subcommand = 'convert-maps';
    args.shift();
  } else if (options.command === 'seed') {
    if (args[0] === 'apply') {
      options.subcommand = 'seed-apply';
      options.apply = true;
      args.shift();
    } else {
      options.subcommand = 'seed';
    }
  } else if (options.command === 'deploy') {
    // deploy.js parses its own flags via commander
    return options;
  }

  while (args.length > 0) {
    const arg = args.shift();

    switch (arg) {
      case '--dats':
        options.datsDir = path.resolve(args.shift() ?? options.datsDir);
        break;
      case '--maps-meta':
        options.mapsMetaDir = path.resolve(args.shift() ?? options.mapsMetaDir);
        break;
      case '--output':
        if (options.subcommand === 'convert-maps') {
          options.convertOutputDir = path.resolve(
            args.shift() ?? options.convertOutputDir
          );
        } else {
          options.outputDir = path.resolve(args.shift() ?? options.outputDir);
        }
        break;
      case '--only':
        options.only = args.shift() ?? null;
        break;
      case '--apply':
        options.apply = true;
        break;
      case '--dry-run':
        options.dryRun = true;
        break;
      case '--debug':
        options.debug = true;
        break;
      case '--maps':
        options.convertMaps = (args.shift() ?? '')
          .split(',')
          .map((value) => Number.parseInt(value.trim(), 10))
          .filter((id) => Number.isFinite(id));
        break;
      case '--all':
        options.convertAll = true;
        break;
      case '--worlds':
        options.worlds = true;
        break;
      case '--no-worlds':
        options.worlds = false;
        break;
      case '--meta':
        options.meta = true;
        break;
      case '--no-meta':
        options.meta = false;
        break;
      case '--input':
        options.inputDir = path.resolve(args.shift() ?? options.inputDir);
        break;
      case '--init':
        options.initDir = path.resolve(args.shift() ?? options.initDir);
        break;
      case '--public':
        options.publicDir = path.resolve(args.shift() ?? options.publicDir);
        if (options.subcommand !== 'convert-maps') {
          options.convertOutputDir = path.join(options.publicDir, 'maps');
        }
        break;
      case '--tilesets-type':
        options.tilesetsType = args.shift() ?? options.tilesetsType;
        break;
      case '--no-crop':
        options.noCrop = true;
        break;
      case '--validate':
        options.validate = true;
        break;
      case '--help':
      case '-h':
        printHelp();
        process.exit(0);
        break;
      default:
        console.error(`Unknown option: ${arg}\n`);
        printHelp();
        process.exit(1);
    }
  }

  return options;
};

const runDeploy = async () => {
  const { spawn } = await import('child_process');
  const deployPath = path.join(__dirname, 'deploy.js');

  await new Promise((resolve, reject) => {
    const child = spawn(process.execPath, [deployPath, ...process.argv.slice(3)], {
      stdio: 'inherit',
      cwd: PACKAGE_ROOT,
    });

    child.on('error', reject);
    child.on('close', (code) => {
      if (code === 0) {
        resolve();
      } else {
        reject(new Error(`deploy exited with code ${code}`));
      }
    });
  });
};

const runConvertMaps = async (options) => {
  const { patchPixiForHeadless } = await import('./lib/patchPixi.js');
  patchPixiForHeadless();

  await import('./lib/registerCoreAliases.js');

  const { convertMaps } = await import('./convert/maps.js');
  const result = await convertMaps({
    all: options.convertAll,
    debug: options.debug,
    dryRun: options.dryRun,
    inputDir: options.inputDir,
    initDir: options.initDir,
    maps: options.convertMaps,
    meta: options.meta,
    noCrop: options.noCrop,
    outputDir: options.convertOutputDir,
    publicDir: options.publicDir,
    tilesetsType: options.tilesetsType,
    validate: options.validate,
    worlds: options.worlds,
  });

  const skipped =
    result.skipped?.length > 0
      ? ` (skipped ${result.skipped.length}: ${result.skipped.join(', ')})`
      : '';

  console.log(
    `[bao] converted ${result.total} map(s): ${result.converted.join(', ')}${skipped}`
  );
};

const main = async () => {
  const options = parseArgs(process.argv.slice(2));

  if (
    !options.command ||
    options.command === 'help' ||
    options.command === '--help' ||
    options.command === '-h'
  ) {
    printHelp();
    process.exit(0);
  }

  if (options.subcommand === 'import-dats') {
    console.warn('[bao] "import dats" is deprecated; use "bao seed" instead.');
    options.subcommand = 'seed';
  }

  if (
    options.subcommand === 'seed' ||
    options.subcommand === 'seed-apply' ||
    options.command === 'seed'
  ) {
    const summary = await runSeed(options);

    console.log('Seed complete:');
    for (const entry of summary) {
      if (entry.type === 'apply') {
        console.log(`  apply: ${entry.count} SQL files executed`);
      } else if (entry.skipped) {
        console.log(`  ${entry.type}: skipped (source missing)`);
      } else {
        console.log(`  ${entry.type}: ${entry.count} records (${entry.statements} statements)`);
      }
    }

    return;
  }

  if (options.subcommand === 'convert-maps') {
    await runConvertMaps(options);
    return;
  }

  if (options.command === 'deploy') {
    await runDeploy();
    return;
  }

  console.error(`Unknown command: ${options.command}\n`);
  printHelp();
  process.exit(1);
};

main().catch((error) => {
  console.error(error.message ?? error);
  if (error.stack) {
    console.error(error.stack);
  }
  process.exit(1);
});
