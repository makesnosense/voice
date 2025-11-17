#!/bin/sh
set -e

echo "🚀 Starting COTURN with CLI arguments..."

exec turnserver \
  -n --log-file=stdout \
  --listening-port=$VITE_TURN_SERVER_PORT \
  --min-port=49152 --max-port=65535 \
  --use-auth-secret \
  --static-auth-secret="$COTURN_SECRET" \
  --realm="$VITE_TURN_SERVER_HOST" \
  --server-name="$VITE_TURN_SERVER_HOST" \
  --no-cli \
  --no-multicast-peers \
  --verbose \
  --stale-nonce=600 \
  --max-allocate-lifetime=600 \
  --channel-lifetime=600 \
  --log-binding
