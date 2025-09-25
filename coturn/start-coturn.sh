#!/bin/sh
set -e

echo "🚀 Starting COTURN with CLI arguments..."

exec turnserver \
  -n --log-file=stdout \
  --listening-port=$VITE_TURN_SERVER_PORT \
  --min-port=49152 --max-port=49172 \
  --use-auth-secret \
  --static-auth-secret="$COTURN_SECRET" \
  --realm="$VITE_TURN_SERVER_HOST" \
  --server-name="$VITE_TURN_SERVER_HOST" \
  --no-cli \
  --no-multicast-peers \
  --verbose