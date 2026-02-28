FROM oven/bun:1-alpine AS builder

WORKDIR /app

COPY server/package*.json server/bun.lock* ./server/
COPY server/src/ ./server/src/ 
COPY shared ./shared/

WORKDIR /app/server

RUN bun install

RUN bun run build

FROM oven/bun:1-alpine AS runner

WORKDIR /app/

RUN addgroup -g 1001 -S nodejs && \
    adduser -S nodeapp -u 1001

COPY --from=builder /app/server/dist/server.js ./server.js
COPY server/drizzle/ ./drizzle/

RUN chown -R nodeapp:nodejs /app
USER nodeapp

CMD ["bun", "server.js"]
