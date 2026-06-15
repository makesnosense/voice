#!/bin/bash
set -e
SCRIPT_DIR="$(dirname "$0")"
PROJECT_ROOT="$SCRIPT_DIR/.."
CERTS_DIR="$PROJECT_ROOT/server/certs"
mkdir -p "$CERTS_DIR"
mkcert -key-file "$CERTS_DIR/localhost+1-key.pem" -cert-file "$CERTS_DIR/localhost+1.pem" localhost 127.0.0.1

#  give ownership back to the invoking user
if [ -n "$SUDO_USER" ]; then
  chown "$SUDO_USER" "$CERTS_DIR/localhost+1-key.pem" "$CERTS_DIR/localhost+1.pem"
fi

echo "✅ server dev certs generated — set SSL_KEY_PATH and SSL_CERT_PATH in .env.development:"
echo "SSL_KEY_PATH=$(realpath "$CERTS_DIR/localhost+1-key.pem")"
echo "SSL_CERT_PATH=$(realpath "$CERTS_DIR/localhost+1.pem")"
