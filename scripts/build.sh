#!/bin/bash
# ensure we're in the voice directory
cd "$(dirname "$0")/.."

docker run --rm \
  -v .:/app \
  -w /app/client \
  node:alpine \
  sh -c "npm ci && npm run build"
