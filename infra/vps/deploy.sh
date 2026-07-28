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


echo "Waiting for bao-api on port 9000..."
for i in {1..30}; do
  if curl \
      --fail \
      --silent \
      http://127.0.0.1:9000/colyseus \
      >/dev/null; then
    echo "bao-api is listening on port 9000."
    break
  fi

  if [[ "$i" -eq 30 ]]; then
    echo "Timed out waiting for bao-api."
    pm2 logs bao-api --lines 100 --nostream
    exit 1
  fi

  echo "Attempt $i/30..."
  sleep 2
done

echo "Waiting for bao-server on port 7666..."
for i in {1..30}; do
  if curl \
      --fail \
      --silent \
      http://127.0.0.1:7666/colyseus \
      >/dev/null; then
    echo "bao-server is listening on port 7666."
    break
  fi

  if [[ "$i" -eq 30 ]]; then
    echo "Timed out waiting for bao-server."
    pm2 logs bao-server --lines 100 --nostream
    exit 1
  fi

  echo "Attempt $i/30..."
  sleep 2
done

sudo nginx -t
sudo systemctl reload nginx

echo "Deployment completed."
