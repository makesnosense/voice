#!/bin/bash
set -e

SCRIPT_DIR="$(dirname "$0")"
PROJECT_ROOT="$SCRIPT_DIR/.."
CUSTOM_DEPLOYMENT_DIR="$PROJECT_ROOT/custom-deployment"


# load environment variables
source "$CUSTOM_DEPLOYMENT_DIR/.env.production"

cd "$PROJECT_ROOT"

docker run --rm \
  -v .:/app \
  -e VITE_TURN_SERVER_HOST=${VITE_TURN_SERVER_HOST} \
  -e VITE_TURN_SERVER_PORT=${VITE_TURN_SERVER_PORT} \
  -w /app/client \
  node:alpine \
  sh -c "cd /app/shared && npm ci && cd /app/client && npm ci && npm run build"

echo "✅ build complete"
