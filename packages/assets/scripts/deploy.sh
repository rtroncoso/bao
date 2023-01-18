#!/usr/bin/env sh

set -e
set -x

exec node -r esm src/deploy.js "$@"
