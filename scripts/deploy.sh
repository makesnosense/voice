#!/bin/bash

set -e

# ensure we're in the voice directory
cd "$(dirname "$0")/.."

# build client
./scripts/build.sh

# copy to nginx (relative to voice directory)
echo "📋 Copying static files to nginx..."
sudo cp -r client/dist/* ../nginx-on-vps/www/voice/

# restart voice app first (this directory)
echo "🔄 Restarting voice app..."
docker compose down
docker compose up -d --build

# reload nginx config (don't restart nginx, just reload)
echo "🔄 Reloading nginx..."
cd ../nginx-on-vps
docker exec nginx-on-vps nginx -s reload

echo "🚀 Deployment complete!"
