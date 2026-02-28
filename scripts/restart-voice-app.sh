#!/bin/bash
set -e

SCRIPT_DIR="$(dirname "$0")"
CUSTOM_DEPLOYMENT_DIR="$SCRIPT_DIR/../custom-deployment"

cd "$CUSTOM_DEPLOYMENT_DIR"

echo "🔄 restarting voice app..."

docker compose down
docker compose build --no-cache
docker compose up -d

echo "✅ voice app restarted"
