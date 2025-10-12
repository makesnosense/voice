#!/bin/bash
set -e

SCRIPT_DIR="$(dirname "$0")"
PROJECT_ROOT="$SCRIPT_DIR/.."

cd "$PROJECT_ROOT"

docker run --rm \
  -v .:/app \
  -w /app/client \
  node:alpine \
  sh -c "npm ci && npm run build"

echo "✅ build complete"
