#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT_DIR="$(cd "$SCRIPT_DIR/.." && pwd)"

cd "$ROOT_DIR"

CONFIG_ENV="${1:-default}"
echo "Deploying with config env: $CONFIG_ENV"

# Ensure build is up to date
echo "Building..."
"$SCRIPT_DIR/build.sh"

sam deploy --config-env "$CONFIG_ENV"

echo "Deploy complete. Check stack outputs for ApiUrl and ItemsTableName."
