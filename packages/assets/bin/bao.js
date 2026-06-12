#!/usr/bin/env node
import { spawnSync } from 'node:child_process';
import { createRequire } from 'node:module';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const require = createRequire(import.meta.url);
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const packageRoot = path.resolve(__dirname, '..');
const entrypoint = path.join(packageRoot, 'src/bao.js');
const tsconfig = path.join(packageRoot, 'tsconfig.json');

const resolveTsx = () => {
  try {
    return require.resolve('tsx/cli');
  } catch {
    return 'tsx';
  }
};

const result = spawnSync(
  process.execPath,
  [resolveTsx(), '--tsconfig', tsconfig, entrypoint, ...process.argv.slice(2)],
  { stdio: 'inherit', cwd: packageRoot }
);

process.exit(result.status ?? 1);
