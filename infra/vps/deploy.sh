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
echo "Deployment completed."
