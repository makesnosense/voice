#!/bin/bash
set -e

SCRIPT_DIR="$(dirname "$0")"
NGINX_FOLDER="$SCRIPT_DIR/../../nginx-on-vps"

# reload nginx config (don't restart nginx, just reload)
echo "🔄 reloading nginx..."
cd "$NGINX_FOLDER"
docker exec nginx-on-vps nginx -s reload
echo "✅ nginx reloaded"
