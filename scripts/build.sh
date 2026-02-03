#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT_DIR="$(cd "$SCRIPT_DIR/.." && pwd)"

echo "$SCRIPT_DIR"
echo "$ROOT_DIR"

cd "$ROOT_DIR"

echo "Building Lambda layer (common)..."
(cd layers/common && npm install && npm run build)

echo "Building SAM application..."
# Ensure esbuild is on PATH (SAM looks for it when building TypeScript Lambdas)

# echo "$PATH"

export PATH="$ROOT_DIR/node_modules/.bin:$PATH"

# echo "$PATH"
sam build

echo "Build complete."
