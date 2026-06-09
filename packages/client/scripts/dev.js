const path = require('path');
const { spawn } = require('child_process');

require('dotenv').config({ path: path.resolve(__dirname, '../../../.env') });

const port = process.env.CLIENT_PORT || 3000;

spawn('next', ['dev', '-p', String(port)], {
  stdio: 'inherit',
  shell: true,
  cwd: path.resolve(__dirname, '..'),
});
