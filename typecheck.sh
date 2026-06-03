#!/bin/bash
npx concurrently \
  --names "client,mobile,server" \
  -c "blue,green,yellow" \
  "cd client && tsc -b --watch" \
  "cd mobile && tsc -b --watch" \
  "cd server && tsc -b --watch"
