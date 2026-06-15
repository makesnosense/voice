#!/bin/bash
set -e

SCRIPT_DIR="$(dirname "$0")"
PROJECT_ROOT="$SCRIPT_DIR/.."

DEV_CERT_PATH="$PROJECT_ROOT/mobile/android/app/src/main/res/raw/dev_cert.crt"

MKCERT_CA_ROOT="$(mkcert -CAROOT)"

mkdir -p "$(dirname "$DEV_CERT_PATH")"
cp "$MKCERT_CA_ROOT/rootCA.pem" "$DEV_CERT_PATH"


echo "✅ mobile dev cert issued — rebuild the app to apply"
