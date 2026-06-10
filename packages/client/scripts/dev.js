const fs = require('fs');
const path = require('path');
const { spawn } = require('child_process');

require('dotenv').config({ path: path.resolve(__dirname, '../../../.env') });

const clientRoot = path.resolve(__dirname, '..');
const nextDir = path.join(clientRoot, '.next');
const productionBuildId = path.join(nextDir, 'BUILD_ID');

// A production `next build` leaves BUILD_ID in .next. Running `next dev` against
// that output causes missing chunk errors (e.g. "Cannot find module ./631.js").
if (fs.existsSync(productionBuildId)) {
  console.warn(
    '[dev] Removing stale production .next output before starting the dev server'
  );
  fs.rmSync(nextDir, { recursive: true, force: true });
}

const port = process.env.PORT || 3000;
const nextBin = path.join(clientRoot, 'node_modules', '.bin', 'next');

spawn(nextBin, ['dev', '-p', String(port)], {
  stdio: 'inherit',
  shell: true,
  cwd: clientRoot
});
