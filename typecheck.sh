#!/bin/bash
npx concurrently \
  --names "client,mobile,server" \
  -c "blue,green,yellow" \
  "cd client && tsc --noEmit --watch" \
  "cd mobile && tsc --noEmit --watch" \
  "cd server && tsc --noEmit --watch"
