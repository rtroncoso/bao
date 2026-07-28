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

echo "Waiting for bao-server on port 7666..."

SERVER_READY=false

for attempt in {1..30}; do
  if ss -lntH 'sport = :7666' | grep -q .; then
    SERVER_READY=true
    break
  fi

  sleep 1
done

if [[ "$SERVER_READY" != "true" ]]; then
  echo "bao-server is not listening on port 7666 after 30 seconds."
  pm2 logs bao-server --lines 100 --nostream
  exit 1
fi

echo "bao-server is listening on port 7666."

sudo nginx -t
sudo systemctl reload nginx

echo "Deployment completed."
