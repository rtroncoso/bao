#!/usr/bin/env bash

set -Eeuo pipefail

APP_DIR="${APP_DIR:-/var/www/bao}"
BRANCH="${BRANCH:-develop}"

cd "${APP_DIR}"

echo "Fetching ${BRANCH}..."
git fetch origin "${BRANCH}"
git checkout "${BRANCH}"
git reset --hard "origin/${BRANCH}"

echo "Using repository Node and pnpm versions..."
corepack enable
corepack prepare pnpm@9.12.0 --activate

node --version
pnpm --version

if [[ ! -f .env ]]; then
  echo "Missing ${APP_DIR}/.env"
  exit 1
fi

echo "Installing dependencies..."
pnpm install --frozen-lockfile

echo "Building workspace..."
pnpm --filter='!@bao/client' build

echo "Applying database migrations..."
pnpm db:migrate

echo "Starting/reloading services..."
pm2 startOrReload \
  infra/vps/ecosystem.config.cjs \
  --update-env

pm2 save

echo "Validating local services..."
sleep 5
curl \
  --fail \
  --silent \
  --show-error \
  --retry 10 \
  --retry-delay 2 \
  http://127.0.0.1:9000/healthcheck \
  >/dev/null

# The game server root may return a non-2xx response depending on Colyseus,
# so verify the port rather than assuming a specific HTTP route.
if ! ss -lnt | grep -qE '127\.0\.0\.1:7666|0\.0\.0\.0:7666|\*:7666'; then
  echo "bao-server is not listening on port 7666."
  pm2 logs bao-server --lines 100 --nostream
  exit 1
fi

sudo nginx -t
sudo systemctl reload nginx

echo "Deployment completed."
