#!/usr/bin/env bash

set -Eeuo pipefail

APP_USER="${APP_USER:-bao}"
APP_DIR="${APP_DIR:-/var/www/bao}"
REPO_URL="${REPO_URL:-https://github.com/rtroncoso/bao.git}"
BRANCH="${BRANCH:-develop}"

if [[ "${EUID}" -ne 0 ]]; then
  echo "Run this script as root."
  exit 1
fi

export DEBIAN_FRONTEND=noninteractive

echo "Updating Ubuntu packages..."
apt-get clean
rm -rf /var/lib/apt/lists/*
apt-get update
apt-get upgrade -y

echo "Installing system packages..."
apt-get install -y \
  build-essential \
  ca-certificates \
  certbot \
  curl \
  git \
  mysql-server \
  nginx \
  openssl \
  python3-certbot-nginx \
  rsync \
  ufw

echo "Installing Node.js 22..."
curl -fsSL https://deb.nodesource.com/setup_22.x | bash -
apt-get install -y nodejs

echo "Enabling pnpm 9.12.0..."
corepack enable
corepack prepare pnpm@9.12.0 --activate

echo "Installing PM2..."
npm install --global pm2

if ! id "${APP_USER}" >/dev/null 2>&1; then
  useradd \
    --create-home \
    --shell /bin/bash \
    "${APP_USER}"
fi

mkdir -p "${APP_DIR}" /var/www/certbot

if [[ ! -d "${APP_DIR}/.git" ]]; then
  git clone \
    --branch "${BRANCH}" \
    --single-branch \
    "${REPO_URL}" \
    "${APP_DIR}"
fi

chown -R "${APP_USER}:${APP_USER}" "${APP_DIR}"
chown -R www-data:www-data /var/www/certbot

systemctl enable --now nginx
systemctl enable --now mysql

echo "Restricting MySQL to localhost..."
MYSQL_CONFIG="/etc/mysql/mysql.conf.d/mysqld.cnf"

if grep -Eq '^[[:space:]]*bind-address' "${MYSQL_CONFIG}"; then
  sed -i \
    's/^[[:space:]]*bind-address.*/bind-address = 127.0.0.1/' \
    "${MYSQL_CONFIG}"
else
  printf '\nbind-address = 127.0.0.1\n' >> "${MYSQL_CONFIG}"
fi

systemctl restart mysql

echo "Configuring firewall..."
ufw allow OpenSSH
ufw allow "Nginx Full"

# Remove rules that may have been created during manual setup.
ufw --force delete allow 3306/tcp 2>/dev/null || true
ufw --force delete allow 7666/tcp 2>/dev/null || true
ufw --force delete allow 9000/tcp 2>/dev/null || true

ufw --force enable

echo
echo "Base provisioning completed."
echo
echo "Next steps:"
echo "1. Create ${APP_DIR}/.env"
echo "2. Create the bao MySQL database and user"
echo "3. Install the Nginx configurations"
echo "4. Issue certificates"
echo "5. Run infra/vps/deploy.sh"
