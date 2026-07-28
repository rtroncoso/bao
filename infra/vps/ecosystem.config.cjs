module.exports = {
  apps: [
    {
      name: 'bao-api',
      cwd: '/var/www/bao',
      script: 'pnpm',
      args: '--filter @bao/api start:prod',
      interpreter: 'none',
      env: {
        NODE_ENV: 'production',
      },
      autorestart: true,
      max_restarts: 10,
      restart_delay: 3000,
      kill_timeout: 10000,
      time: true,
    },
    {
      name: 'bao-server',
      cwd: '/var/www/bao',
      script: 'pnpm',
      args: '--filter @bao/server start',
      interpreter: 'none',
      env: {
        NODE_ENV: 'production',
      },
      autorestart: true,
      max_restarts: 10,
      restart_delay: 3000,
      kill_timeout: 10000,
      time: true,
    },
  ],
}
