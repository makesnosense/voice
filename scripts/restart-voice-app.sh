#!/bin/bash
set -e

SCRIPT_DIR="$(dirname "$0")"
CUSTOM_DEPLOYMENT_DIR="$SCRIPT_DIR/../custom-deployment"

cd "$CUSTOM_DEPLOYMENT_DIR"

echo "🔄 restarting voice app..."

docker compose down
docker compose up -d --build

echo "✅ voice app restarted"
