#!/bin/bash

set -e

# build client static files
./build.sh

./copy-static-files-to-nginx.sh

# restart serverside: express + socket.io server and coturn server
./restart-voice-app.sh

./reload-nginx.sh

echo "🚀 Deployment complete!"
