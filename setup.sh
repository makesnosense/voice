#!/bin/bash
set -e

# load environment variables
source .env

# get certs
docker run --rm -p 80:80 -v voice_certbot-conf:/etc/letsencrypt \
certbot/certbot certonly --standalone \
--email ${EMAIL} --agree-tos --no-eff-email --non-interactive -d ${DOMAIN}

# build frontend
docker run --rm \
     -v ./client:/app/client \
     -v ./shared:/app/shared \
     -v voice_client-dist:/app/dist \
     -e VITE_TURN_SERVER_HOST=${DOMAIN} \
     -e VITE_TURN_SERVER_PORT=${VITE_TURN_SERVER_PORT} \
     -w /app/client \
     node:alpine \
     sh -c "npm ci && npm run build && cp -r dist/* /app/dist/"
