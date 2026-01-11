#!/bin/bash

# navigate to project root (where .env.development lives)
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"

docker run -d \
  --name voice-postgres-dev \
  --env-file "$PROJECT_ROOT/.env.development" \
  -p 5433:5432 \
  postgres:16-alpine
