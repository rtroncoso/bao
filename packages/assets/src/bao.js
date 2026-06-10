#!/usr/bin/env node
import path from 'path';
import { fileURLToPath } from 'url';
import { runSeed } from './seed/index.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PACKAGE_ROOT = path.resolve(__dirname, '..');

const printHelp = () => {
  console.log(`bao — assets tooling

Usage:
  bao seed [options]     Generate idempotent world seed SQL
  bao import dats        Deprecated alias for "bao seed"
  bao deploy             Deploy assets (see src/deploy.js)

Seed options:
  --dats <dir>           AO Dat source (default: public/dats)
  --maps-meta <dir>      Map meta sidecars (default: public/maps)
  --output <dir>         SQL output directory (default: seeds/)
  --only <types>         Subset: objects,npcs,spells,maps,cities,balance,crafting,faction,config
  --apply                Execute generated SQL against MySQL
  --dry-run              Parse and log counts only
  --debug                Verbose logging
`);
};

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
  };

  const args = argv.filter((arg) => arg !== '--');

  if (args.length === 0) {
    return options;
  }

  options.command = args.shift();

  if (options.command === 'import' && args[0] === 'dats') {
    options.subcommand = 'import-dats';
    args.shift();
  }

  if (options.command === 'seed') {
    options.subcommand = 'seed';
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
        options.outputDir = path.resolve(args.shift() ?? options.outputDir);
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
      case '--help':
      case '-h':
        printHelp();
        process.exit(0);
        break;
      default:
        console.error(`Unknown option: ${arg}`);
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

const main = async () => {
  const options = parseArgs(process.argv.slice(2));

  if (!options.command || options.command === '--help' || options.command === '-h') {
    printHelp();
    process.exit(options.command ? 0 : 1);
  }

  if (options.subcommand === 'import-dats') {
    console.warn('[bao] "import dats" is deprecated; use "bao seed" instead.');
    options.subcommand = 'seed';
  }

  if (options.subcommand === 'seed' || options.command === 'seed') {
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

  if (options.command === 'deploy') {
    await runDeploy();
    return;
  }

  printHelp();
  process.exit(1);
};

main().catch((error) => {
  console.error(error.message ?? error);
  process.exit(1);
});
