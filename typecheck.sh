#!/bin/bash
npx concurrently \
  --names "client,mobile,server" \
  -c "blue,green,yellow" \
  "cd client && tsc -b --watch --preserveWatchOutput" \
  "cd mobile && tsc -b --watch --preserveWatchOutput" \
  "cd server && tsc --noEmit --watch --preserveWatchOutput"
