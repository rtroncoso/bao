import cliProgress from 'cli-progress';
import program from 'commander';
import core from '@mob/core';

import packageJson from '../package.json';

const progress = new cliProgress.SingleBar(
  { etaBuffer: 1000 },
  cliProgress.Presets.shades_classic
);

program
  .version(packageJson.version)
  .name('convert')
  .usage('[global options]')
  .option('-d, --debug', 'Show additional debug info')
  .option('-i, --input <input>', 'Add path or file(s) as input for script')
  .option('-o, --output <output>', 'Add path as output for script')
  .action(async (dir, cmd) => {
    try {
      const debug = program.debug || false;
      const input = program.input;

    } catch (ex) {
      console.error(
        `\x1b[31m[convert script] error while running convert script:`,
        ex.message ? ex.message : ex,
        '\x1b[0m'
      );

      process.exit(1);
    }
  });

program.parse(process.argv);
